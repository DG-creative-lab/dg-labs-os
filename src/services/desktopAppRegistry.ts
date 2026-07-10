export const DESKTOP_APP_IDS = [
  'terminal',
  'network',
  'projects',
  'notes',
  'resume',
  'news',
] as const;

export type DesktopAppId = (typeof DESKTOP_APP_IDS)[number];
export type DesktopFocusedAppId = DesktopAppId | 'home';

export type DesktopAppWindowDefaults = {
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

export type DesktopAppDefinition = {
  id: DesktopAppId;
  label: string;
  route: string;
  aliases: readonly string[];
  window: DesktopAppWindowDefaults;
};

export const DESKTOP_APPS: Record<DesktopAppId, DesktopAppDefinition> = {
  terminal: {
    id: 'terminal',
    label: 'Agents Terminal',
    route: '/apps/terminal',
    aliases: ['agents'],
    window: { title: 'Agents Terminal', width: 920, height: 600, x: 80, y: 80 },
  },
  network: {
    id: 'network',
    label: 'Network',
    route: '/apps/network',
    aliases: [],
    window: { title: 'Network', width: 1080, height: 700, x: 70, y: 70 },
  },
  projects: {
    id: 'projects',
    label: 'Workbench',
    route: '/apps/projects',
    aliases: ['workbench'],
    window: { title: 'Workbench', width: 980, height: 680, x: 80, y: 80 },
  },
  notes: {
    id: 'notes',
    label: 'Lab Notes',
    route: '/apps/notes',
    aliases: [],
    window: { title: 'Lab Notes', width: 920, height: 640, x: 110, y: 95 },
  },
  resume: {
    id: 'resume',
    label: 'Resume',
    route: '/apps/resume',
    aliases: [],
    window: { title: 'Resume', width: 920, height: 660, x: 130, y: 110 },
  },
  news: {
    id: 'news',
    label: 'AI News Hub',
    route: '/apps/news',
    aliases: [],
    window: { title: 'AI News Hub', width: 780, height: 500, x: 150, y: 120 },
  },
};

export const DESKTOP_APP_ROUTES: Record<DesktopAppId, string> = Object.fromEntries(
  DESKTOP_APP_IDS.map((id) => [id, DESKTOP_APPS[id].route])
) as Record<DesktopAppId, string>;

export const DESKTOP_APP_TARGETS: Record<string, string> = {
  desktop: '/desktop',
  ...Object.fromEntries(
    DESKTOP_APP_IDS.flatMap((id) => [
      [id, DESKTOP_APPS[id].route],
      ...DESKTOP_APPS[id].aliases.map((alias) => [alias, DESKTOP_APPS[id].route]),
    ])
  ),
};
