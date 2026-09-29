import { createClient as createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ServiceCard, CaseStudy } from '@/lib/types/database';
import ServiceAnimatedHeader from './ServiceAnimatedHeader';
import ServiceDetailSections from './ServiceDetailSections';
import BlogExplainerPopup from '@/components/blog/BlogExplainerPopup';
import BlogFaqBot from '@/components/blog/BlogFaqBot';
import './services-slug.css';
import './service-detail-sections.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('services_cards')
    .select('page_slug')
    .eq('is_visible', true)
    .not('page_slug', 'is', null);

  return (data ?? []).map((s) => ({ slug: s.page_slug! }));
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pixenox.com';

  return {
    title: service?.title ? `${service.title}` : 'Service',
    description: service?.description ?? '',
    openGraph: {
      title: service?.title ?? '',
      description: service?.description ?? '',
      images: service?.image_url ? [service.image_url] : [],
    },
    alternates: {
      canonical: `${baseUrl}/engineering/${slug}`,
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pixenox.com';

  // Service JSON-LD for Google rich results
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'Pixenox Solutions Pvt Ltd',
      url: baseUrl,
    },
    url: `${baseUrl}/engineering/${slug}`,
    image: service.image_url || undefined,
  };

  // FAQPage JSON-LD if FAQs exist
  const faqJsonLd = service.faqs && Array.isArray(service.faqs) && service.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (service.faqs as { question: string; answer: string }[]).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <article className="all-srv-page">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* BreadcrumbList for AEO navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${baseUrl}/engineering` },
            { '@type': 'ListItem', position: 3, name: service.title, item: `${baseUrl}/engineering/${slug}` },
          ],
        }) }}
      />
      {/* 100vh Premium Hero Banner Area */}
      <div className="all-srv-header-wrapper">
        <div className="all-srv-header-aurora" />

        <ServiceAnimatedHeader 
          title={service.subheading || service.title}
          description={service.description}
          titleColor={service.subheading_color || service.title_color}
          descColor={service.desc_color}
          botNode={<BlogExplainerPopup slug={slug} source="service" />}
        />
      </div>

      {/* Premium Content Sections */}
      <ServiceDetailSections
        serviceTitle={service.title}
        serviceSlug={slug}
        serviceDescription={service.description}
        techStack={normalizedTech}
        relatedStudies={relatedStudies}
        capabilities={service.capabilities}
        faqs={service.faqs}
        whatYouGetHeading={service.what_you_get_heading}
        whatYouGetDescription={service.what_you_get_description}
        whatYouGetItems={service.what_you_get_items}
        faqBotNode={<BlogFaqBot slug={slug} source="service" />}
      />
    </article>
  );
}
