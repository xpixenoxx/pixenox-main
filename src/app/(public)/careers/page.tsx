import type { Metadata } from 'next';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import type { SeoConfig } from '@/lib/types/database';
import { FALLBACK_ROLES, type JobRole } from './fallback-jobs';
import CareersPageClient from './CareersPageClient';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'careers').limit(1).maybeSingle();
  const seo = data as SeoConfig | null;
  const baseUrl = getCanonicalSiteUrl();

  const title = seo?.title?.replace(/\s*\|\s*Pixenox\s*$/i, '').trim() || 'Careers at Pixenox Solutions — Build Production AI Systems';
  const description =
    seo?.description ||
    'Join PIXENOX SOLUTIONS PRIVATE LIMITED to engineer production autonomous AI systems, enterprise intelligence pipelines, and AI visibility platforms (Engenox & Unool).';

  return {
    title,
    description,
    keywords: seo?.keywords ?? ['Pixenox careers', 'AI systems engineer jobs India', 'Next.js engineer jobs', 'Enterprise AI careers'],
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: `${baseUrl}/careers`,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
    },
    alternates: { canonical: seo?.canonical_url || `${baseUrl}/careers` },
  };
}

export default async function CareersPage() {
  const baseUrl = getCanonicalSiteUrl();
  const supabase = createPublicSupabaseClient();

  const { data } = await (supabase.from('careers') as any)
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const roles: JobRole[] = data && data.length > 0 ? (data as JobRole[]) : FALLBACK_ROLES;

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}/careers#careers`,
    url: `${baseUrl}/careers`,
    name: 'Careers at Pixenox Solutions Private Limited',
    publisher: { '@id': `${baseUrl}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: roles.map((r, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: r.title,
        url: `${baseUrl}/careers/${r.id}`,
      })),
    },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Careers', item: `${baseUrl}/careers` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <CareersPageClient initialRoles={roles} />
    </>
  );
}
