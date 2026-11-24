import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import { unstable_cache } from 'next/cache';
import type { Metadata } from 'next';
import type { ServiceCard, SeoConfig } from '@/lib/types/database';
import AllServicesInteractive from './AllServicesInteractive';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'engineering').limit(1).maybeSingle();
  const seo = data as SeoConfig | null;
  const baseUrl = getCanonicalSiteUrl();

  const title =
    seo?.title?.replace(/\s*\|\s*Pixenox\s*$/i, '').trim() ||
    'Engineering Capabilities — AI Systems, GEO & Data Platforms';
  const description =
    seo?.description ||
    'Three specialized engineering pillars: Production AI Systems, AI Visibility (GEO/AEO) powered by Engenox, and Enterprise Intelligence data unification.';

  return {
    title,
    description,
    keywords: seo?.keywords ?? [
      'AI systems engineering',
      'AI visibility engineering',
      'enterprise intelligence engineering',
      'Engenox',
    ],
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: `${baseUrl}/engineering`,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
    },
    alternates: { canonical: seo?.canonical_url || `${baseUrl}/engineering` },
  };
}

const getCachedServicesData = unstable_cache(
  async () => {
    const supabase = createPublicSupabaseClient();
    const [{ data: servicesData }, { data: heroData }] = await Promise.all([
      supabase
        .from('services_cards')
        .select('*')
        .eq('is_visible', true)
        .order('priority', { ascending: true }),
      supabase
        .from('page_hero_config')
        .select('*')
        .eq('page', 'services')
        .limit(1)
        .maybeSingle(),
    ]);

    if (!servicesData) {
      throw new Error('Failed to fetch services_cards');
    }

    return {
      services: servicesData as ServiceCard[],
      heroConfig: heroData,
    };
  },
  ['engineering-data-v2'],
  { revalidate: 3600, tags: ['engineering'] }
);

// ISR: revalidate every hour
export const revalidate = 3600;

export default async function ServicesHubPage() {
  const start = Date.now();
  const { services, heroConfig } = await getCachedServicesData();
  const dataTime = Date.now() - start;
  console.log(`[Timing] /engineering - Data fetch: ${dataTime}ms`);

  const baseUrl = getCanonicalSiteUrl();

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}/engineering#collection`,
    url: `${baseUrl}/engineering`,
    name: 'Pixenox Engineering Capabilities',
    description:
      'Pixenox enterprise engineering disciplines: Production AI Systems, AI Visibility Engineering (GEO & AEO), and Enterprise Intelligence Engineering.',
    publisher: { '@id': `${baseUrl}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: services
        .filter((s) => Boolean(s.page_slug))
        .map((s, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: s.title,
          url: `${baseUrl}/engineering/${s.page_slug}`,
        })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${baseUrl}/engineering` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <AllServicesInteractive services={services} heroConfig={heroConfig} />
    </>
  );
}
