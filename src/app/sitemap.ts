import type { MetadataRoute } from 'next';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_CONTENT_DATE = new Date('2026-11-24T00:00:00.000Z');
const LEGAL_CONTENT_DATE = new Date('2026-11-24T00:00:00.000Z');

function toSafeDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function isValidSlug(slug?: string | null): slug is string {
  return Boolean(slug && slug.trim().length > 0 && !slug.includes(' '));
}

function slugifyCardTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
  const baseUrl = getCanonicalSiteUrl();
  const supabase = createPublicSupabaseClient();

  // Core canonical static routes (stable lastModified — never new Date() on every request)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/engineering`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/engineering/ai-systems`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/engineering/ai-visibility`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/engineering/enterprise-intelligence-engineering`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/products/engenox`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact/pixy`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: LEGAL_CONTENT_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: LEGAL_CONTENT_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch all dynamic public entities in parallel (cookie-free public client)
  const [servicesRes, cardPagesRes, studiesRes, postsRes, careersRes] = await Promise.all([
    supabase
      .from('services_cards')
      .select('page_slug, updated_at, what_you_get_items')
      .eq('is_visible', true)
      .not('page_slug', 'is', null),
    supabase
      .from('engineering_card_pages')
      .select('service_slug, card_slug, updated_at'),
    supabase
      .from('case_studies')
      .select('slug, updated_at')
      .not('slug', 'is', null),
    supabase
      .from('blog_posts')
      .select('slug, created_at, date')
      .eq('is_visible', true)
      .not('slug', 'is', null),
    (supabase.from('careers') as any)
      .select('id, created_at')
      .eq('is_active', true),
  ]);

  if (postsRes.error) {
    console.error('[sitemap] Failed to query blog_posts:', postsRes.error.message);
  }

  const activeServiceSlugs = new Set<string>();
  const servicePages: MetadataRoute.Sitemap = (servicesRes.data ?? [])
    .filter((service) => isValidSlug(service.page_slug))
    .map((service): SitemapEntry => {
      activeServiceSlugs.add(service.page_slug);
      return {
        url: `${baseUrl}/engineering/${service.page_slug}`,
        lastModified: toSafeDate(service.updated_at) ?? STATIC_CONTENT_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      };
    });

  // Sub-capability pages under active services (both explicit DB rows and what_you_get_items)
  const capabilityPages: MetadataRoute.Sitemap = [];
  for (const row of cardPagesRes.data ?? []) {
    if (isValidSlug(row.service_slug) && isValidSlug(row.card_slug) && activeServiceSlugs.has(row.service_slug)) {
      capabilityPages.push({
        url: `${baseUrl}/engineering/${row.service_slug}/${row.card_slug}`,
        lastModified: toSafeDate(row.updated_at) ?? STATIC_CONTENT_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }
  for (const service of servicesRes.data ?? []) {
    if (!isValidSlug(service.page_slug) || !Array.isArray(service.what_you_get_items)) continue;
    for (const item of service.what_you_get_items as { title?: string }[]) {
      const cardSlug = item?.title ? slugifyCardTitle(item.title) : '';
      if (cardSlug) {
        capabilityPages.push({
          url: `${baseUrl}/engineering/${service.page_slug}/${cardSlug}`,
          lastModified: toSafeDate(service.updated_at) ?? STATIC_CONTENT_DATE,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
    }
  }

  const studyPages: MetadataRoute.Sitemap = (studiesRes.data ?? [])
    .filter((study) => isValidSlug(study.slug))
    .map((study): SitemapEntry => ({
      url: `${baseUrl}/work/${study.slug}`,
      lastModified: toSafeDate(study.updated_at) ?? STATIC_CONTENT_DATE,
      changeFrequency: 'monthly',
      priority: 0.75,
    }));

  const blogPages: MetadataRoute.Sitemap = ((postsRes.data ?? []) as { slug: string; created_at?: string | null; date?: string | null }[])
    .filter((post) => isValidSlug(post.slug))
    .map((post): SitemapEntry => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: toSafeDate(post.created_at) ?? toSafeDate(post.date) ?? STATIC_CONTENT_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  const careerPages: MetadataRoute.Sitemap = ((careersRes.data ?? []) as { id: string; created_at?: string | null }[])
    .filter((role) => Boolean(role?.id))
    .map((role): SitemapEntry => ({
      url: `${baseUrl}/careers/${role.id}`,
      lastModified: toSafeDate(role.created_at) ?? STATIC_CONTENT_DATE,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  return removeDuplicateUrls([
    ...staticPages,
    ...servicePages,
    ...capabilityPages,
    ...studyPages,
    ...blogPages,
    ...careerPages,
  ]);
}
