export type ParsedImports = {
  specifiers: string[];
  diagnostics: string[];
};

export function extractAstroCodeRegions(content: string): Array<{ name: string; content: string }>;

export function parseModuleSpecifiers(fileName: string, content: string): ParsedImports;
