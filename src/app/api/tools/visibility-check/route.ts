import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import net from 'node:net';

export const runtime = 'nodejs';

interface CheckItem {
  id: string;
  category:
    | 'Crawl & Bot Governance'
    | 'SSR & Extractability'
    | 'Schema & Entity Graph'
    | '2026 AI-Native Protocols'
    | 'Discovery & Speed';
  label: string;
  status: 'pass' | 'warn' | 'fail';
  points: number;
  maxPoints: number;
  detail: string;
  fix: string;
}

function isBlockedIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true; // Multicast & reserved
  return false;
}

function isBlockedIp(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (net.isIPv4(lower)) return isBlockedIpv4(lower);
  if (net.isIPv6(lower)) {
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // Unique local
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // Link-local fe80::/10
    if (lower.startsWith('::ffff:')) {
      const v4 = lower.slice(7);
      if (net.isIPv4(v4)) return isBlockedIpv4(v4);
    }
    return false;
  }
  return true;
}

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  const parsed = new URL(normalized);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS protocols are permitted.');
  }

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Private, loopback, or local hostnames are blocked.');
  }

  if (net.isIP(host) !== 0) {
    throw new Error('Direct IP address targets are not permitted; provide a public domain.');
  }

  const records = await dns.lookup(host, { all: true });
  if (!records || records.length === 0) {
    throw new Error(`DNS lookup returned no addresses for ${host}.`);
  }
  for (const rec of records) {
    if (isBlockedIp(rec.address)) {
      throw new Error('Target resolves to a restricted private or loopback IP range.');
    }
  }

  return parsed;
}

async function safeBoundedFetch(
  targetUrl: string,
  acceptHeader: string,
  timeoutMs = 6000,
  maxBytes = 524288
): Promise<{ status: number; headers: Headers; text: string; finalUrl: string; ttfbMs: number }> {
  let current = await assertPublicUrl(targetUrl);
  const start = Date.now();
  let ttfbMs = 0;

  for (let hop = 0; hop < 4; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(current.toString(), {
        method: 'GET',
        headers: {
          Accept: acceptHeader,
          'User-Agent': 'Pixenox-AIVisibilityChecker/1.0 (+https://www.pixenox.com/tools/ai-visibility-checker)',
        },
        redirect: 'manual',
        signal: controller.signal,
      });
      if (hop === 0) ttfbMs = Date.now() - start;

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) {
          return { status: res.status, headers: res.headers, text: '', finalUrl: current.toString(), ttfbMs };
        }
        current = await assertPublicUrl(new URL(loc, current).toString());
        continue;
      }

      const reader = res.body?.getReader();
      let received = 0;
      const chunks: Uint8Array[] = [];
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            const take = Math.min(value.byteLength, maxBytes - received);
            if (take > 0) {
              chunks.push(value.subarray(0, take));
              received += take;
            }
            if (received >= maxBytes) {
              await reader.cancel().catch(() => {});
              break;
            }
          }
        }
      }
      const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
      return { status: res.status, headers: res.headers, text, finalUrl: current.toString(), ttfbMs: ttfbMs || Date.now() - start };
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error('Too many HTTP redirects.');
}

function gradeFromScore(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 78) return 'B+';
  if (score >= 68) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!rawUrl || rawUrl.length > 500) {
      return NextResponse.json({ error: 'Please provide a valid public http/https URL.' }, { status: 400 });
    }

    let target: URL;
    try {
      target = await assertPublicUrl(rawUrl);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid or restricted URL.' },
        { status: 400 }
      );
    }

    const origin = target.origin;
    const targetStr = target.toString();

    const [htmlRes, robotsRes, llmsRes, mdRes, agentRes] = await Promise.allSettled([
      safeBoundedFetch(targetStr, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'),
      safeBoundedFetch(`${origin}/robots.txt`, 'text/plain,*/*'),
      safeBoundedFetch(`${origin}/llms.txt`, 'text/markdown,text/plain,*/*'),
      safeBoundedFetch(targetStr, 'text/markdown'),
      safeBoundedFetch(`${origin}/.well-known/agent-card.json`, 'application/json'),
    ]);

    if (htmlRes.status === 'rejected') {
      const msg = htmlRes.reason instanceof Error ? htmlRes.reason.message : 'Failed to fetch target URL';
      const isSecurityBlock = /restricted|private|loopback|blocked|protocol|IP/i.test(msg);
      return NextResponse.json({ error: msg }, { status: isSecurityBlock ? 400 : 502 });
    }

    const html = htmlRes.value;
    const robots = robotsRes.status === 'fulfilled' ? robotsRes.value : null;
    const llms = llmsRes.status === 'fulfilled' ? llmsRes.value : null;
    const md = mdRes.status === 'fulfilled' ? mdRes.value : null;
    const agent = agentRes.status === 'fulfilled' ? agentRes.value : null;

    const checks: CheckItem[] = [];

    // --- 1. Crawl & Bot Governance (25 pts) ---
    const pageOk = html.status >= 200 && html.status < 300;
    checks.push({
      id: 'http-status',
      category: 'Crawl & Bot Governance',
      label: 'HTTP 200 Reachability',
      status: pageOk ? 'pass' : 'fail',
      points: pageOk ? 5 : 0,
      maxPoints: 5,
      detail: `Target returned HTTP ${html.status} (${html.finalUrl})`,
      fix: 'Ensure canonical URLs resolve directly with HTTP 200 without redirect chains.',
    });

    const robotsOk = Boolean(robots && robots.status === 200 && !robots.text.trim().toLowerCase().startsWith('<!doctype'));
    checks.push({
      id: 'robots-present',
      category: 'Crawl & Bot Governance',
      label: 'Valid robots.txt Present',
      status: robotsOk ? 'pass' : 'fail',
      points: robotsOk ? 5 : 0,
      maxPoints: 5,
      detail: robotsOk ? `Found robots.txt (${robots?.text.length} bytes)` : 'No valid robots.txt found at domain root',
      fix: 'Serve a clean text/plain robots.txt at /robots.txt.',
    });

    const robotsLower = (robots?.text || '').toLowerCase();
    const keyBots = ['oai-searchbot', 'gptbot', 'claude-searchbot', 'perplexitybot', 'googlebot', 'bingbot'];
    const mentionedBots = keyBots.filter((b) => robotsLower.includes(b));
    const wildcardAllowed = robotsOk && !/user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*$/im.test(robots?.text || '');
    const botPts = mentionedBots.length >= 4 ? 8 : wildcardAllowed ? 4 : 0;
    checks.push({
      id: 'ai-bots-governance',
      category: 'Crawl & Bot Governance',
      label: 'AI Search & Retrieval Bot Directives',
      status: mentionedBots.length >= 4 ? 'pass' : wildcardAllowed ? 'warn' : 'fail',
      points: botPts,
      maxPoints: 8,
      detail:
        mentionedBots.length > 0
          ? `Explicit rules found for: ${mentionedBots.join(', ')}`
          : wildcardAllowed
            ? 'Relies on wildcard User-agent: * without explicit AI search bot directives'
            : 'Crawlers appear blocked or robots.txt missing',
      fix: 'Explicitly allow OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot, and Bingbot with repeated Disallow rules per RFC 9309.',
    });

    const hasSitemap = robotsOk && /sitemap:\s*https?:\/\//i.test(robots?.text || '');
    checks.push({
      id: 'robots-sitemap',
      category: 'Crawl & Bot Governance',
      label: 'XML Sitemap Declared in robots.txt',
      status: hasSitemap ? 'pass' : 'fail',
      points: hasSitemap ? 7 : 0,
      maxPoints: 7,
      detail: hasSitemap ? 'Sitemap URL declared in robots.txt' : 'Missing Sitemap directive in robots.txt',
      fix: 'Add `Sitemap: https://yourdomain.com/sitemap.xml` at the end of robots.txt.',
    });

    // --- 2. SSR & Extractability (25 pts) ---
    const visibleText = html.text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const ssrWords = visibleText ? visibleText.split(' ').length : 0;
    const ssrPts = ssrWords >= 300 ? 10 : ssrWords >= 100 ? 5 : 0;
    checks.push({
      id: 'ssr-word-count',
      category: 'SSR & Extractability',
      label: 'Server-Rendered Content Depth',
      status: ssrWords >= 300 ? 'pass' : ssrWords >= 100 ? 'warn' : 'fail',
      points: ssrPts,
      maxPoints: 10,
      detail: `${ssrWords} extractable words present in raw initial HTML (no JS execution required)`,
      fix: 'Use SSR/SSG so AI crawlers receive 300+ meaningful words in raw HTML instead of empty client-side spinner shells.',
    });

    const titleMatch = html.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch =
      html.text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const titleLen = titleMatch?.[1]?.trim().length ?? 0;
    const descLen = metaDescMatch?.[1]?.trim().length ?? 0;
    const metaPts = titleLen > 0 && descLen >= 50 ? 5 : titleLen > 0 || descLen > 0 ? 3 : 0;
    checks.push({
      id: 'meta-tags',
      category: 'SSR & Extractability',
      label: 'Title & Meta Description Parity',
      status: metaPts === 5 ? 'pass' : metaPts > 0 ? 'warn' : 'fail',
      points: metaPts,
      maxPoints: 5,
      detail: `Title: ${titleLen} chars | Description: ${descLen} chars`,
      fix: 'Provide a concise <title> (≤60 chars) and informative meta description (110–160 chars).',
    });

    const canonicalMatch =
      html.text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
      html.text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const h1Count = (html.text.match(/<h1\b[^>]*>/gi) ?? []).length;
    const structOk = Boolean(canonicalMatch) && h1Count === 1;
    checks.push({
      id: 'canonical-h1',
      category: 'SSR & Extractability',
      label: 'Exact Canonical & Single H1',
      status: structOk ? 'pass' : canonicalMatch || h1Count >= 1 ? 'warn' : 'fail',
      points: structOk ? 6 : canonicalMatch || h1Count >= 1 ? 3 : 0,
      maxPoints: 6,
      detail: `Canonical: ${canonicalMatch?.[1] || 'Missing'} | H1 tags: ${h1Count}`,
      fix: 'Emit exactly one <h1> per page and a self-referencing absolute <link rel="canonical">.',
    });

    const hasMaxImage = /max-image-preview\s*:\s*large/i.test(html.text);
    checks.push({
      id: 'max-image-preview',
      category: 'SSR & Extractability',
      label: 'Google Discover / AI Overview Media Preview',
      status: hasMaxImage ? 'pass' : 'warn',
      points: hasMaxImage ? 4 : 0,
      maxPoints: 4,
      detail: hasMaxImage ? '`max-image-preview:large` robot directive present' : 'Missing `max-image-preview:large` directive',
      fix: 'Include `max-image-preview:large` in robots metadata for rich AI Overview & Discover visuals.',
    });

    // --- 3. Schema & Entity Graph (20 pts) ---
    const ldScripts = Array.from(
      html.text.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    );
    const jsonLdTypes = new Set<string>();
    let hasWikidata = false;
    let hasSpeakable = false;

    const collectTypes = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach(collectTypes);
        return;
      }
      const obj = node as Record<string, unknown>;
      const t = obj['@type'];
      if (typeof t === 'string') jsonLdTypes.add(t);
      else if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && jsonLdTypes.add(x));
      if (t === 'SpeakableSpecification' || obj.speakable) hasSpeakable = true;
      const sameAs = obj.sameAs;
      if (typeof sameAs === 'string' && sameAs.includes('wikidata.org')) hasWikidata = true;
      if (Array.isArray(sameAs) && sameAs.some((s) => typeof s === 'string' && s.includes('wikidata.org'))) {
        hasWikidata = true;
      }
      Object.values(obj).forEach(collectTypes);
    };

    for (const m of ldScripts) {
      try {
        collectTypes(JSON.parse(m[1]));
      } catch {
        // Skip invalid JSON-LD block
      }
    }

    checks.push({
      id: 'jsonld-graph',
      category: 'Schema & Entity Graph',
      label: 'Structured Data JSON-LD Coverage',
      status: jsonLdTypes.size >= 2 ? 'pass' : jsonLdTypes.size === 1 ? 'warn' : 'fail',
      points: jsonLdTypes.size >= 2 ? 10 : jsonLdTypes.size === 1 ? 5 : 0,
      maxPoints: 10,
      detail:
        jsonLdTypes.size > 0
          ? `Detected types: ${Array.from(jsonLdTypes).join(', ')}`
          : 'No valid application/ld+json blocks detected',
      fix: 'Link Organization, Person, WebSite, Service/SoftwareApplication, and TechArticle via @id in a unified JSON-LD @graph.',
    });

    checks.push({
      id: 'wikidata-sameas',
      category: 'Schema & Entity Graph',
      label: 'Wikidata Entity Disambiguation (sameAs)',
      status: hasWikidata ? 'pass' : 'warn',
      points: hasWikidata ? 6 : 0,
      maxPoints: 6,
      detail: hasWikidata ? 'Wikidata entity URIs found in schema graph' : 'No Wikidata sameAs links detected in JSON-LD',
      fix: 'Link knowsAbout/about Thing nodes to canonical Wikidata URIs (e.g. wikidata.org/wiki/Q11660).',
    });

    checks.push({
      id: 'speakable-schema',
      category: 'Schema & Entity Graph',
      label: 'SpeakableSpecification / Answer Selector',
      status: hasSpeakable ? 'pass' : 'warn',
      points: hasSpeakable ? 4 : 0,
      maxPoints: 4,
      detail: hasSpeakable ? 'SpeakableSpecification present' : 'No SpeakableSpecification selector found',
      fix: 'Add SpeakableSpecification CSS selectors targeting your title and direct-answer summary capsule.',
    });

    // --- 4. 2026 AI-Native Protocols (20 pts) ---
    const llmsValid = Boolean(
      llms &&
        llms.status === 200 &&
        !llms.text.trim().toLowerCase().startsWith('<!doctype') &&
        !llms.text.trim().toLowerCase().startsWith('<html') &&
        llms.text.length > 40
    );
    const hasMdLinksInLlms = llmsValid && /\.md\b/i.test(llms?.text || '');
    checks.push({
      id: 'llms-txt',
      category: '2026 AI-Native Protocols',
      label: '/llms.txt (B2A Agent Directory)',
      status: llmsValid ? 'pass' : 'fail',
      points: llmsValid ? (hasMdLinksInLlms ? 5 : 4) : 0,
      maxPoints: 5,
      detail: llmsValid
        ? `Valid llms.txt (~${Math.ceil((llms?.text.length || 0) / 4)} tokens${hasMdLinksInLlms ? ', v2 .md links present' : ''})`
        : 'No valid /llms.txt index found at domain root',
      fix: 'Publish a concise Markdown /llms.txt directory pointing to canonical product, doc, and .md endpoints.',
    });

    const mdContentType = (md?.headers.get('content-type') || '').toLowerCase();
    const mdNegotiated = Boolean(md && md.status === 200 && mdContentType.includes('text/markdown'));
    checks.push({
      id: 'accept-markdown',
      category: '2026 AI-Native Protocols',
      label: 'HTTP Accept: text/markdown Negotiation',
      status: mdNegotiated ? 'pass' : 'warn',
      points: mdNegotiated ? 5 : 0,
      maxPoints: 5,
      detail: mdNegotiated
        ? `Negotiated text/markdown cleanly (X-Markdown-Tokens: ${md?.headers.get('x-markdown-tokens') || 'n/a'})`
        : `Returned ${mdContentType || 'HTML'} when Accept: text/markdown was requested`,
      fix: 'Serve lightweight text/markdown when AI clients send `Accept: text/markdown` to slash token waste by ~85%.',
    });

    const headerSignal = html.headers.get('content-signal') || '';
    const robotsSignal = /content-signal:/i.test(robots?.text || '');
    const hasContentSignal = Boolean(headerSignal || robotsSignal);
    checks.push({
      id: 'content-signal',
      category: '2026 AI-Native Protocols',
      label: 'Content-Signal Usage Directives',
      status: hasContentSignal ? 'pass' : 'warn',
      points: hasContentSignal ? 4 : 0,
      maxPoints: 4,
      detail: hasContentSignal
        ? `Detected Content-Signal (${headerSignal || 'declared in robots.txt'})`
        : 'No Content-Signal directive found in headers or robots.txt',
      fix: 'Declare `Content-Signal: search=yes, ai-input=yes, ai-train=yes` (or your chosen policy) in headers and robots.txt.',
    });

    let agentCardValid = false;
    if (agent && agent.status === 200) {
      try {
        const parsedAgent = JSON.parse(agent.text);
        if (parsedAgent && typeof parsedAgent.name === 'string') agentCardValid = true;
      } catch {
        agentCardValid = false;
      }
    }
    checks.push({
      id: 'agent-card',
      category: '2026 AI-Native Protocols',
      label: 'A2A /.well-known/agent-card.json',
      status: agentCardValid ? 'pass' : 'warn',
      points: agentCardValid ? 3 : 0,
      maxPoints: 3,
      detail: agentCardValid ? 'Valid A2A Agent Card JSON published' : 'No /.well-known/agent-card.json found',
      fix: 'Publish a /.well-known/agent-card.json describing your site’s agent capabilities and endpoints.',
    });

    const hasSpeculation = /<script[^>]+type=["']speculationrules["']/i.test(html.text);
    checks.push({
      id: 'speculation-rules',
      category: '2026 AI-Native Protocols',
      label: 'Speculation Rules API Prerendering',
      status: hasSpeculation ? 'pass' : 'warn',
      points: hasSpeculation ? 3 : 0,
      maxPoints: 3,
      detail: hasSpeculation ? 'Speculation Rules prerender script detected' : 'No <script type="speculationrules"> detected',
      fix: 'Inject Speculation Rules JSON for high-intent documentation and product routes to cut multi-hop latency.',
    });

    // --- 5. Discovery & Speed (10 pts) ---
    const ttfbPts = html.ttfbMs <= 600 ? 6 : html.ttfbMs <= 1500 ? 3 : 0;
    checks.push({
      id: 'ttfb',
      category: 'Discovery & Speed',
      label: 'Origin / Edge TTFB Latency',
      status: ttfbPts === 6 ? 'pass' : ttfbPts === 3 ? 'warn' : 'fail',
      points: ttfbPts,
      maxPoints: 6,
      detail: `Measured TTFB: ${html.ttfbMs}ms`,
      fix: 'Enable edge caching / ISR and cookie-free public SSR fetching to keep TTFB under 600ms.',
    });

    const hasFeed = /application\/(rss|atom)\+xml/i.test(html.text);
    checks.push({
      id: 'feed-autodiscovery',
      category: 'Discovery & Speed',
      label: 'RSS / Atom Feed Autodiscovery',
      status: hasFeed ? 'pass' : 'warn',
      points: hasFeed ? 4 : 0,
      maxPoints: 4,
      detail: hasFeed ? 'RSS/Atom feed link present in <head>' : 'No RSS/Atom autodiscovery tag found',
      fix: 'Publish a live XML feed (e.g. /blog/feed.xml) and expose <link rel="alternate" type="application/rss+xml">.',
    });

    const totalScore = checks.reduce((acc, c) => acc + c.points, 0);
    const categories = Array.from(new Set(checks.map((c) => c.category))).map((cat) => {
      const group = checks.filter((c) => c.category === cat);
      const score = group.reduce((s, c) => s + c.points, 0);
      const max = group.reduce((s, c) => s + c.maxPoints, 0);
      return { category: cat, score, max };
    });

    const embedBadgeHtml = `<a href="https://www.pixenox.com/tools/ai-visibility-checker" target="_blank" rel="noopener">AI Visibility Audited (${totalScore}/100) by Pixenox Engenox</a>`;

    return NextResponse.json({
      auditedUrl: html.finalUrl,
      host: target.hostname,
      score: totalScore,
      grade: gradeFromScore(totalScore),
      ttfbMs: html.ttfbMs,
      ssrWords,
      categories,
      checks,
      embedBadgeHtml,
    });
  } catch {
    return NextResponse.json({ error: 'Unexpected error auditing target URL.' }, { status: 500 });
  }
}
