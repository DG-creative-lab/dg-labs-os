import type { ResumeViewModel } from './viewModel';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function formatResumeDate(value: string): string {
  const [year, month] = value.split('-');
  if (!month) return year;
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

function formatResumePeriod(startedAt: string, endedAt: string | null): string {
  return `${formatResumeDate(startedAt)} - ${endedAt ? formatResumeDate(endedAt) : 'Present'}`;
}

function markdownLink(label: string, url: string): string {
  return `[${label.replaceAll('[', '\\[').replaceAll(']', '\\]')}](${url})`;
}

export function renderResumeMarkdown(resume: ResumeViewModel): string {
  const lines: string[] = [
    `# ${resume.displayName}`,
    '',
    `**${resume.roleTitle}**`,
    '',
    [resume.location, ...resume.contact.map((item) => markdownLink(item.label, item.url))].join(
      ' · '
    ),
    '',
    '---',
    '',
    '## Summary',
    '',
    resume.summary,
    '',
    '## Technical Focus',
    '',
    ...resume.focusAreas.map((area) => `- **${area.label}:** ${area.detail}`),
    '',
    '## Selected Systems',
    '',
  ];

  for (const system of resume.selectedSystems) {
    lines.push(
      `### ${system.title}`,
      '',
      `_${system.classification} · ${markdownLink(system.link.label, system.link.url)}_`,
      '',
      ...system.bullets.map((bullet) => `- ${bullet}`),
      ''
    );
  }

  lines.push('## Experience', '');
  for (const item of resume.experience) {
    lines.push(
      `### ${item.title}`,
      '',
      `**${item.organisation}** · ${item.location} · ${formatResumePeriod(item.startedAt, item.endedAt)}`,
      '',
      ...item.bullets.map((bullet) => `- ${bullet}`),
      ''
    );
  }

  lines.push('## Education', '');
  for (const item of resume.education) {
    lines.push(
      `### ${item.qualification}`,
      '',
      `**${item.institution}** · ${formatResumePeriod(item.startedAt, item.endedAt)}`,
      ''
    );
  }

  return `${lines.join('\n').trim()}\n`;
}
