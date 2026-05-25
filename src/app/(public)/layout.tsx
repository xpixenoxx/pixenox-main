import SupabaseProvider from '@/providers/SupabaseProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import FontProvider from '@/providers/FontProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Database } from '@/lib/types/database';
import type { 
  BrandSettings, 
  NavConfig, 
  FooterConfig, 
  FooterLink, 
  ThemeSetting 
} from '@/lib/types/database';

/* ── Convenience row types extracted from Database ── */
type BrandRow = BrandSettings;
type NavRow = NavConfig;
type FooterConfigRow = FooterConfig;
type FooterLinkRow = FooterLink;
type ThemeRow = ThemeSetting;

const getPublicClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const getCachedLayoutData = unstable_cache(
  async () => {
    const supabase = getPublicClient();

    const [
      themeRes,
      brandRes,
      navRes,
      footerRes,
      linksRes,
    ] = await Promise.all([
      supabase.from('theme_settings').select('*'),
      supabase.from('brand_settings').select('*').limit(1).single(),
      supabase.from('nav_config').select('*').order('priority', { ascending: true }),
      supabase.from('footer_config').select('*').limit(1).single(),
      supabase.from('footer_links').select('*').order('priority', { ascending: true }),
    ]);

    const results = [
      { name: 'theme_settings', res: themeRes },
      { name: 'brand_settings', res: brandRes },
      { name: 'nav_config', res: navRes },
      { name: 'footer_config', res: footerRes },
      { name: 'footer_links', res: linksRes },
    ];

    for (const { name, res } of results) {
      if (res.error && res.error.code !== 'PGRST116') {
        console.error("Supabase query failed:", {
          table: name,
          message: res.error.message,
          details: res.error.details,
          hint: res.error.hint,
          code: res.error.code,
        });
        throw new Error(`Failed to fetch ${name}`);
      }
    }

    return {
      themeSettings: (themeRes.data ?? []) as ThemeRow[],
      brandSettings: (brandRes.data ?? null) as BrandRow | null,
      navConfig: (navRes.data ?? []) as NavRow[],
      footerConfig: (footerRes.data ?? null) as FooterConfigRow | null,
      footerLinks: (linksRes.data ?? []) as FooterLinkRow[],
    };
  },
  ['layout-data'],
  { revalidate: 3600, tags: ['layout'] }
);

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const start = Date.now();
  const {
    themeSettings,
    brandSettings,
    navConfig,
    footerConfig,
    footerLinks,
  } = await getCachedLayoutData();
  const dataTime = Date.now() - start;
  console.log(`[Timing] Layout - Data fetch: ${dataTime}ms`);


  return (
    <SupabaseProvider>
      <ThemeProvider initialSettings={themeSettings}>
        <FontProvider>
          <a href="#main-content" className="skip-nav">
            Skip to main content
          </a>
          <Header initialBrand={brandSettings} initialNav={navConfig} />
          <main id="main-content">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer
            initialConfig={footerConfig}
            initialLinks={footerLinks}
            initialBrand={brandSettings}
          />
        </FontProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}
