import { createClient as createServerClient } from '@/lib/supabase/server';
import CompanyPageClient from './CompanyPageClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import type {
  PageHeroConfig,
  CompanyStory,
  WhatWeDoCard,
  HowWeThinkConfig,
  CoreBelief,
  CtaSection,
  SeoConfig,
} from '@/lib/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'company').limit(1).single();
  const seo = data as SeoConfig | null;

  return {
    title: seo?.title ?? 'About Us — Pixenox',
    description: seo?.description ?? 'Learn about our mission, story, and values.',
    keywords: seo?.keywords ?? [],
    openGraph: {
      title: seo?.title ?? 'About Us — Pixenox',
      description: seo?.description ?? '',
      images: seo?.og_image ? [seo.og_image] : [],
    },
    alternates: { canonical: seo?.canonical ?? '/company' },
  };
}

export default async function CompanyPage() {
  const supabase = await createServerClient();

  const [
    { data: heroConfig },
    { data: story },
    { data: storyConfig },
    { data: whatWeDo },
    { data: disciplinesConfig },
    { data: howConfig },
    { data: beliefs },
    { data: ctaData },
  ] = await Promise.all([
    supabase.from('page_hero_config').select('*').eq('page', 'company').limit(1).single(),
    supabase.from('company_story').select('*').limit(1).single(),
    supabase.from('section_config').select('*').eq('section_key', 'company_story').limit(1).single(),
    supabase.from('what_we_do_cards').select('*').eq('is_visible', true).order('priority', { ascending: true }),
    supabase.from('section_config').select('*').eq('section_key', 'disciplines').limit(1).single(),
    supabase.from('how_we_think_config').select('*').limit(1).single(),
    supabase.from('core_beliefs').select('*').eq('is_visible', true).order('priority', { ascending: true }),
    supabase.from('cta_sections').select('*').eq('section_key', 'lets_build').limit(1).single(),
  ]);

  return (
    <CompanyPageClient
      heroConfig={(heroConfig ?? null) as PageHeroConfig | null}
      story={(story ?? null) as CompanyStory | null}
      storyConfig={storyConfig as any}
      whatWeDoCards={(whatWeDo ?? []) as WhatWeDoCard[]}
      disciplinesConfig={disciplinesConfig as any}
      howConfig={(howConfig ?? null) as HowWeThinkConfig | null}
      beliefs={(beliefs ?? []) as CoreBelief[]}
      ctaData={(ctaData ?? null) as CtaSection | null}
    />
  );
}
