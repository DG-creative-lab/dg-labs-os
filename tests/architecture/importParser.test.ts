import { describe, expect, it } from 'vitest';
import {
  extractAstroCodeRegions,
  parseModuleSpecifiers,
} from '../../scripts/architecture/import-parser.mjs';

describe('architecture import parser', () => {
  it('captures side-effect and type imports as separate AST nodes', () => {
    const parsed = parseModuleSpecifiers(
      'fixture.ts',
      ["import '../../services/side-effect';", "import type { X } from '../../config/x';"].join(
        '\n'
      )
    );

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.specifiers).toEqual(['../../services/side-effect', '../../config/x']);
  });

  it('captures exports, dynamic imports, and CommonJS requires', () => {
    const parsed = parseModuleSpecifiers(
      'fixture.ts',
      [
        "export { value } from './exported';",
        "const dynamic = import('./dynamic');",
        "const legacy = require('./legacy');",
      ].join('\n')
    );

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.specifiers).toEqual(['./exported', './dynamic', './legacy']);
  });

  it('parses Astro frontmatter and executable script blocks explicitly', () => {
    const astro = [
      '---',
      "import Layout from '../layouts/Layout.astro';",
      '---',
      '<Layout />',
      '<p>import fake from "../must-not-be-parsed";</p>',
      '<script>',
      "import '../services/client-side-effect';",
      '</script>',
      '<script type="application/ld+json">{"import":"../not-code"}</script>',
    ].join('\n');
    const regions = extractAstroCodeRegions(astro);
    const parsed = parseModuleSpecifiers('fixture.astro', astro);

    expect(regions.map((region) => region.name)).toEqual(['frontmatter.ts', 'script-1.ts']);
    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.specifiers).toEqual([
      '../layouts/Layout.astro',
      '../services/client-side-effect',
    ]);
  });
});
