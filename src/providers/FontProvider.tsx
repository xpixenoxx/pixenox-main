'use client';

import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import {
  buildGoogleFontsUrl,
} from '@/lib/fonts';

export default function FontProvider({ children }: { children: ReactNode }) {
  const linkRef = useRef<HTMLLinkElement | null>(null);

  const loadFonts = useCallback(async () => {
    const allFonts: string[] = [];

    // Single efficient query: only fetch font-related settings
    try {
      const { data: themeData } = await supabase
        .from('theme_settings')
        .select('key, value');
      if (themeData) {
        for (const row of themeData) {
          const r = row as { key: string; value: string };
          if (r.key.includes('font')) {
            allFonts.push(r.value);
          }
        }
      }
    } catch {
      // Silently continue
    }

    const url = buildGoogleFontsUrl(allFonts);
    if (!url) return;

    // Remove old link if exists
    if (linkRef.current) {
      linkRef.current.remove();
    }

    // Inject new combined Google Fonts link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    linkRef.current = link;
  }, []);

  useEffect(() => {
    loadFonts();

    // Subscribe to theme_settings changes only (the source of font config)
    const channel = supabase
      .channel('font_theme_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'theme_settings' },
        () => {
          setTimeout(() => loadFonts(), 300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (linkRef.current) {
        linkRef.current.remove();
      }
    };
  }, [loadFonts]);

  return <>{children}</>;
}
