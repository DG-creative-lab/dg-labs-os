import { useEffect, useState } from 'react';
import {
  defaultTerminalSettings,
  parseTerminalSettings,
  serializeTerminalSettings,
  TERMINAL_SETTINGS_KEY,
  type TerminalLlmProvider,
  type TerminalSettings,
} from '../utils/terminalSettings';
import { BYOK_STORAGE_KEY } from './terminalTypes';
import { useTerminalProviderHealth } from './useTerminalProviderHealth';

export function useTerminalSessionSettings() {
  const [byokApiKey, setByokApiKey] = useState('');
  const [rememberByok, setRememberByok] = useState(false);
  const [settings, setSettings] = useState<TerminalSettings>(defaultTerminalSettings);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSettings(parseTerminalSettings(localStorage.getItem(TERMINAL_SETTINGS_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(BYOK_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<Record<TerminalLlmProvider, string>>;
      const existing =
        (typeof parsed.openrouter === 'string' && parsed.openrouter.trim()) ||
        (typeof parsed.openai === 'string' && parsed.openai.trim()) ||
        (typeof parsed.anthropic === 'string' && parsed.anthropic.trim()) ||
        (typeof parsed.gemini === 'string' && parsed.gemini.trim()) ||
        '';
      if (existing) setRememberByok(true);
    } catch {
      localStorage.removeItem(BYOK_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TERMINAL_SETTINGS_KEY, serializeTerminalSettings(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!rememberByok) return;
    try {
      const raw = localStorage.getItem(BYOK_STORAGE_KEY);
      const parsed = raw
        ? (JSON.parse(raw) as Partial<Record<TerminalLlmProvider, string>>)
        : ({} as Partial<Record<TerminalLlmProvider, string>>);
      setByokApiKey(
        typeof parsed[settings.llmProvider] === 'string' ? parsed[settings.llmProvider]!.trim() : ''
      );
    } catch {
      localStorage.removeItem(BYOK_STORAGE_KEY);
      setByokApiKey('');
    }
  }, [rememberByok, settings.llmProvider]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!rememberByok) {
      localStorage.removeItem(BYOK_STORAGE_KEY);
      return;
    }
    try {
      const raw = localStorage.getItem(BYOK_STORAGE_KEY);
      const parsed = raw
        ? (JSON.parse(raw) as Partial<Record<TerminalLlmProvider, string>>)
        : ({} as Partial<Record<TerminalLlmProvider, string>>);
      parsed[settings.llmProvider] = byokApiKey.trim();
      localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      localStorage.removeItem(BYOK_STORAGE_KEY);
    }
  }, [rememberByok, settings.llmProvider, byokApiKey]);

  return {
    byokApiKey,
    setByokApiKey,
    rememberByok,
    setRememberByok,
    settings,
    setSettings,
    providerHealth: useTerminalProviderHealth(settings, byokApiKey),
  };
}
