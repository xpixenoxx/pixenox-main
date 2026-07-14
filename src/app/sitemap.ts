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
      url: `${baseUrl}/contact`,
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
    'why-modern-businesses-need-more-than-just-a-website',
    'how-ai-systems-are-changing-the-way-businesses-work',
    'how-scalable-web-architecture-helps-businesses-grow-faster',
    'why-seo-aeo-and-geo-matter-for-modern-business-growth',
    'how-digital-transformation-is-changing-every-industry',
    'why-cloud-infrastructure-is-the-backbone-of-modern-digital-business',
    'how-web-architecture-shapes-your-brands-digital-presence-in-2026',
    'the-rise-of-autonomous-ai-systems-what-enterprises-need-to-know',
    'seo-in-the-age-of-generative-ai-why-geo-is-the-new-frontier',
    'building-a-data-infrastructure-that-doesnt-break-at-scale',
    'from-fragmented-tools-to-unified-platforms-the-case-for-convergence',
    'growth-intelligence-the-framework-behind-10x-campaigns',
    'what-indian-startups-get-wrong-about-custom-software-development',
    'understanding-bio-intelligence-the-next-layer-of-human-performance-data',
    'nextjs-16-vs-remix-which-framework-wins-for-enterprise-in-2026',
    'how-pixenox-reduced-client-churn-by-60-with-a-single-platform-decision',
    'the-founders-guide-to-hiring-your-first-ai-engineer'
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