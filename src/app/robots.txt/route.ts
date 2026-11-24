import { NextResponse } from 'next/server';
import { getCanonicalSiteUrl } from '@/lib/supabase/public';

export async function GET() {
  const baseUrl = getCanonicalSiteUrl();
  const aiBots = [
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
  ];

  const lines: string[] = [
    '# Pixenox Solutions Private Limited — Crawler Governance & Content-Signal Policy',
    `# Machine index (llms.txt v2): ${baseUrl}/llms.txt`,
    `# Full corporate brief: ${baseUrl}/llms-full.txt`,
    `# A2A Agent Card: ${baseUrl}/.well-known/agent-card.json`,
    '',
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    '# Explicit per-bot directives (RFC 9309: named blocks repeat Disallow rules)',
  ];

  for (const bot of aiBots) {
    lines.push(`User-agent: ${bot}`);
  }
  lines.push('Allow: /');
  lines.push('Disallow: /admin/');
  lines.push('Disallow: /api/');
  lines.push('');
  lines.push(`Sitemap: ${baseUrl}/sitemap.xml`);
  lines.push('');

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
