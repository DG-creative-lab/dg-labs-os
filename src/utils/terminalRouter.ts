export type RoutedTerminalCommand = {
  command: string;
  confidence: number;
  reason: string;
};

const OPEN_TARGETS = ['projects', 'notes', 'resume', 'news', 'network', 'desktop', 'terminal'];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const includesAny = (text: string, patterns: readonly string[]): boolean =>
  patterns.some((pattern) => text.includes(pattern));

const targetFromText = (text: string): string | null =>
  OPEN_TARGETS.find((target) => text.includes(target)) ?? null;

export const routeNaturalLanguageCommand = (rawInput: string): RoutedTerminalCommand | null => {
  const input = normalize(rawInput);
  if (!input) return null;

  if (includesAny(input, ['help', 'commands', 'what can you do'])) {
    return { command: 'help', confidence: 0.98, reason: 'help intent phrase' };
  }

  if (includesAny(input, ['who am i', 'who are you', 'profile', 'about dg'])) {
    return { command: 'whoami', confidence: 0.94, reason: 'identity intent phrase' };
  }

  if (includesAny(input, ['what are you working on', 'current focus', 'what now', 'doing now'])) {
    return { command: 'now', confidence: 0.93, reason: 'current focus intent phrase' };
  }

  if (includesAny(input, ['sources', 'data sources', 'context sources'])) {
    return { command: 'sources', confidence: 0.92, reason: 'source intent phrase' };
  }

  if (includesAny(input, ['network summary', 'summarize network', 'show network stats'])) {
    return { command: 'network', confidence: 0.9, reason: 'network summary phrase' };
  }

  if (includesAny(input, ['resume', 'cv'])) {
    if (includesAny(input, ['open', 'go to', 'show page', 'take me to'])) {
      return { command: 'open resume', confidence: 0.9, reason: 'resume navigation phrase' };
    }
    return { command: 'resume', confidence: 0.85, reason: 'resume info phrase' };
  }

  if (includesAny(input, ['linkedin', 'github', 'email', 'phone', 'contact links'])) {
    return { command: 'links', confidence: 0.84, reason: 'links phrase' };
  }

  if (includesAny(input, ['list projects', 'show projects', 'projects list', 'project list'])) {
    return { command: 'projects', confidence: 0.88, reason: 'project listing phrase' };
  }

  if (input.startsWith('project ')) {
    const id = input.replace(/^project\s+/, '').trim();
    if (id) return { command: `project ${id}`, confidence: 0.95, reason: 'project id phrase' };
  }

  const openTarget = targetFromText(input);
  if (openTarget && includesAny(input, ['open', 'go to', 'take me to', 'show'])) {
    return { command: `open ${openTarget}`, confidence: 0.88, reason: 'navigation phrase' };
  }

  const searchPrefixes = ['search ', 'find ', 'look up ', 'lookup ', 'find me '];
  for (const prefix of searchPrefixes) {
    if (input.startsWith(prefix)) {
      const query = input.slice(prefix.length).trim();
      if (query)
        return { command: `search ${query}`, confidence: 0.9, reason: 'search prefix phrase' };
    }
  }

  const contextPrefixes = [
    'context ',
    'context on ',
    'what do we know about ',
    'what do you know about ',
  ];
  for (const prefix of contextPrefixes) {
    if (input.startsWith(prefix)) {
      const query = input.slice(prefix.length).trim();
      if (query)
        return { command: `context ${query}`, confidence: 0.9, reason: 'context lookup phrase' };
    }
  }

  return null;
};
