import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import CompanyPageClient from './CompanyPageClient';
import type { Metadata } from 'next';
import type {
  PageHeroConfig,
  CompanyStory,
  WhatWeDoCard,
  HowWeThinkConfig,
  CoreBelief,
  CtaSection,
  SeoConfig,
} from '@/lib/types/database';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'company').limit(1).maybeSingle();
  const seo = data as SeoConfig | null;
  const baseUrl = getCanonicalSiteUrl();

  const rawTitle = seo?.title?.replace(/\s*\|\s*Pixenox\s*$/i, '').trim();
  const title = rawTitle && rawTitle.toLowerCase() !== 'about us'
    ? rawTitle
    : 'About Pixenox Solutions — Leadership, Mission & Products';
  const description =
    seo?.description && seo.description.length >= 70
      ? seo.description
      : 'Learn about PIXENOX SOLUTIONS PRIVATE LIMITED (India) — our founders, engineering principles, enterprise AI disciplines, and proprietary products Engenox and Unool.';

  return {
    title,
    description,
    keywords: seo?.keywords ?? [
      'Pixenox Solutions Private Limited',
      'AI engineering company India',
      'Engenox',
      'Unool',
      'Muchakarla Sai Charan',
      'Jagatha Hemanth Sai Ram',
    ],
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
      url: `${baseUrl}/company`,
    },
    alternates: {
      canonical: seo?.canonical_url || `${baseUrl}/company`,
    },
  };
}

export default async function CompanyPage() {
  const supabase = createPublicSupabaseClient();
  const baseUrl = getCanonicalSiteUrl();

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
    supabase.from('page_hero_config').select('*').eq('page', 'company').limit(1).maybeSingle(),
    supabase.from('company_story').select('*').limit(1).maybeSingle(),
    supabase.from('section_config').select('*').eq('section_key', 'company_story').limit(1).maybeSingle(),
    supabase.from('what_we_do_cards').select('*').eq('is_visible', true).order('priority', { ascending: true }),
    supabase.from('section_config').select('*').eq('section_key', 'disciplines').limit(1).maybeSingle(),
    supabase.from('how_we_think_config').select('*').limit(1).maybeSingle(),
    supabase.from('core_beliefs').select('*').eq('is_visible', true).order('priority', { ascending: true }),
    supabase.from('cta_sections').select('*').eq('section_key', 'lets_build').limit(1).maybeSingle(),
  ]);

  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${baseUrl}/company#about`,
    url: `${baseUrl}/company`,
    name: 'About Pixenox Solutions Private Limited',
    mainEntity: { '@id': `${baseUrl}/#organization` },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Company', item: `${baseUrl}/company` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
    </>
  );
}
