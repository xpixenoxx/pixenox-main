import { createClient as createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ServiceCard, CaseStudy } from '@/lib/types/database';
import ServiceAnimatedHeader from './ServiceAnimatedHeader';
import ServiceDetailSections from './ServiceDetailSections';
import './services-slug.css';
import './service-detail-sections.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('services_cards')
    .select('title, description, image_url')
    .eq('page_slug', slug)
    .limit(1)
    .single();
  const service = data as Pick<ServiceCard, 'title' | 'description' | 'image_url'> | null;

  return {
    title: service?.title ? `${service.title} — Pixenox` : 'Service — Pixenox',
    description: service?.description ?? '',
    openGraph: {
      title: service?.title ?? '',
      description: service?.description ?? '',
      images: service?.image_url ? [service.image_url] : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // Fetch the service details first
  const { data: serviceData } = await supabase
    .from('services_cards')
    .select('*')
    .eq('page_slug', slug)
    .limit(1)
    .single();

  const service = serviceData as ServiceCard | null;

  // Then fetch strictly matching related projects that contain the exact service title as a tag
  let relatedStudies: CaseStudy[] = [];
  if (service) {
    const { data: caseStudiesData } = await supabase
      .from('case_studies')
      .select('title, slug, cover_image_url, short_description, tags')
      .eq('status', 'published')
      .contains('tags', [service.title])
      .order('priority', { ascending: true })
      .limit(3);
    
    if (caseStudiesData) {
      relatedStudies = caseStudiesData as CaseStudy[];
    }
  }

  if (!service) {
    return (
      <div className="all-srv-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>404 MATRIX</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>Sector not found.</p>
          <Link href="/" className="all-srv-back">GO BACK</Link>
        </div>
      </div>
    );
  }

  let techStack = service.technology_stack || [];

  // Provide fallback AAA presentation mapping if no items are linked yet
  if (techStack.length === 0) {
    techStack = [
      'FRONTEND PLATFORMS (REACT / NEXT)',
      'BACKEND APIS & MICROSERVICES (NODE)',
      'MOBILE & CROSS-PLATFORM (FLUTTER)',
      'CI/CD & CLOUD OPS (DOCKER)'
    ] as any;
  }

  // Normalize tech items
  const normalizedTech = (techStack as any[]).map((item) =>
    typeof item === 'string' ? { name: item } : { name: item?.name || '', svg: item?.svg || undefined }
  );

  return (
    <article className="all-srv-page">
      {/* 100vh Premium Hero Banner Area */}
      <div className="all-srv-header-wrapper">
        <div className="all-srv-header-aurora" />

        <ServiceAnimatedHeader 
          title={service.title}
          description={service.description}
          titleColor={service.title_color}
          descColor={service.desc_color}
        />
      </div>

      {/* Premium Content Sections */}
      <ServiceDetailSections
        serviceTitle={service.title}
        serviceDescription={service.description}
        techStack={normalizedTech}
        relatedStudies={relatedStudies}
      />
    </article>
  );
}
