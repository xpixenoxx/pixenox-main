import SupabaseProvider from '@/providers/SupabaseProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import FontProvider from '@/providers/FontProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { createClient } from '@/lib/supabase/server';
import type { 
  BrandSettings, 
  NavConfig, 
  FooterConfig, 
  FooterLink, 
  ThemeSetting 
} from '@/lib/types/database';

export const revalidate = 3600; // ISR: revalidate every hour

/* ── Convenience row types extracted from Database ── */
type BrandRow = BrandSettings;
type NavRow = NavConfig;
type FooterConfigRow = FooterConfig;
type FooterLinkRow = FooterLink;
type ThemeRow = ThemeSetting;

async function getLayoutData() {
  const supabase = await createClient();

  const [
    { data: themeSettings },
    { data: brandSettings },
    { data: navConfig },
    { data: footerConfig },
    { data: footerLinks },
  ] = await Promise.all([
    supabase.from('theme_settings').select('*'),
    supabase.from('brand_settings').select('*').limit(1).single(),
    supabase.from('nav_config').select('*').order('priority', { ascending: true }),
    supabase.from('footer_config').select('*').limit(1).single(),
    supabase.from('footer_links').select('*').order('priority', { ascending: true }),
  ]);

  return {
    themeSettings: (themeSettings ?? []) as ThemeRow[],
    brandSettings: (brandSettings ?? null) as BrandRow | null,
    navConfig: (navConfig ?? []) as NavRow[],
    footerConfig: (footerConfig ?? null) as FooterConfigRow | null,
    footerLinks: (footerLinks ?? []) as FooterLinkRow[],
  };
}

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    themeSettings,
    brandSettings,
    navConfig,
    footerConfig,
    footerLinks,
  } = await getLayoutData();

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
