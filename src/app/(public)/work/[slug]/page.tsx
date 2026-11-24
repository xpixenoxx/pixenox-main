import { notFound } from 'next/navigation';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import CaseStudyClient from './CaseStudyClient';
import type { Metadata } from 'next';
import type { CaseStudy, WorkTag } from '@/lib/types/database';
import './slug.css';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from('case_studies')
    .select('slug')
    .not('slug', 'is', null);

  return (data ?? []).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from('case_studies')
    .select('title, short_description, cover_image_url')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  const study = data as Pick<CaseStudy, 'title' | 'short_description' | 'cover_image_url'> | null;
  if (!study) {
    return {
      title: 'Architecture Not Found',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getCanonicalSiteUrl();
  const desc = (study.short_description ?? '').slice(0, 160);

  return {
    title: `${study.title} — Reference Architecture`,
    description: desc,
    openGraph: {
      title: `${study.title} | Pixenox`,
      description: desc,
      images: study.cover_image_url ? [study.cover_image_url] : [],
      url: `${baseUrl}/work/${slug}`,
    },
    alternates: {
      canonical: `${baseUrl}/work/${slug}`,
    },
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();

  const [{ data: study }, { data: tags }] = await Promise.all([
    supabase.from('case_studies').select('*').eq('slug', slug).limit(1).maybeSingle(),
    supabase.from('work_tags').select('*').order('priority', { ascending: true }),
  ]);

  const caseStudy = study as CaseStudy | null;
  if (!caseStudy) {
    notFound();
  }

  const workTags = (tags ?? []) as WorkTag[];
  const baseUrl = getCanonicalSiteUrl();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${caseStudy.title} — Reference Architecture`,
    description: caseStudy.short_description,
    image: caseStudy.cover_image_url || undefined,
    author: [
      { '@id': `${baseUrl}/#founder-sai-charan` },
      { '@id': `${baseUrl}/#founder-hemanth-sairam` },
    ],
    publisher: { '@id': `${baseUrl}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/work/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Reference Architectures', item: `${baseUrl}/work` },
      { '@type': 'ListItem', position: 3, name: caseStudy.title, item: `${baseUrl}/work/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CaseStudyClient caseStudy={caseStudy} workTags={workTags} />
    </>
  );
}
