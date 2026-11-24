import type { MetadataRoute } from 'next';
import { getCanonicalSiteUrl } from '@/lib/supabase/public';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalSiteUrl();
  const protectedPaths = ['/admin/', '/api/'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: protectedPaths,
      },
      {
        // RFC 9309: named user-agent blocks completely override '*', so
        // protectedPaths MUST be repeated here to prevent admin/API crawling.
        userAgent: [
          // OpenAI (Search/Citation + Live Fetch + Training)
          'OAI-SearchBot',
          'ChatGPT-User',
          'GPTBot',
          // Anthropic (Search + Live Fetch + Training)
          'Claude-SearchBot',
          'Claude-User',
          'ClaudeBot',
          'anthropic-ai',
          // Perplexity
          'PerplexityBot',
          'Perplexity-User',
          // Google & Bing
          'Googlebot',
          'GoogleOther',
          'Google-Extended',
          'Bingbot',
          'BingPreview',
          // Apple, Meta, Cohere & others
          'Applebot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'FacebookBot',
          'cohere-ai',
          'YouBot',
          'CCBot',
        ],
        allow: '/',
        disallow: protectedPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
