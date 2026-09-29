import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pixenox.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        // Explicitly allow ALL known AI and Search bots for maximum GEO/AEO coverage
        userAgent: [
          // OpenAI
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          // Anthropic
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'ClaudeWeb',
          'anthropic-ai',
          // Perplexity
          'PerplexityBot',
          'Perplexity-User',
          // Google
          'Google-Extended',
          'Googlebot',
          'GoogleOther',
          // Meta
          'FacebookBot',
          'Meta-ExternalAgent',
          'meta-externalagent',
          // Microsoft / Bing
          'Bingbot',
          'BingPreview',
          // Cohere
          'cohere-ai',
          // Apple
          'Applebot',
          'Applebot-Extended',
          // Others
          'YouBot',
          'Bytespider',
          'CCBot',
          'iaskspider',
        ],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
