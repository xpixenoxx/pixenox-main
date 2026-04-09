import { createClient as createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CaseStudyClient from './CaseStudyClient';
import type { Metadata } from 'next';
import type { CaseStudy, WorkTag } from '@/lib/types/database';
import './slug.css';


interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.from('case_studies').select('title, short_description, cover_image_url').eq('slug', slug).limit(1).single();
  const study = data as Pick<CaseStudy, 'title' | 'short_description' | 'cover_image_url'> | null;

  return {
    title: study?.title ? `${study.title} — Pixenox` : 'Case Study — Pixenox',
    description: study?.short_description ?? '',
    openGraph: {
      title: study?.title ?? '',
      description: study?.short_description ?? '',
      images: study?.cover_image_url ? [study.cover_image_url] : [],
    },
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const [{ data: study }, { data: tags }] = await Promise.all([
    supabase.from('case_studies').select('*').eq('slug', slug).limit(1).single(),
    supabase.from('work_tags').select('*').order('priority', { ascending: true }),
  ]);

  const caseStudy = study as CaseStudy | null;
  const workTags = (tags ?? []) as WorkTag[];

  if (!caseStudy) {
    return (
      <div className="work-detail section">
        <div className="container" style={{ textAlign: 'center', paddingTop: '120px' }}>
          <h1>Project Not Found</h1>
          <p style={{ margin: '16px 0 32px' }}>The case study you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/work" className="btn-primary" style={{ display: 'inline-flex' }}>
            Back to Work
          </Link>
        </div>
      </div>
    );
  }

  return <CaseStudyClient caseStudy={caseStudy} workTags={workTags} />;
}
