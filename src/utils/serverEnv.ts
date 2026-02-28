export const getServerEnv = (key: string): string | undefined => {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return env?.[key] ?? process.env[key];
};

export const isServerDev = (): boolean => {
  const env = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
  if (typeof env?.DEV === 'boolean') return env.DEV;
  return process.env.NODE_ENV !== 'production';
};
