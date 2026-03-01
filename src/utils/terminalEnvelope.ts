import type { KnowledgeHit } from './terminalKnowledge';
import type { VerifySource } from './apiContracts';

export const buildAskEnvelopeLines = (
  grounding: readonly KnowledgeHit[],
  showSourceDetails: boolean,
  webContext?: { query: string; summary: string; sources: readonly VerifySource[] } | null
): string[] => {
  const lines: string[] = [
    '[local_context]',
    `- hits: ${grounding.length}`,
    '- scope: personal/workbench/notes/network index',
  ];

  if (grounding.length === 0) {
    lines.push('- citations: none matched');
  } else if (showSourceDetails) {
    lines.push(
      `- citations: ${grounding.map((item) => `${item.source}:${item.title}`).join(' | ')}`
    );
  } else {
    lines.push('- citations: hidden (toggle "Show LLM source footer" to view)');
  }

  lines.push('[web_context]');
  if (!webContext || webContext.sources.length === 0) {
    lines.push('- not used in ask mode');
    lines.push('- use `verify <query>` for web-grounded citations');
  } else {
    lines.push(`- last_verify_query: ${webContext.query}`);
    lines.push(`- last_verify_summary: ${webContext.summary}`);
    lines.push(`- last_verify_citations: ${webContext.sources.length}`);
  }

  return lines;
};

export const buildVerifyEnvelopeLines = (
  summary: string,
  sources: readonly VerifySource[]
): string[] => {
  const lines: string[] = [
    '[local_context]',
    '- not used in verify mode',
    '[web_context]',
    `- summary: ${summary}`,
    `- citations: ${sources.length}`,
  ];

  for (const [index, source] of sources.entries()) {
    lines.push(`${index + 1}. ${source.title}`);
    lines.push(`   ${source.url}`);
    lines.push(`   ${source.snippet}`);
  }

  return lines;
};
