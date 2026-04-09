'use client';

import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
const supabase = getBrowserClient();
import {
  buildGoogleFontsUrl,
  extractFontFamilies,
  extractFontFamiliesFromArray,
} from '@/lib/fonts';

const FONT_TABLES = [
  'theme_settings',
  'hero_settings',
  'section_config',
  'brand_settings',
  'services_cards',
  'cta_sections',
  'page_hero_config',
] as const;

export default function FontProvider({ children }: { children: ReactNode }) {
  const linkRef = useRef<HTMLLinkElement | null>(null);

  const loadFonts = useCallback(async () => {
    const allFonts: string[] = [];

    // Fetch font families from all relevant tables
    for (const table of FONT_TABLES) {
      try {
        const { data } = await supabase.from(table).select('*');
        if (data && Array.isArray(data)) {
          allFonts.push(
            ...extractFontFamiliesFromArray(
              data as Record<string, unknown>[]
            )
          );
        } else if (data && typeof data === 'object') {
          allFonts.push(
            ...extractFontFamilies(data as Record<string, unknown>)
          );
        }
      } catch {
        // Silently continue if table doesn't exist
      }
    }

    // Also extract from theme_settings values that are font families
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
      // Ignore
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

    // Subscribe to changes on all font-related tables
    const channels = FONT_TABLES.map((table) =>
      supabase
        .channel(`font_${table}_changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            // Debounce reload
            setTimeout(() => loadFonts(), 300);
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
      if (linkRef.current) {
        linkRef.current.remove();
      }
    };
  }, [loadFonts]);

  return <>{children}</>;
}
