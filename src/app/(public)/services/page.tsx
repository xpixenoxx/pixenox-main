import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { ServiceCard } from '@/lib/types/database';
import AllServicesInteractive from './AllServicesInteractive';

export const metadata: Metadata = {
  title: 'Platform Capabilities — Pixenox',
  description: 'Explore our high-velocity engineering, unified optimization engines, and autonomous AI systems deployed at scale.',
};

export default async function ServicesHubPage() {
  const supabase = await createServerClient();
  
  const { data: serviceCards } = await supabase
    .from('services_cards')
    .select('*')
    .eq('is_visible', true)
    .order('priority', { ascending: true });

  const services = (serviceCards ?? []) as ServiceCard[];

  return <AllServicesInteractive services={services} />;
}
