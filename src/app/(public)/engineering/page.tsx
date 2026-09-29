import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Metadata } from 'next';
import type { Database } from '@/lib/types/database';
import type { ServiceCard } from '@/lib/types/database';
import AllServicesInteractive from './AllServicesInteractive';

export const metadata: Metadata = {
  title: 'Engineering Capabilities — AI Systems & Enterprise Intelligence',
  description: 'Pixenox engineering disciplines: AI Systems Engineering, Enterprise Intelligence Engineering, and AI Visibility (Generative Engine Optimization/GEO).',
  alternates: { canonical: '/engineering' },
};

const getPublicClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const getCachedServicesData = unstable_cache(
  async () => {
    const supabase = getPublicClient();
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
        .single()
    ]);

    if (!servicesData) {
      throw new Error("Failed to fetch services_cards");
    }

    return {
      services: servicesData as ServiceCard[],
      heroConfig: heroData
    };
  },
  ['engineering-data'],
  { revalidate: 3600, tags: ['engineering'] }
);

// ISR: revalidate every hour
export const revalidate = 3600;

export default async function ServicesHubPage() {
  const start = Date.now();
  const { services, heroConfig } = await getCachedServicesData();
  const dataTime = Date.now() - start;
  console.log(`[Timing] /engineering - Data fetch: ${dataTime}ms`);

  return <AllServicesInteractive services={services} heroConfig={heroConfig} />;
}
