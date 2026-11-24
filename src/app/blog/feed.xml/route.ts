import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import { sortBlogPostsByDate } from '@/lib/blog-utils';

export const revalidate = 3600;

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr?: string | null, fallbackIso?: string | null): string {
  const parsed = dateStr ? new Date(dateStr) : fallbackIso ? new Date(fallbackIso) : new Date('2026-11-24T00:00:00Z');
  return Number.isNaN(parsed.getTime()) ? new Date('2026-11-24T00:00:00Z').toUTCString() : parsed.toUTCString();
}

export async function GET() {
  const baseUrl = getCanonicalSiteUrl();
  const supabase = createPublicSupabaseClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, category, date, created_at')
    .eq('is_visible', true);

  const posts = sortBlogPostsByDate((data ?? []) as any[]).slice(0, 50);

  const itemsXml = posts
    .map((p) => {
      const url = `${baseUrl}/blog/${p.slug}`;
      return [
        '    <item>',
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${toRfc822(p.date, p.created_at)}</pubDate>`,
        p.category ? `      <category>${escapeXml(p.category)}</category>` : '',
        `      <description>${escapeXml(p.excerpt || p.title)}</description>`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pixenox Engineering Insights &amp; Research</title>
    <link>${escapeXml(baseUrl)}/blog</link>
    <atom:link href="${escapeXml(baseUrl)}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Production AI systems, Enterprise Intelligence data architecture, and AI Visibility (GEO/AEO) research by PIXENOX SOLUTIONS PRIVATE LIMITED.</description>
    <language>en-us</language>
    <managingEditor>connect@pixenox.com (Pixenox Founding Engineering Team)</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
