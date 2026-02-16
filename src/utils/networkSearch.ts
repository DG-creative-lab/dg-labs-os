import type { NetworkNode } from '../config/network';

export type KindFilter = 'ALL' | 'Org' | 'Project' | 'Idea';

const includesQuery = (haystack: string, q: string) => haystack.toLowerCase().includes(q);

export const filterNetworkNodes = (
  nodes: readonly NetworkNode[],
  filter: KindFilter,
  query: string
): NetworkNode[] => {
  const q = query.trim().toLowerCase();
  return nodes.filter((n) => {
    if (filter !== 'ALL' && n.kind !== filter) return false;
    if (!q) return true;
    const blob = [n.title, n.subtitle, n.period ?? '', n.tags.join(' '), n.bullets.join(' ')].join(
      '\n'
    );
    return includesQuery(blob, q);
  });
};
