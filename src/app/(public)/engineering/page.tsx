import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Metadata } from 'next';
import type { Database } from '@/lib/types/database';
import type { ServiceCard } from '@/lib/types/database';
import AllServicesInteractive from './AllServicesInteractive';

export const metadata: Metadata = {
  title: 'Platform Capabilities — Pixenox',
  description: 'Explore our high-velocity engineering, unified optimization engines, and autonomous AI systems deployed at scale.',
};

const getPublicClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function getServicesData() {
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
  }

export const dynamic = 'force-dynamic';

export default async function ServicesHubPage() {
  const start = Date.now();
  const { services, heroConfig } = await getServicesData();
  const dataTime = Date.now() - start;
  console.log(`[Timing] /engineering - Data fetch: ${dataTime}ms`);

  return <AllServicesInteractive services={services} heroConfig={heroConfig} />;
}
