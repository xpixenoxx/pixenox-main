import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

type SitemapEntry = MetadataRoute.Sitemap[number];

function cleanBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

function toDate(value?: string | null) {
  return value ? new Date(value) : new Date();
}

function isValidSlug(slug?: string | null) {
  return Boolean(slug && slug.trim().length > 0);
}

function removeDuplicateUrls(pages: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();

  return pages.filter((page) => {
    if (seen.has(page.url)) return false;
    seen.add(page.url);
    return true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = cleanBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.pixenox.com'
  );

  const supabase = await createClient();
  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // The 3 Core Niche Services get highest priority after homepage
    {
      url: `${baseUrl}/engineering/ai-systems`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/engineering/ai-visibility`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/engineering/enterprise-intelligence-engineering`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/engineering`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact/pixy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ── Dynamic: Service pages ────────────────────────────────────
  const { data: services } = await supabase
    .from('services_cards')
    .select('page_slug, updated_at')
    .eq('is_visible', true)
    .not('page_slug', 'is', null);

  const servicePages: MetadataRoute.Sitemap = (services ?? [])
    .filter((service) => isValidSlug(service.page_slug))
    .map((service): SitemapEntry => ({
      url: `${baseUrl}/engineering/${service.page_slug}`,
      lastModified: toDate(service.updated_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  // ── Dynamic: Case study / Work pages ──────────────────────────
  const { data: studies } = await supabase
    .from('case_studies')
    .select('slug, updated_at')
    .not('slug', 'is', null);

  const studyPages: MetadataRoute.Sitemap = (studies ?? [])
    .filter((study) => isValidSlug(study.slug))
    .map((study): SitemapEntry => ({
      url: `${baseUrl}/work/${study.slug}`,
      lastModified: toDate(study.updated_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  // ── Dynamic: Blog posts ───────────────────────────────────────
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published')
    .eq('published', true)
    .not('slug', 'is', null);

  const blogPages: MetadataRoute.Sitemap = (posts ?? [])
    .filter((post) => isValidSlug(post.slug))
    .map((post): SitemapEntry => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: toDate(post.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // ── Static: Hardcoded blog posts ──────────────────────────────
  const staticBlogSlugs = [
    'llmstxt-explained-the-emerging-standard-for-ai-crawler-access-and-when-your-site',
    '-architecting-for-ai-first-multi-regional-traffic-rebuilding-enterprise-web-infr',
    'understanding-bio-intelligence-the-next-layer-of-human-performance-data',
    '-ai-citation-monitoring-how-to-track-whether-chatgpt-perplexity-and-other-llms-m',
    'decision-intelligence-is-replacing-traditional-business-intelligence',
    'the-production-readiness-gap-a-technical-maturity-framework-for-ai-systems-befor',
    'technical-seo-for-ai-search-building-websites-ai-can-understand',
    'engineering-production-grade-ai-systems-architecture-lessons-from-real-world-dep',
    'ai-visibility-why-traditional-seo-isnt-enough-for-ai-search',
    'the-semantic-layer-is-becoming-enterprise-infrastructure',
    'enterprise-business-intelligence-systems-after-the-dashboard-era',
    'off-page-ai-consensus-graphs-why-backlinks-dont-trigger-citations-and-how-llms-v',
    'beyond-etl-engineering-enterprise-data-platforms-that-scale-with-business-growth',
    'open-weights-or-proprietary-api-the-real-math-behind-enterprise-llm-deployment',
    'semantic-seo-for-ai-search-why-meaning-matters-more-than-keywords',
    'how-erp-helps-business-save-time',
    'ai-retrieval-optimization-how-to-make-your-content-discoverable-by-large-languag',
    'why-modern-businesses-need-more-than-just-a-website',
    'how-scalable-web-architecture-helps-businesses-grow-faster',
    'why-cloud-infrastructure-is-the-backbone-of-modern-digital-business',
    'why-bigger-context-windows-are-making-enterprise-ai-less-reliable-and-how-to-fix',
    'the-mechanics-of-ai-query-fan-out-reverse-engineering-how-generative-search-deco',
    'how-ai-systems-are-changing-the-way-businesses-work',
    'why-seo-aeo-and-geo-matter-for-modern-business-growth',
    'geo-and-answer-engine-optimization-how-ai-search-is-changing-digital-visibility',
    'structured-data-vs-knowledge-graphs-why-ai-needs-both-to-understand-your-busines',
    'current-ai-search-modernization-trends-every-business-should-prepare-for-in-2026',
    'the-rise-of-autonomous-ai-systems-what-enterprises-need-to-know',
    'building-a-data-infrastructure-that-doesnt-break-at-scale',
    'from-fragmented-tools-to-unified-platforms-the-case-for-convergence',
    'growth-intelligence-the-framework-behind-10x-campaigns',
    'the-founders-guide-to-hiring-your-first-ai-engineer',
    'how-pixenox-reduced-client-churn-by-60-with-a-single-platform-decision',
    'beyond-vector-databases-engineering-stateful-long-term-memory-for-enterprise-aut',
    'how-digital-transformation-is-changing-every-industry',
    'when-enterprise-operations-stop-behaving-predictably',
    'why-enterprise-software-becomes-difficult-to-change',
    'seo-in-the-age-of-generative-ai-why-geo-is-the-new-frontier',
    'what-indian-startups-get-wrong-about-custom-software-development',
    'infrastructure-doesnt-become-fragile-it-becomes-difficult-to-change',
    'nextjs-16-vs-remix-which-framework-wins-for-enterprise-in-2026',
    'why-cloud-complexity-isnt-a-cloud-problem',
    'the-hidden-cost-of-integration-why-enterprise-systems-become-increasingly-connec'
  ];

  const staticBlogPages: MetadataRoute.Sitemap = staticBlogSlugs.map((slug): SitemapEntry => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return removeDuplicateUrls([
    ...staticPages,
    ...servicePages,
    ...studyPages,
    ...blogPages,
    ...staticBlogPages,
  ]);
}