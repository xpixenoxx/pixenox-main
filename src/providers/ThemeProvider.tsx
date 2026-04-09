'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import { applyThemeToDocument, applySingleThemeProp } from '@/lib/theme';
import type { ThemeSetting } from '@/lib/types/database';

interface ThemeContextValue {
  settings: Record<string, string>;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  settings: {},
  isLoaded: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  initialSettings?: ThemeSetting[];
}

export default function ThemeProvider({ children, initialSettings }: ThemeProviderProps) {
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (initialSettings) {
      for (const s of initialSettings) {
        map[s.key] = s.value;
      }
    }
    return map;
  });
  const [isLoaded, setIsLoaded] = useState(!!initialSettings?.length);

  const applyAll = useCallback((settingsMap: Record<string, string>) => {
    const pairs = Object.entries(settingsMap).map(([key, value]) => ({
      key,
      value,
    }));
    applyThemeToDocument(pairs);
  }, []);

  useEffect(() => {
    // Fetch on mount if no initial settings
    async function loadTheme() {
      const { data } = await supabase
        .from('theme_settings')
        .select('*');
      if (data) {
        const map: Record<string, string> = {};
        for (const row of data as ThemeSetting[]) {
          map[row.key] = row.value;
        }
        setSettings(map);
        applyAll(map);
        setIsLoaded(true);
      }
    }

    if (!initialSettings?.length) {
      loadTheme();
    } else {
      applyAll(settings);
    }

    // Subscribe to Realtime changes
    const channel = supabase
      .channel('theme_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'theme_settings' },
        (payload) => {
          const row = payload.new as ThemeSetting | undefined;
          if (row && row.key && row.value) {
            setSettings((prev) => ({ ...prev, [row.key]: row.value }));
            applySingleThemeProp(row.key, row.value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}
