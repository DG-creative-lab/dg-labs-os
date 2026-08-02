import { useEffect, useState } from 'react';
import {
  defaultTerminalSettings,
  parseTerminalSettings,
  serializeTerminalSettings,
  TERMINAL_SETTINGS_KEY,
  type TerminalSettings,
} from '../utils/terminalSettings';
import { useTerminalProviderHealth } from './useTerminalProviderHealth';

export function useTerminalSessionSettings() {
  const [byokApiKey, setByokApiKey] = useState('');
  const [settings, setSettings] = useState<TerminalSettings>(defaultTerminalSettings);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSettings(parseTerminalSettings(localStorage.getItem(TERMINAL_SETTINGS_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TERMINAL_SETTINGS_KEY, serializeTerminalSettings(settings));
    }
  }, [settings]);

  return {
    byokApiKey,
    setByokApiKey,
    settings,
    setSettings,
    providerHealth: useTerminalProviderHealth(settings, byokApiKey),
  };
}
