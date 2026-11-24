import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import type { EngineeringCardPage } from '@/lib/types/database';
import CardDetailClient from './CardDetailClient';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string; cardSlug: string }>;
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function resolveCardPage(slug: string, cardSlug: string) {
  const supabase = createPublicSupabaseClient();

  const { data } = await supabase
    .from('engineering_card_pages')
    .select('*')
    .eq('service_slug', slug)
    .eq('card_slug', cardSlug)
    .limit(1)
    .maybeSingle();

  let pageData = data as EngineeringCardPage | null;

  if (!pageData) {
    const { data: serviceData } = await supabase
      .from('services_cards')
      .select('title, what_you_get_items')
      .eq('page_slug', slug)
      .eq('is_visible', true)
      .limit(1)
      .maybeSingle();

    if (serviceData && Array.isArray(serviceData.what_you_get_items)) {
      const matchedItem = (serviceData.what_you_get_items as any[]).find(
        (item) => item?.title && slugifyTitle(item.title) === cardSlug
      );

      if (matchedItem) {
        pageData = {
          id: 'fallback',
          service_slug: slug,
          card_slug: cardSlug,
          hero_title: matchedItem.title || 'Engineering Capability',
          hero_description: matchedItem.desc || '',
          hero_image_url: '',
          section2_name: 'Key Architecture & Capabilities',
          section2_description: '',
          section2_cards: [],
          section3_name: 'Key Functions',
          section3_description: '',
          section3_cards: [],
          section4_name: 'Key Outcomes',
          section4_description: '',
          section4_cards: [],
          section5_name: 'Related Research & Engineering Guides',
          section5_description: '',
          section5_blog_slugs: [],
        } as any;
      }
    }
  }

  let blogs: any[] = [];
  if (pageData && Array.isArray(pageData.section5_blog_slugs) && pageData.section5_blog_slugs.length > 0) {
    const cleanSlugs = pageData.section5_blog_slugs
      .map((s: any) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);

    if (cleanSlugs.length > 0) {
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('id, slug, title, date, excerpt, image_url, category')
        .eq('is_visible', true)
        .in('slug', cleanSlugs);

      if (blogData) {
        blogs = cleanSlugs.map((s) => blogData.find((b) => b.slug === s)).filter(Boolean);
      }
    }
  }

  return { pageData, blogs };
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createPublicSupabaseClient();
  const [{ data: cardRows }, { data: services }] = await Promise.all([
    supabase.from('engineering_card_pages').select('service_slug, card_slug'),
    supabase.from('services_cards').select('page_slug, what_you_get_items').eq('is_visible', true),
  ]);

  const seen = new Set<string>();
  const params: { slug: string; cardSlug: string }[] = [];

  for (const row of cardRows ?? []) {
    if (row.service_slug && row.card_slug) {
      const key = `${row.service_slug}/${row.card_slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ slug: row.service_slug, cardSlug: row.card_slug });
      }
    }
  }

  for (const srv of services ?? []) {
    if (!srv.page_slug || !Array.isArray(srv.what_you_get_items)) continue;
    for (const item of srv.what_you_get_items as { title?: string }[]) {
      const cs = item?.title ? slugifyTitle(item.title) : '';
      if (cs) {
        const key = `${srv.page_slug}/${cs}`;
        if (!seen.has(key)) {
          seen.add(key);
          params.push({ slug: srv.page_slug, cardSlug: cs });
        }
      }
    }
  }

  return params;
}

const CARD_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  'ai-systems/ai-infrastructure': {
    title: 'AI Infrastructure & Real-Time AI Observability',
    description:
      'Production AI infrastructure, low-latency LLM serving, hybrid retrieval, and real-time AI infrastructure visibility built for enterprise scale.',
  },
  'ai-systems/decision-intelligence': {
    title: 'Decision Intelligence & Causal AI Engines',
    description:
      'Context-aware decision intelligence engines turning enterprise telemetry into explainable, auditable real-time actions with human escalation.',
  },
  'ai-systems/autonomous-ai': {
    title: 'Autonomous AI Agents & Multi-Agent Governance',
    description:
      'Governed autonomous AI systems and multi-agent orchestration constrained by deterministic schemas, RBAC boundaries, and HITL checkpoints.',
  },
  'ai-systems/enterprise-intelligence': {
    title: 'Enterprise AI Integration & System of Action',
    description:
      'Overlay governed AI execution onto existing enterprise workflows, turning fragmented ERP and CRM records into a reliable system of action.',
  },
  'ai-visibility/geo-and-answer-engine-optimization': {
    title: 'GEO & Answer Engine Optimization (AEO) Services',
    description:
      'Generative Engine Optimization (GEO) and AEO built on clean SSR crawlability, extractable answers, and verifiable entity salience.',
  },
  'ai-visibility/structured-data-and-knowledge-graph-engineering': {
    title: 'Structured Data & Knowledge Graph Engineering',
    description:
      'Unified Schema.org @graph JSON-LD and Knowledge Graph entity engineering to clarify legal identity, products, and domain authority for LLMs.',
  },
  'ai-visibility/llm-content-architecture': {
    title: 'LLM Content Architecture & AI Retrieval SEO',
    description:
      'Semantic content architecture engineered for clean RAG retrieval and AI answer extraction with structured tables and verified source citations.',
  },
  'ai-visibility/ai-citation-monitoring': {
    title: 'AI Citation Monitoring: ChatGPT & Perplexity',
    description:
      'Track brand mentions, description accuracy, clickable citation URLs, and AI referrals across ChatGPT Search, Perplexity, Gemini, and Claude via Engenox.',
  },
  'enterprise-intelligence-engineering/data-platform-engineering': {
    title: 'Enterprise Data Platform & Modern CDC Pipelines',
    description:
      'Consolidate fragmented ETL scripts into Change Data Capture (CDC) pipelines and governed lakehouse platforms built to lower integration TCO.',
  },
  'enterprise-intelligence-engineering/business-intelligence-systems': {
    title: 'Enterprise BI Systems & Governed Semantic Layer',
    description:
      'Real-time multi-entity reporting powered by a governed semantic layer uniting operational KPIs for executives and enterprise AI agents.',
  },
  'enterprise-intelligence-engineering/enterprise-automation': {
    title: 'Enterprise Workflow Automation & Drift Control',
    description:
      'Eliminate execution drift across complex operating models by uniting enterprise APIs, idempotent event workers, and governed AI automation.',
  },
  'enterprise-intelligence-engineering/cloud-and-data-infrastructure': {
    title: 'Hybrid & Multi-Cloud Infrastructure Engineering',
    description:
      'Reduce cloud complexity across on-premises and public cloud environments with resilient Kubernetes, event streaming, and unified data backbones.',
  },
  'enterprise-intelligence-engineering/custom-software-and-platform-engineering': {
    title: 'Enterprise Platform Convergence & SaaS Systems',
    description:
      'Replace fragmented point tools with converged custom enterprise software platforms designed to evolve cleanly without recurring rewrites.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, cardSlug } = await params;
  const { pageData } = await resolveCardPage(slug, cardSlug);

  if (!pageData) {
    return {
      title: 'Capability Not Found',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getCanonicalSiteUrl();
  const canonical = `${baseUrl}/engineering/${slug}/${cardSlug}`;
  const override = CARD_SEO_OVERRIDES[`${slug}/${cardSlug}`];
  const title = override?.title ?? `${(pageData.hero_title || 'Engineering Capability').trim().slice(0, 52)}`;
  const description = (
    override?.description ??
    pageData.hero_description ??
    `Explore Pixenox engineering architecture for ${cardSlug.replace(/-/g, ' ')}.`
  ).slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Pixenox`,
      description,
      url: canonical,
      images: pageData.hero_image_url ? [pageData.hero_image_url] : [],
    },
  };
}

export default async function EngineeringCardDetailPage({ params }: PageProps) {
  const { slug, cardSlug } = await params;
  const { pageData, blogs } = await resolveCardPage(slug, cardSlug);

  if (!pageData) {
    notFound();
  }

  const baseUrl = getCanonicalSiteUrl();
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Engineering', item: `${baseUrl}/engineering` },
      { '@type': 'ListItem', position: 3, name: slug.replace(/-/g, ' '), item: `${baseUrl}/engineering/${slug}` },
      { '@type': 'ListItem', position: 4, name: pageData.hero_title, item: `${baseUrl}/engineering/${slug}/${cardSlug}` },
    ],
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pageData.hero_title,
    description: pageData.hero_description,
    provider: { '@id': `${baseUrl}/#organization` },
    url: `${baseUrl}/engineering/${slug}/${cardSlug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <CardDetailClient slug={slug} cardSlug={cardSlug} page={pageData} blogs={blogs} />
    </>
  );
}
