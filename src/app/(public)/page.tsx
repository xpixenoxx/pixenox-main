import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import HeroSection from '@/components/home/HeroSection';
import dynamic from 'next/dynamic';

const ServicesSection = dynamic(() => import('@/components/home/ServicesSection'));
const CaseStudiesSection = dynamic(() => import('@/components/home/CaseStudiesSection'));
const WhyChooseUs = dynamic(() => import('@/components/home/WhyChooseUs'));
const CtaBanner = dynamic(() => import('@/components/home/CtaBanner'));
const FeedbackSection = dynamic(() => import('@/components/home/FeedbackSection'));
const HomeFaqsSection = dynamic(() => import('@/components/home/HomeFaqsSection'));

import type { Metadata } from 'next';
import type { Database } from '@/lib/types/database';
import type {
  HeroSettings,
  ServiceCard,
  ServicesLayout,
  CardTool,
  SectionConfig,
  CaseStudy,
  WorkTag,
  WhyChooseUsConfig,
  WhyChooseUsItem,
  Testimonial,
  SeoConfig,
  HomeFaq,
} from '@/lib/types/database';

const getPublicClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const getCachedSeo = unstable_cache(
  async () => {
    const supabase = getPublicClient();
    const res = await supabase
      .from('seo_config')
      .select('*')
      .eq('page', 'home')
      .limit(1)
      .maybeSingle();

    if (res.error && res.error.code !== 'PGRST116') {
      console.error("Supabase query failed:", {
        table: "seo_config",
        message: res.error.message,
        details: res.error.details,
        hint: res.error.hint,
        code: res.error.code,
      });
      throw new Error("Failed to fetch seo_config");
    }

    return (res.data ?? null) as SeoConfig | null;
  },
  ['home-seo'],
  { revalidate: 60, tags: ['seo'] }
);

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCachedSeo();

  return {
    title: seo?.title ?? 'Pixenox — AI Systems, AI Visibility & Enterprise Intelligence Engineering',
    description: seo?.description ?? 'Pixenox engineers autonomous AI systems, enterprise intelligence platforms, and AI visibility (GEO/AEO) solutions. Production-grade AI infrastructure for enterprises.',
    keywords: seo?.keywords ?? [
      'AI systems engineering',
      'enterprise intelligence engineering',
      'AI visibility',
      'generative engine optimization',
      'GEO',
      'AEO',
      'autonomous AI',
      'pixenox',
    ],
    openGraph: {
      title: seo?.title ?? 'Pixenox — AI Systems, AI Visibility & Enterprise Intelligence Engineering',
      description: seo?.description ?? 'Pixenox engineers autonomous AI systems, enterprise intelligence platforms, and AI visibility (GEO/AEO) solutions.',
      images: seo?.og_image ? [seo.og_image] : [],
    },
    alternates: {
      canonical: seo?.canonical ?? '/',
    },
  };
}

const getCachedHomeData = unstable_cache(
  async () => {
    const supabase = getPublicClient();

    const [
      heroRes,
      servicesCardsRes,
      servicesLayoutRes,
      cardToolsRes,
      servicesConfigRes,
      caseStudiesConfigRes,
      caseStudiesRes,
      workTagsRes,
      whyConfigRes,
      whyItemsRes,
      testimonialsRes,
      homeFaqsRes,
    ] = await Promise.all([
      supabase.from('hero_settings').select('*').limit(1).maybeSingle(),
      supabase.from('services_cards').select('*').order('priority', { ascending: true }),
      supabase.from('services_layout').select('*').limit(1).maybeSingle(),
      supabase.from('card_tools').select('*'),
      supabase.from('section_config').select('*').eq('section_key', 'services').limit(1).maybeSingle(),
      supabase.from('section_config').select('*').eq('section_key', 'case_studies').limit(1).maybeSingle(),
      supabase.from('case_studies').select('*').eq('is_featured', true).order('priority', { ascending: true }),
      supabase.from('work_tags').select('*').order('priority', { ascending: true }),
      supabase.from('why_choose_us_config').select('*').limit(1).maybeSingle(),
      supabase.from('why_choose_us').select('*').order('priority', { ascending: true }),
      supabase.from('testimonials').select('*').eq('is_visible', true).order('priority', { ascending: true }),
      supabase.from('home_faqs').select('*').eq('is_visible', true).order('priority', { ascending: true }),
    ]);

    const results = [
      { name: 'hero_settings', res: heroRes },
      { name: 'services_cards', res: servicesCardsRes },
      { name: 'services_layout', res: servicesLayoutRes },
      { name: 'card_tools', res: cardToolsRes },
      { name: 'section_config (services)', res: servicesConfigRes },
      { name: 'section_config (case_studies)', res: caseStudiesConfigRes },
      { name: 'case_studies', res: caseStudiesRes },
      { name: 'work_tags', res: workTagsRes },
      { name: 'why_choose_us_config', res: whyConfigRes },
      { name: 'why_choose_us', res: whyItemsRes },
      { name: 'testimonials', res: testimonialsRes },
      { name: 'home_faqs', res: homeFaqsRes },
    ];

    for (const { name, res } of results) {
      if (res.error && res.error.code !== 'PGRST116') {
        console.error("Supabase query failed:", {
          table: name,
          message: res.error.message,
          details: res.error.details,
          hint: res.error.hint,
          code: res.error.code,
        });
        throw new Error(`Failed to fetch ${name}`);
      }
    }

    return {
      hero: (heroRes.data ?? null) as HeroSettings | null,
      servicesCards: (servicesCardsRes.data ?? []) as ServiceCard[],
      servicesLayout: (servicesLayoutRes.data ?? null) as ServicesLayout | null,
      cardTools: (cardToolsRes.data ?? []) as CardTool[],
      servicesConfig: (servicesConfigRes.data ?? null) as SectionConfig | null,
      caseStudiesConfig: (caseStudiesConfigRes.data ?? null) as SectionConfig | null,
      caseStudies: (caseStudiesRes.data ?? []) as CaseStudy[],
      workTags: (workTagsRes.data ?? []) as WorkTag[],
      whyConfig: (whyConfigRes.data ?? null) as WhyChooseUsConfig | null,
      whyItems: (whyItemsRes.data ?? []) as WhyChooseUsItem[],
      testimonials: (testimonialsRes.data ?? []) as Testimonial[],
      homeFaqs: (homeFaqsRes.data ?? []) as HomeFaq[],
    };
  },
  ['home-data'],
  { revalidate: 60, tags: ['home'] }
);

export const revalidate = 60;

export default async function HomePage() {
  const start = Date.now();
  const data = await getCachedHomeData();
  const dataTime = Date.now() - start;
  console.log(`[Timing] / (Home) - Data fetch: ${dataTime}ms`);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pixenox.com';

  // ProfessionalService JSON-LD for homepage (GEO/AEO entity signal)
  const professionalServiceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${baseUrl}/#professional-service`,
    name: 'Pixenox',
    description: 'Pixenox engineers autonomous AI systems, enterprise intelligence platforms, and AI visibility (Generative Engine Optimization) solutions for enterprises.',
    url: baseUrl,
    priceRange: '$$$$',
    areaServed: 'Worldwide',
    serviceType: [
      'AI Systems Engineering',
      'Enterprise Intelligence Engineering',
      'AI Visibility — Generative Engine Optimization',
    ],
    hasOfferingCatalog: {
      '@type': 'OfferCatalog',
      name: 'Engineering Disciplines',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'AI Systems Engineering',
          description: 'Autonomous multi-agent systems, decision intelligence engines, and AI infrastructure engineering.',
          url: `${baseUrl}/engineering/ai-systems`,
        },
        {
          '@type': 'OfferCatalog',
          name: 'Enterprise Intelligence Engineering',
          description: 'Unified data platforms, systems integration, cloud infrastructure, and business intelligence engineering.',
          url: `${baseUrl}/engineering/enterprise-intelligence-engineering`,
        },
        {
          '@type': 'OfferCatalog',
          name: 'AI Visibility (GEO/AEO)',
          description: 'Generative Engine Optimization, Answer Engine Optimization, structured data engineering, knowledge graph engineering, and AI citation monitoring.',
          url: `${baseUrl}/engineering/ai-visibility`,
        },
      ],
    },
  };

  // BreadcrumbList for homepage (AEO navigation signal)
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
    ],
  };

  return (
    <>
      {/* GEO/AEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <HeroSection initialData={data.hero} />
      <ServicesSection
        initialCards={data.servicesCards}
        initialLayout={data.servicesLayout}
        initialTools={data.cardTools}
        initialConfig={data.servicesConfig}
      />
      <CtaBanner
        heading="Your Systems Should Work as One"
        subheading="AI, data, infrastructure, and growth — converged into unified platforms that compound in value. Stop integrating. Start converging."
        ctaText="Architect Your System"
        ctaHref="#free-audit"
      />
      <CaseStudiesSection
        initialStudies={data.caseStudies}
        initialConfig={data.caseStudiesConfig}
        initialTags={data.workTags}
      />
      <WhyChooseUs
        initialConfig={data.whyConfig}
        initialItems={data.whyItems}
      />
      <FeedbackSection initialTestimonials={data.testimonials} />
      <HomeFaqsSection initialFaqs={data.homeFaqs} />
    </>
  );
}
