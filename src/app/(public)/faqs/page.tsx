import type { Metadata } from 'next';
import Link from 'next/link';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import type { Faq, SeoConfig } from '@/lib/types/database';
import FaqsClient from './FaqsClient';
import '@/components/home/HomeFaqsSection.css';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from('seo_config').select('*').eq('page', 'faqs').limit(1).maybeSingle();
  const seo = data as SeoConfig | null;
  const baseUrl = getCanonicalSiteUrl();

  const title =
    seo?.title?.replace(/\s*\|\s*Pixenox\s*$/i, '').trim() ||
    'Engineering FAQs — AI Systems, GEO/AEO, Engenox & Delivery';
  const description =
    seo?.description ||
    'Direct engineering answers on production AI architecture, GEO/AEO crawler readiness, legacy ERP/CRM unification, Engenox OS, Unool, security, and project scoping.';

  return {
    title,
    description,
    keywords: seo?.keywords ?? ['AI systems engineering FAQ', 'GEO AEO FAQ', 'Engenox FAQ', 'Pixenox FAQ'],
    alternates: { canonical: seo?.canonical_url || `${baseUrl}/faqs` },
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: `${baseUrl}/faqs`,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
    },
  };
}

export default async function FaqsPage() {
  const supabase = createPublicSupabaseClient();
  const baseUrl = getCanonicalSiteUrl();

  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_visible', true)
    .order('priority', { ascending: true });

  const faqList = (faqs || []) as Faq[];

  const faqJsonLd =
    faqList.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqList.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'FAQs', item: `${baseUrl}/faqs` },
    ],
  };

  return (
    <div className="faq-page-main home-faqs-section pt-[180px] min-h-screen">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="Breadcrumb" style={{ maxWidth: '1427.58px', margin: '0 auto 24px', padding: '0 24px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
        <Link href="/" style={{ color: '#c4b5fd', textDecoration: 'none' }}>Home</Link>
        <span aria-hidden="true"> / </span>
        <span style={{ color: '#ffffff' }}>FAQs</span>
      </nav>
      <FaqsClient initialFaqs={faqList} />
    </div>
  );
}
