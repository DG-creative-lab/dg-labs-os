import fs from 'node:fs';
import path from 'node:path';
import { architectureManifest } from '../../architecture/manifest.mjs';

const root = process.cwd();
const baselinePath = path.join(root, 'architecture', 'dependency-baseline.json');
const sourceRoot = path.join(root, architectureManifest.sourceRoot);
const extensions = new Set(architectureManifest.sourceExtensions);
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

const toPosix = (value) => value.split(path.sep).join('/');
const relativeToRoot = (value) => toPosix(path.relative(root, value));

const walk = (directory) => {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else if (extensions.has(path.extname(entry.name))) files.push(target);
  }
  return files;
};

const resolveRelativeImport = (sourceFile, specifier) => {
  if (!specifier.startsWith('.')) return undefined;
  const raw = path.resolve(path.dirname(sourceFile), specifier.split('?')[0]);
  const candidates = [
    raw,
    ...architectureManifest.sourceExtensions.map((extension) => `${raw}${extension}`),
    ...architectureManifest.sourceExtensions.map((extension) =>
      path.join(raw, `index${extension}`)
    ),
  ];
  return candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
  );
};

const zoneFor = (file) =>
  architectureManifest.zones.find((zone) => zone.matches.some((pattern) => pattern.test(file)));

const sourceFiles = walk(sourceRoot).sort();
const graph = new Map();
const externalImports = new Map();

for (const absoluteFile of sourceFiles) {
  const sourceFile = relativeToRoot(absoluteFile);
  const content = fs.readFileSync(absoluteFile, 'utf8');
  const dependencies = new Set();
  const externals = new Set();
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];
    const resolved = resolveRelativeImport(absoluteFile, specifier);
    if (resolved && resolved.startsWith(sourceRoot)) dependencies.add(relativeToRoot(resolved));
    else if (!specifier.startsWith('.')) externals.add(specifier);
  }
  graph.set(sourceFile, dependencies);
  externalImports.set(sourceFile, externals);
}

const unassigned = sourceFiles
  .map(relativeToRoot)
  .filter((file) => !zoneFor(file))
  .map((file) => ({ file, message: 'Source file is not assigned to an architecture zone.' }));

const forbiddenEdges = [];
for (const [source, dependencies] of graph) {
  const sourceZone = zoneFor(source);
  if (!sourceZone) continue;
  for (const target of dependencies) {
    const targetZone = zoneFor(target);
    if (!targetZone) continue;
    if (!sourceZone.mayImport.includes(targetZone.id)) {
      forbiddenEdges.push({
        source,
        target,
        message: `${sourceZone.id} may not import ${targetZone.id}.`,
      });
    }
  }
}

const cycles = [];
const visiting = new Set();
const visited = new Set();
const stack = [];

const visitForCycles = (node) => {
  if (visiting.has(node)) {
    const start = stack.indexOf(node);
    const cycle = [...stack.slice(start), node];
    const key = cycle.slice(0, -1).sort().join('|');
    if (!cycles.some((candidate) => candidate.key === key)) cycles.push({ key, path: cycle });
    return;
  }
  if (visited.has(node)) return;
  visiting.add(node);
  stack.push(node);
  for (const dependency of graph.get(node) ?? []) visitForCycles(dependency);
  stack.pop();
  visiting.delete(node);
  visited.add(node);
};

for (const file of graph.keys()) visitForCycles(file);

const depthMemo = new Map();
const dependencyDepth = (node, trail = new Set()) => {
  if (trail.has(node)) return 0;
  if (depthMemo.has(node)) return depthMemo.get(node);
  const nextTrail = new Set(trail).add(node);
  const dependencies = [...(graph.get(node) ?? [])];
  const depth = dependencies.length
    ? 1 + Math.max(...dependencies.map((dependency) => dependencyDepth(dependency, nextTrail)))
    : 0;
  depthMemo.set(node, depth);
  return depth;
};

const internalEdgeCount = [...graph.values()].reduce((total, edges) => total + edges.size, 0);
const fanOut = [...graph.entries()].map(([file, edges]) => ({ file, count: edges.size }));
const maximumFanOut = Math.max(0, ...fanOut.map(({ count }) => count));
const deepest = [...graph.keys()]
  .map((file) => ({ file, depth: dependencyDepth(file) }))
  .sort((left, right) => right.depth - left.depth)[0] ?? { file: '', depth: 0 };
const graphDensity = Number((internalEdgeCount / Math.max(1, graph.size)).toFixed(4));

const criticalFanOutViolations = [];
for (const [file, maximum] of Object.entries(architectureManifest.criticalFanOut)) {
  const actual = graph.get(file)?.size;
  if (actual === undefined) {
    criticalFanOutViolations.push({ file, message: 'Critical module is missing from the graph.' });
  } else if (actual > maximum) {
    criticalFanOutViolations.push({
      file,
      message: `Critical fan-out ${actual} exceeds budget ${maximum}.`,
    });
  }
}

const baseline = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  : undefined;
const budgetViolations = [];
if (baseline) {
  if (graphDensity > baseline.maximumGraphDensity) {
    budgetViolations.push(
      `Graph density ${graphDensity} exceeds baseline budget ${baseline.maximumGraphDensity}.`
    );
  }
  if (maximumFanOut > baseline.maximumFanOut) {
    budgetViolations.push(
      `Maximum fan-out ${maximumFanOut} exceeds baseline budget ${baseline.maximumFanOut}.`
    );
  }
  if (deepest.depth > baseline.maximumDependencyDepth) {
    budgetViolations.push(
      `Dependency depth ${deepest.depth} exceeds baseline budget ${baseline.maximumDependencyDepth}.`
    );
  }
}

const report = {
  schemaVersion: architectureManifest.version,
  files: graph.size,
  internalEdges: internalEdgeCount,
  graphDensity,
  maximumFanOut,
  maximumDependencyDepth: deepest.depth,
  deepestFile: deepest.file,
  externalPackages: new Set([...externalImports.values()].flatMap((values) => [...values])).size,
  cycles: cycles.map((cycle) => cycle.path),
  forbiddenEdges,
  unassigned,
  criticalFanOutViolations,
  budgetViolations,
};

const failures = [
  ...unassigned,
  ...forbiddenEdges,
  ...cycles.map((cycle) => ({ message: `Dependency cycle: ${cycle.path.join(' -> ')}` })),
  ...criticalFanOutViolations,
  ...budgetViolations.map((message) => ({ message })),
];

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(
    [
      `Architecture ${report.schemaVersion}`,
      `Files: ${report.files}`,
      `Internal edges: ${report.internalEdges}`,
      `Graph density: ${report.graphDensity}`,
      `Maximum fan-out: ${report.maximumFanOut}`,
      `Maximum dependency depth: ${report.maximumDependencyDepth} (${report.deepestFile})`,
      `Cycles: ${report.cycles.length}`,
      `Forbidden edges: ${report.forbiddenEdges.length}`,
      `Unassigned files: ${report.unassigned.length}`,
      baseline ? 'Baseline: enforced' : 'Baseline: not configured',
    ].join('\n') + '\n'
  );
  for (const failure of failures) {
    const location = failure.file ?? failure.source ?? '';
    process.stderr.write(`- ${location}${location ? ': ' : ''}${failure.message}\n`);
  }
}

if (failures.length) process.exitCode = 1;
