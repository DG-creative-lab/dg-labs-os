import path from 'node:path';
import ts from 'typescript';

const scriptKindFor = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === '.tsx') return ts.ScriptKind.TSX;
  if (extension === '.jsx') return ts.ScriptKind.JSX;
  if (extension === '.js' || extension === '.mjs' || extension === '.cjs') {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
};

const parseCodeRegion = (fileName, sourceText) => {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName)
  );
  const specifiers = new Set();

  const addStringLiteral = (node) => {
    if (node && ts.isStringLiteralLike(node)) specifiers.add(node.text);
  };

  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addStringLiteral(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      addStringLiteral(node.moduleReference.expression);
    } else if (ts.isCallExpression(node) && node.arguments.length > 0) {
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === 'require';
      if (isDynamicImport || isRequire) addStringLiteral(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  const diagnostics = (sourceFile.parseDiagnostics ?? []).map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
  );
  return { specifiers, diagnostics };
};

export const extractAstroCodeRegions = (content) => {
  const regions = [];
  const frontmatter = content.match(/^\uFEFF?---[\t ]*\r?\n([\s\S]*?)\r?\n---(?:[\t ]*\r?\n|$)/);
  if (frontmatter) regions.push({ name: 'frontmatter.ts', content: frontmatter[1] });

  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptIndex = 0;
  for (const match of content.matchAll(scriptPattern)) {
    const attributes = match[1];
    const typeMatch = attributes.match(/\btype=["']([^"']+)["']/i);
    const type = typeMatch?.[1]?.toLowerCase();
    if (type && type !== 'module' && !type.includes('javascript') && !type.includes('typescript')) {
      continue;
    }
    scriptIndex += 1;
    regions.push({ name: `script-${scriptIndex}.ts`, content: match[2] });
  }
  return regions;
};

export const parseModuleSpecifiers = (fileName, content) => {
  const regions = fileName.endsWith('.astro')
    ? extractAstroCodeRegions(content)
    : [{ name: fileName, content }];
  const specifiers = new Set();
  const diagnostics = [];

  for (const region of regions) {
    const parsed = parseCodeRegion(region.name, region.content);
    parsed.specifiers.forEach((specifier) => specifiers.add(specifier));
    parsed.diagnostics.forEach((message) => diagnostics.push(`${region.name}: ${message}`));
  }

  return { specifiers: [...specifiers], diagnostics };
};
