import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import ContactPageClient from './ContactPageClient';
import type { Metadata } from 'next';
import type { Database } from '@/lib/types/database';
import type { ServiceCard, PageHeroConfig, SeoConfig } from '@/lib/types/database';

const getPublicClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const getCachedContactSeo = unstable_cache(
  async () => {
    const supabase = getPublicClient();
    const res = await supabase.from('seo_config').select('*').eq('page', 'contact').limit(1).single();
    
    if (res.error && res.error.code !== 'PGRST116') {
      console.error("Supabase query failed:", {
        table: "seo_config",
        message: res.error.message,
        details: res.error.details,
        hint: res.error.hint,
        code: res.error.code,
      });
      throw new Error("Failed to fetch contact seo");
    }
    return (res.data ?? null) as SeoConfig | null;
  },
  ['contact-seo'],
  { revalidate: 3600, tags: ['seo'] }
);

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCachedContactSeo();

  return {
    title: seo?.title ?? 'Contact Us — Pixenox',
    description: seo?.description ?? 'Get in touch with our team.',
    keywords: seo?.keywords ?? [],
    openGraph: {
      title: seo?.title ?? 'Contact Us — Pixenox',
      description: seo?.description ?? '',
    },
    alternates: { canonical: seo?.canonical ?? '/contact' },
  };
}

const getCachedContactData = unstable_cache(
  async () => {
    const supabase = getPublicClient();

    const [servicesRes, heroConfigRes] = await Promise.all([
      supabase.from('services_cards').select('id, title').order('priority', { ascending: true }),
      supabase.from('page_hero_config').select('*').eq('page', 'contact').limit(1).single(),
    ]);

    if (servicesRes.error) {
       console.error("Supabase query failed:", {
         table: "services_cards",
         message: servicesRes.error.message,
         details: servicesRes.error.details,
         hint: servicesRes.error.hint,
         code: servicesRes.error.code,
       });
       throw new Error("Failed to fetch services_cards for contact");
    }

    if (heroConfigRes.error && heroConfigRes.error.code !== 'PGRST116') {
       console.error("Supabase query failed:", {
         table: "page_hero_config",
         message: heroConfigRes.error.message,
         details: heroConfigRes.error.details,
         hint: heroConfigRes.error.hint,
         code: heroConfigRes.error.code,
       });
       throw new Error("Failed to fetch page_hero_config for contact");
    }

    return {
      services: (servicesRes.data ?? []) as ServiceCard[],
      heroConfig: (heroConfigRes.data ?? null) as PageHeroConfig | null,
    };
  },
  ['contact-data'],
  { revalidate: 3600, tags: ['contact'] }
);

export default async function ContactPage() {
  const data = await getCachedContactData();

  return (
    <ContactPageClient
      services={data.services}
      heroConfig={data.heroConfig}
    />
  );
}
