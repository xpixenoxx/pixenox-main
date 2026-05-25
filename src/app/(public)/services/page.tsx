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

const getCachedServices = unstable_cache(
  async () => {
    const supabase = getPublicClient();
    const res = await supabase
      .from('services_cards')
      .select('*')
      .eq('is_visible', true)
      .order('priority', { ascending: true });

    if (res.error) {
      console.error("Supabase query failed:", {
        table: "services_cards",
        message: res.error.message,
        details: res.error.details,
        hint: res.error.hint,
        code: res.error.code,
      });
      throw new Error("Failed to fetch services_cards");
    }

    return (res.data ?? []) as ServiceCard[];
  },
  ['services-page'],
  { revalidate: 3600, tags: ['services'] }
);

export const revalidate = 3600;

export default async function ServicesHubPage() {
  const start = Date.now();
  const services = await getCachedServices();
  const dataTime = Date.now() - start;
  console.log(`[Timing] /services - Data fetch: ${dataTime}ms`);

  return <AllServicesInteractive services={services} />;
}
