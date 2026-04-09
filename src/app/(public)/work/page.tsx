import { createClient as createServerClient } from '@/lib/supabase/server';
import WorkPageClient from './WorkPageClient';
import type { Metadata } from 'next';
import type { CaseStudy, WorkTag, PageHeroConfig, SeoConfig } from '@/lib/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'work').limit(1).single();
  const seo = data as SeoConfig | null;

  return {
    title: seo?.title ?? 'Our Work — Pixenox',
    description: seo?.description ?? 'Explore our portfolio of digital projects.',
    keywords: seo?.keywords ?? [],
    openGraph: {
      title: seo?.title ?? 'Our Work — Pixenox',
      description: seo?.description ?? '',
      images: seo?.og_image ? [seo.og_image] : [],
    },
    alternates: { canonical: seo?.canonical ?? '/work' },
  };
}

export default async function WorkPage() {
  const supabase = await createServerClient();

  const [
    { data: studies },
    { data: tags },
    { data: heroConfig },
  ] = await Promise.all([
    supabase.from('case_studies').select('*').order('priority', { ascending: true }),
    supabase.from('work_tags').select('*').order('priority', { ascending: true }),
    supabase.from('page_hero_config').select('*').eq('page', 'work').limit(1).single(),
  ]);

  return (
    <WorkPageClient
      studies={(studies ?? []) as CaseStudy[]}
      tags={(tags ?? []) as WorkTag[]}
      heroConfig={(heroConfig ?? null) as PageHeroConfig | null}
    />
  );
}
