import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import HeroSection from '@/components/home/HeroSection';
import dynamic from 'next/dynamic';

const ServicesSection = dynamic(() => import('@/components/home/ServicesSection'));
const CaseStudiesSection = dynamic(() => import('@/components/home/CaseStudiesSection'));
const WhyChooseUs = dynamic(() => import('@/components/home/WhyChooseUs'));
const LeadCaptureSection = dynamic(() => import('@/components/home/LeadCaptureSection'));
const CtaBanner = dynamic(() => import('@/components/home/CtaBanner'));
const FeedbackSection = dynamic(() => import('@/components/home/FeedbackSection'));

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
      .single();

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
    title: seo?.title ?? 'Pixenox — Unified Intelligent Systems',
    description: seo?.description ?? 'We architect converged platforms where AI, data, and growth systems operate as one intelligent layer.',
    keywords: seo?.keywords ?? [],
    openGraph: {
      title: seo?.title ?? 'Pixenox — Unified Intelligent Systems',
      description: seo?.description ?? 'We architect converged platforms where AI, data, and growth systems operate as one intelligent layer.',
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
    ] = await Promise.all([
      supabase.from('hero_settings').select('*').limit(1).single(),
      supabase.from('services_cards').select('*').order('priority', { ascending: true }),
      supabase.from('services_layout').select('*').limit(1).single(),
      supabase.from('card_tools').select('*'),
      supabase.from('section_config').select('*').eq('section_key', 'services').limit(1).single(),
      supabase.from('section_config').select('*').eq('section_key', 'case_studies').limit(1).single(),
      supabase.from('case_studies').select('*').eq('is_featured', true).order('priority', { ascending: true }),
      supabase.from('work_tags').select('*').order('priority', { ascending: true }),
      supabase.from('why_choose_us_config').select('*').limit(1).single(),
      supabase.from('why_choose_us').select('*').order('priority', { ascending: true }),
      supabase.from('testimonials').select('*').eq('is_visible', true).order('priority', { ascending: true }),
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
    };
  },
  ['home-data'],
  { revalidate: 60, tags: ['home'] }
);

export default async function HomePage() {
  const data = await getCachedHomeData();

  return (
    <>
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
      <LeadCaptureSection />
      <FeedbackSection initialTestimonials={data.testimonials} />
    </>
  );
}
