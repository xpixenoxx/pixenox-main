import { createClient as createServerClient } from '@/lib/supabase/server';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import CaseStudiesSection from '@/components/home/CaseStudiesSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import LeadCaptureSection from '@/components/home/LeadCaptureSection';
import CtaBanner from '@/components/home/CtaBanner';
import FeedbackSection from '@/components/home/FeedbackSection';
import type { Metadata } from 'next';
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

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('seo_config')
    .select('*')
    .eq('page', 'home')
    .limit(1)
    .single();

  const seo = data as SeoConfig | null;

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

async function getHomeData() {
  const supabase = await createServerClient();

  const [
    { data: hero },
    { data: servicesCards },
    { data: servicesLayout },
    { data: cardTools },
    { data: servicesConfig },
    { data: caseStudiesConfig },
    { data: caseStudies },
    { data: workTags },
    { data: whyConfig },
    { data: whyItems },
    { data: testimonials },
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

  return {
    hero: (hero ?? null) as HeroSettings | null,
    servicesCards: (servicesCards ?? []) as ServiceCard[],
    servicesLayout: (servicesLayout ?? null) as ServicesLayout | null,
    cardTools: (cardTools ?? []) as CardTool[],
    servicesConfig: (servicesConfig ?? null) as SectionConfig | null,
    caseStudiesConfig: (caseStudiesConfig ?? null) as SectionConfig | null,
    caseStudies: (caseStudies ?? []) as CaseStudy[],
    workTags: (workTags ?? []) as WorkTag[],
    whyConfig: (whyConfig ?? null) as WhyChooseUsConfig | null,
    whyItems: (whyItems ?? []) as WhyChooseUsItem[],
    testimonials: (testimonials ?? []) as Testimonial[],
  };
}

export default async function HomePage() {
  const data = await getHomeData();

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
