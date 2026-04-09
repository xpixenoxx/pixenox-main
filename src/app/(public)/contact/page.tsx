import { createClient as createServerClient } from '@/lib/supabase/server';
import ContactPageClient from './ContactPageClient';
import type { Metadata } from 'next';
import type { ServiceCard, PageHeroConfig, SeoConfig } from '@/lib/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'contact').limit(1).single();
  const seo = data as SeoConfig | null;

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

export default async function ContactPage() {
  const supabase = await createServerClient();

  const [{ data: services }, { data: heroConfig }] = await Promise.all([
    supabase.from('services_cards').select('id, title').order('priority', { ascending: true }),
    supabase.from('page_hero_config').select('*').eq('page', 'contact').limit(1).single(),
  ]);

  return (
    <ContactPageClient
      services={(services ?? []) as ServiceCard[]}
      heroConfig={(heroConfig ?? null) as PageHeroConfig | null}
    />
  );
}
