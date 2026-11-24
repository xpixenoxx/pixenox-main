import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import WorkPageClient from './WorkPageClient';
import type { Metadata } from 'next';
import type { CaseStudy, WorkTag, PageHeroConfig, SeoConfig } from '@/lib/types/database';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'work').limit(1).maybeSingle();
  const seo = data as SeoConfig | null;
  const baseUrl = getCanonicalSiteUrl();

  const title = seo?.title && seo.title.trim().toLowerCase() !== 'our work'
    ? seo.title.replace(/\s*\|\s*Pixenox\s*$/i, '')
    : 'Reference Architectures & Engineering Showcase';
  const description =
    seo?.description && seo.description.length >= 60
      ? seo.description
      : 'Explore Pixenox engineering reference architectures across production AI systems, real-time data streaming, and AI visibility (GEO/AEO) platforms.';

  return {
    title,
    description,
    keywords: seo?.keywords ?? [
      'AI reference architectures',
      'enterprise AI blueprints',
      'data platform architecture',
      'GEO AEO architecture',
      'Pixenox engineering',
    ],
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
      url: `${baseUrl}/work`,
    },
    alternates: {
      canonical: seo?.canonical_url || `${baseUrl}/work`,
    },
  };
}

export default async function WorkPage() {
  const supabase = createPublicSupabaseClient();
  const baseUrl = getCanonicalSiteUrl();

  const [
    { data: studies },
    { data: tags },
    { data: heroConfig },
  ] = await Promise.all([
    supabase.from('case_studies').select('*').order('priority', { ascending: true }),
    supabase.from('work_tags').select('*').order('priority', { ascending: true }),
    supabase.from('page_hero_config').select('*').eq('page', 'work').limit(1).maybeSingle(),
  ]);

  const studyList = (studies ?? []) as CaseStudy[];
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}/work#collection`,
    url: `${baseUrl}/work`,
    name: 'Pixenox Engineering Reference Architectures',
    publisher: { '@id': `${baseUrl}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: studyList.map((s, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: s.title,
        url: `${baseUrl}/work/${s.slug}`,
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Reference Architectures', item: `${baseUrl}/work` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <WorkPageClient
        studies={studyList}
        tags={(tags ?? []) as WorkTag[]}
        heroConfig={(heroConfig ?? null) as PageHeroConfig | null}
      />
    </>
  );
}
