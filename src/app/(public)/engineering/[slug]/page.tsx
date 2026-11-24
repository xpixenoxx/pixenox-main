import { notFound } from 'next/navigation';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import type { Metadata } from 'next';
import type { ServiceCard, CaseStudy } from '@/lib/types/database';
import ServiceAnimatedHeader from './ServiceAnimatedHeader';
import ServiceDetailSections from './ServiceDetailSections';
import BlogExplainerPopup from '@/components/blog/BlogExplainerPopup';
import BlogFaqBot from '@/components/blog/BlogFaqBot';
import './services-slug.css';
import './service-detail-sections.css';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const PILLAR_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  'ai-systems': {
    title: 'Production AI Systems & Multi-Agent Engineering',
    description:
      'Pixenox engineers governed multi-agent workflows, deterministic guardrails, decision intelligence, and production AI infrastructure built for enterprise reliability.',
  },
  'ai-visibility': {
    title: 'AI Visibility Engineering (GEO & AEO) for Enterprise',
    description:
      'Engineering-led Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), SSR crawler readiness, entity graphs, and AI citation monitoring — powered by Engenox.',
  },
  'enterprise-intelligence-engineering': {
    title: 'Enterprise Intelligence & Data Platform Engineering',
    description:
      'Unify fragmented ERP, CRM, cloud, and document systems without rip-and-replace. Pixenox builds CDC pipelines, governed semantic layers, and decision intelligence platforms.',
  },
};

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from('services_cards')
    .select('page_slug')
    .eq('is_visible', true)
    .not('page_slug', 'is', null);

  return (data ?? []).map((s) => ({ slug: s.page_slug! }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from('services_cards')
    .select('title, description, image_url')
    .eq('page_slug', slug)
    .eq('is_visible', true)
    .limit(1)
    .maybeSingle();

  const service = data as Pick<ServiceCard, 'title' | 'description' | 'image_url'> | null;
  if (!service) {
    return {
      title: 'Service Not Found',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getCanonicalSiteUrl();
  const override = PILLAR_SEO_OVERRIDES[slug];
  const resolvedTitle = override?.title ?? service.title;
  const resolvedDesc = (override?.description ?? service.description ?? '').slice(0, 160);

  return {
    title: resolvedTitle,
    description: resolvedDesc,
    openGraph: {
      title: `${resolvedTitle} | Pixenox`,
      description: resolvedDesc,
      images: service.image_url ? [service.image_url] : [],
      url: `${baseUrl}/engineering/${slug}`,
    },
    alternates: {
      canonical: `${baseUrl}/engineering/${slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data: serviceData } = await supabase
    .from('services_cards')
    .select('*')
    .eq('page_slug', slug)
    .eq('is_visible', true)
    .limit(1)
    .maybeSingle();

  const service = serviceData as ServiceCard | null;

  if (!service) {
    notFound();
  }

  let relatedStudies: CaseStudy[] = [];
  const { data: caseStudiesData } = await supabase
    .from('case_studies')
    .select('title, slug, cover_image_url, short_description, tags')
    .in('status', ['published', 'DEPLOYED', 'BLUEPRINT'])
    .contains('tags', [service.title])
    .order('priority', { ascending: true })
    .limit(3);

  if (caseStudiesData) {
    relatedStudies = caseStudiesData as CaseStudy[];
  }

  let techStack = service.technology_stack || [];
  if (techStack.length === 0) {
    techStack = [
      'FRONTEND PLATFORMS (REACT / NEXT)',
      'BACKEND APIS & MICROSERVICES (NODE)',
      'DATA & STREAMING (KAFKA / SNOWFLAKE)',
      'CI/CD & CLOUD OPS (DOCKER / K8S)',
    ] as any;
  }

  const normalizedTech = (techStack as any[]).map((item) =>
    typeof item === 'string'
      ? { name: item }
      : { name: item?.name || '', svg: item?.svg || undefined, image_url: item?.image_url || undefined }
  );

  const baseUrl = getCanonicalSiteUrl();
  const override = PILLAR_SEO_OVERRIDES[slug];

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: override?.title ?? service.title,
    description: override?.description ?? service.description,
    provider: {
      '@id': `${baseUrl}/#organization`,
    },
    url: `${baseUrl}/engineering/${slug}`,
    image: service.image_url || undefined,
    areaServed: ['IN', 'US', 'GB', 'AE', 'SG'],
  };

  const faqJsonLd =
    service.faqs && Array.isArray(service.faqs) && service.faqs.length > 0
      ? {
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
        }
      : null;

  return (
    <article className="all-srv-page">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
              { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${baseUrl}/engineering` },
              {
                '@type': 'ListItem',
                position: 3,
                name: override?.title ?? service.title,
                item: `${baseUrl}/engineering/${slug}`,
              },
            ],
          }),
        }}
      />

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
