import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import net from 'node:net';

export const runtime = 'nodejs';

export type AuditState =
  | 'ok'
  | 'parked_domain'
  | 'dns_error'
  | 'http_error'
  | 'waf_blocked'
  | 'non_html'
  | 'unreachable';

export interface CheckItem {
  id: string;
  category:
    | 'Crawl & Bot Governance'
    | 'SSR & AI Extractability'
    | 'Schema & Knowledge Graph'
    | '2026 AI-Native Protocols'
    | 'Discovery, Trust & Speed';
  label: string;
  status: 'pass' | 'warn' | 'fail';
  points: number;
  maxPoints: number;
  detail: string;
  fix: string;
}

export interface BotAccessEntry {
  bot: string;
  product: string;
  status: 'allowed_explicit' | 'allowed_wildcard' | 'blocked';
  rule: string;
}

interface RedirectHop {
  url: string;
  status: number;
}

class DiagnosticError extends Error {
  state: AuditState | 'ssrf_blocked' | 'invalid_input';
  constructor(state: AuditState | 'ssrf_blocked' | 'invalid_input', message: string) {
    super(message);
    this.state = state;
  }
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
  if (a >= 224) return true;
  return false;
}

function isBlockedIp(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (net.isIPv4(lower)) return isBlockedIpv4(lower);
  if (net.isIPv6(lower)) {
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
      return true;
    }
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
  if (!normalized || normalized.length > 500) {
    throw new DiagnosticError('invalid_input', 'Please enter a valid public domain or URL (under 500 characters).');
  }
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new DiagnosticError('invalid_input', 'Malformed URL syntax. Example: https://www.pixenox.com');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new DiagnosticError('invalid_input', 'Only HTTP and HTTPS protocols are permitted.');
  }

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    !host ||
    !host.includes('.') ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.arpa')
  ) {
    throw new DiagnosticError(
      net.isIP(host) !== 0 || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')
        ? 'ssrf_blocked'
        : 'invalid_input',
      'Enter a valid public domain name with a TLD (private/local hosts are blocked).'
    );
  }

  if (net.isIP(host) !== 0) {
    throw new DiagnosticError('ssrf_blocked', 'Direct IP address targets are restricted; provide a public domain.');
  }

  let records: { address: string; family: number }[];
  try {
    records = await dns.lookup(host, { all: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code || 'ENOTFOUND';
    throw new DiagnosticError(
      'dns_error',
      `DNS resolution failed for "${host}" (${code}). Verify the domain exists and has live A/AAAA records.`
    );
  }

  if (!records || records.length === 0) {
    throw new DiagnosticError('dns_error', `DNS lookup returned no IP records for "${host}".`);
  }

  for (const rec of records) {
    if (isBlockedIp(rec.address)) {
      throw new DiagnosticError('ssrf_blocked', 'Target resolves to a restricted private or loopback IP range.');
    }
  }

  return parsed;
}

interface FetchProbeResult {
  status: number;
  headers: Headers;
  text: string;
  finalUrl: string;
  ttfbMs: number;
  redirectChain: RedirectHop[];
  redirectHops: number;
}

async function safeBoundedFetch(
  targetUrl: string,
  acceptHeader: string,
  timeoutMs = 7000,
  maxBytes = 524288
): Promise<FetchProbeResult> {
  let current = await assertPublicUrl(targetUrl);
  const start = Date.now();
  let ttfbMs = 0;
  const redirectChain: RedirectHop[] = [];

  for (let hop = 0; hop < 6; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(current.toString(), {
        method: 'GET',
        headers: {
          Accept: acceptHeader,
          'User-Agent': 'Pixenox-AIVisibilityChecker/2.0 (+https://www.pixenox.com/tools/ai-visibility-checker)',
        },
        redirect: 'manual',
        signal: controller.signal,
      });
      if (hop === 0) ttfbMs = Date.now() - start;

      if (res.status >= 300 && res.status < 400) {
        redirectChain.push({ url: current.toString(), status: res.status });
        const loc = res.headers.get('location');
        if (!loc) {
          return {
            status: res.status,
            headers: res.headers,
            text: '',
            finalUrl: current.toString(),
            ttfbMs,
            redirectChain,
            redirectHops: redirectChain.length,
          };
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
      return {
        status: res.status,
        headers: res.headers,
        text,
        finalUrl: current.toString(),
        ttfbMs: ttfbMs || Date.now() - start,
        redirectChain,
        redirectHops: redirectChain.length,
      };
    } catch (err) {
      if (err instanceof DiagnosticError) throw err;
      const causeCode = (err as { cause?: { code?: string } })?.cause?.code || '';
      const msg = err instanceof Error ? err.message : 'Network error';
      if (msg.includes('abort') || msg.toLowerCase().includes('timeout')) {
        throw new DiagnosticError('unreachable', `Connection timed out after ${timeoutMs}ms waiting for ${current.hostname}.`);
      }
      if (/ENOTFOUND|EAI_NONAME/i.test(causeCode + msg)) {
        throw new DiagnosticError('dns_error', `DNS resolution failed for "${current.hostname}".`);
      }
      if (/CERT|TLS|SSL/i.test(causeCode + msg)) {
        throw new DiagnosticError('unreachable', `TLS/SSL handshake failed for "${current.hostname}" (${causeCode || 'certificate error'}).`);
      }
      throw new DiagnosticError('unreachable', `Unable to reach "${current.hostname}": ${causeCode || msg}`);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new DiagnosticError('unreachable', 'Exceeded maximum redirect chain (5 hops).');
}

function detectParkedDomain(html: string): string | null {
  const checks: [RegExp, string][] = [
    [
      /utm_source=parkingpage|recently registered with\s+namecheap|lander\.parity\.domains|namecheap-auctions/i,
      'Namecheap Domain Parking',
    ],
    [
      /godaddy\.com\/domainsearch|courtesy of godaddy|afternic\.com|dan\.com\/buy-domain|forsale\.godaddy/i,
      'GoDaddy / Afternic Parking',
    ],
    [
      /sedoparking\.com|bodis\.com|parkingcrew\.net|hugedomains\.com|registered at porkbun|send the parked domain/i,
      'Domain Registrar Parking',
    ],
    [
      /DEPLOYMENT_NOT_FOUND|Welcome to nginx!|Apache2 Ubuntu Default Page|There isn't a GitHub Pages site here|Future home of something quite cool/i,
      'Unconfigured Hosting Placeholder',
    ],
  ];
  for (const [re, provider] of checks) {
    if (re.test(html)) return provider;
  }
  return null;
}

function detectWafChallenge(status: number, html: string): boolean {
  if (![403, 429, 503].includes(status)) return false;
  return /just a moment|cf-challenge|cloudflare|attention required|akamai|perimeterx|datadome|verify you are human|access denied/i.test(
    html
  );
}

interface RobotsRuleGroup {
  agents: string[];
  rules: { type: 'allow' | 'disallow'; path: string }[];
  contentSignal?: string;
}

function evaluateRobotsForBots(
  robotsText: string,
  targetPath: string
): {
  botMatrix: BotAccessEntry[];
  sitemaps: string[];
  hasRobotsContentSignal: boolean;
  robotsContentSignal: string;
} {
  const botsMeta: { bot: string; product: string }[] = [
    { bot: 'OAI-SearchBot', product: 'ChatGPT Search' },
    { bot: 'GPTBot', product: 'OpenAI Training' },
    { bot: 'Claude-SearchBot', product: 'Claude Search' },
    { bot: 'PerplexityBot', product: 'Perplexity Answer Engine' },
    { bot: 'Googlebot', product: 'Google Search & AI Overviews' },
    { bot: 'Bingbot', product: 'Bing & Microsoft Copilot' },
  ];

  const groups: RobotsRuleGroup[] = [];
  const sitemaps: string[] = [];
  let robotsContentSignal = '';
  let currentGroup: RobotsRuleGroup | null = null;
  let lastWasDirective = false;

  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const field = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (field === 'sitemap' && /^https?:\/\//i.test(val)) {
      sitemaps.push(val);
      continue;
    }

    if (field === 'user-agent') {
      if (!currentGroup || lastWasDirective) {
        currentGroup = { agents: [], rules: [] };
        groups.push(currentGroup);
      }
      currentGroup.agents.push(val.toLowerCase());
      lastWasDirective = false;
    } else if ((field === 'allow' || field === 'disallow') && currentGroup) {
      currentGroup.rules.push({ type: field, path: val });
      lastWasDirective = true;
    } else if (field === 'content-signal') {
      if (!robotsContentSignal && val) robotsContentSignal = val;
      if (currentGroup) currentGroup.contentSignal = val;
      lastWasDirective = true;
    }
  }

  const wildcardGroup = groups.find((g) => g.agents.includes('*'));

  const evaluateRules = (rules: { type: 'allow' | 'disallow'; path: string }[]): { allowed: boolean; rule: string } => {
    let bestLen = -1;
    let bestType: 'allow' | 'disallow' = 'allow';
    let bestPattern = 'default allow';

    for (const r of rules) {
      if (r.type === 'disallow' && r.path === '') continue; // Empty Disallow means allow all per RFC 9309
      if (!r.path) continue;
      // Match simple prefix or trailing wildcard accurately
      const cleanPrefix = r.path.replace(/\*.*$/, '');
      if (targetPath.startsWith(cleanPrefix)) {
        const matchLen = r.path.length;
        if (matchLen > bestLen || (matchLen === bestLen && r.type === 'allow')) {
          bestLen = matchLen;
          bestType = r.type;
          bestPattern = `${r.type === 'allow' ? 'Allow' : 'Disallow'}: ${r.path}`;
        }
      }
    }
    return { allowed: bestType === 'allow', rule: bestPattern };
  };

  const botMatrix: BotAccessEntry[] = botsMeta.map(({ bot, product }) => {
    const botLower = bot.toLowerCase();
    const explicitGroups = groups.filter((g) => g.agents.includes(botLower));

    if (explicitGroups.length > 0) {
      const mergedRules = explicitGroups.flatMap((g) => g.rules);
      const res = evaluateRules(mergedRules);
      return {
        bot,
        product,
        status: res.allowed ? 'allowed_explicit' : 'blocked',
        rule: res.allowed ? `Explicit (${res.rule})` : `Blocked (${res.rule})`,
      };
    }

    if (wildcardGroup) {
      const res = evaluateRules(wildcardGroup.rules);
      return {
        bot,
        product,
        status: res.allowed ? 'allowed_wildcard' : 'blocked',
        rule: res.allowed ? `Wildcard * (${res.rule})` : `Blocked by * (${res.rule})`,
      };
    }

    return {
      bot,
      product,
      status: 'allowed_wildcard',
      rule: 'No restrictive rule',
    };
  });

  return {
    botMatrix,
    sitemaps,
    hasRobotsContentSignal: Boolean(robotsContentSignal),
    robotsContentSignal,
  };
}

function gradeFromScore(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 58) return 'C';
  if (score >= 42) return 'D';
  return 'F';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';

    let target: URL;
    try {
      target = await assertPublicUrl(rawUrl);
    } catch (err) {
      if (err instanceof DiagnosticError) {
        if (err.state === 'ssrf_blocked' || err.state === 'invalid_input') {
          return NextResponse.json({ auditState: err.state, error: err.message }, { status: 400 });
        }
        return NextResponse.json({
          auditState: err.state,
          auditedUrl: rawUrl,
          host: rawUrl.replace(/^https?:\/\//i, '').split('/')[0],
          title: 'Domain Cannot Be Resolved (DNS Failure)',
          message: err.message,
          score: null,
          grade: 'ERR',
        });
      }
      return NextResponse.json({ error: 'Invalid target URL.' }, { status: 400 });
    }

    let html: FetchProbeResult;
    try {
      html = await safeBoundedFetch(target.toString(), 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8');
    } catch (err) {
      if (err instanceof DiagnosticError) {
        if (err.state === 'ssrf_blocked') {
          return NextResponse.json({ auditState: 'ssrf_blocked', error: err.message }, { status: 400 });
        }
        return NextResponse.json({
          auditState: err.state,
          auditedUrl: target.toString(),
          host: target.hostname,
          title: err.state === 'dns_error' ? 'Domain Does Not Resolve (NXDOMAIN)' : 'Origin Unreachable',
          message: err.message,
          score: null,
          grade: 'ERR',
        });
      }
      return NextResponse.json({
        auditState: 'unreachable',
        auditedUrl: target.toString(),
        host: target.hostname,
        title: 'Origin Unreachable',
        message: 'Network error communicating with target server.',
        score: null,
        grade: 'ERR',
      });
    }

    const finalParsed = new URL(html.finalUrl);
    const origin = finalParsed.origin;

    // Gate 1: WAF / Bot Challenge Detection
    if (detectWafChallenge(html.status, html.text)) {
      return NextResponse.json({
        auditState: 'waf_blocked',
        auditedUrl: html.finalUrl,
        host: finalParsed.hostname,
        statusCode: html.status,
        redirectHops: html.redirectHops,
        redirectChain: html.redirectChain,
        ttfbMs: html.ttfbMs,
        title: `Automated Bot Firewall Blocked Fetch (HTTP ${html.status})`,
        message:
          'This domain returned an anti-bot or WAF interstitial challenge instead of real HTML. Autonomous AI search crawlers (ChatGPT Search, Perplexity, Claude) are likewise blocked from indexing this page.',
        score: null,
        grade: 'WAF',
      });
    }

    // Gate 2: HTTP 4xx / 5xx Error Page
    if (html.status >= 400) {
      return NextResponse.json({
        auditState: 'http_error',
        auditedUrl: html.finalUrl,
        host: finalParsed.hostname,
        statusCode: html.status,
        redirectHops: html.redirectHops,
        redirectChain: html.redirectChain,
        ttfbMs: html.ttfbMs,
        title: `Target Returned HTTP ${html.status} Error`,
        message: `The requested URL responded with HTTP ${html.status}. Search engines and AI answer bots treat HTTP 4xx/5xx responses as non-indexable dead endpoints.`,
        score: null,
        grade: String(html.status),
      });
    }

    // Gate 3: Non-HTML Content-Type
    const contentType = (html.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return NextResponse.json({
        auditState: 'non_html',
        auditedUrl: html.finalUrl,
        host: finalParsed.hostname,
        statusCode: html.status,
        ttfbMs: html.ttfbMs,
        title: `Non-HTML Response (${contentType.split(';')[0]})`,
        message: `The endpoint returned "${contentType}" rather than an HTML document.`,
        score: null,
        grade: 'N/A',
      });
    }

    // Gate 4: Parked / Registrar Placeholder / Unconfigured Server Detection
    const parkedProvider = detectParkedDomain(html.text);
    if (parkedProvider) {
      return NextResponse.json({
        auditState: 'parked_domain',
        providerDetected: parkedProvider,
        auditedUrl: html.finalUrl,
        host: finalParsed.hostname,
        statusCode: html.status,
        redirectHops: html.redirectHops,
        redirectChain: html.redirectChain,
        ttfbMs: html.ttfbMs,
        title: `Parked / Unlaunched Domain Detected (${parkedProvider})`,
        message: `This domain currently resolves to a ${parkedProvider} placeholder page rather than a live production application. Scoring is disabled until a real site is deployed.`,
        score: null,
        grade: 'PARKED',
      });
    }

    // Parallel secondary probes for valid live websites
    const [robotsRes, llmsRes, mdRes, agentRes, secRes] = await Promise.allSettled([
      safeBoundedFetch(`${origin}/robots.txt`, 'text/plain,*/*'),
      safeBoundedFetch(`${origin}/llms.txt`, 'text/markdown,text/plain,*/*'),
      safeBoundedFetch(html.finalUrl, 'text/markdown'),
      safeBoundedFetch(`${origin}/.well-known/agent-card.json`, 'application/json'),
      safeBoundedFetch(`${origin}/.well-known/security.txt`, 'text/plain'),
    ]);

    const robots = robotsRes.status === 'fulfilled' ? robotsRes.value : null;
    const llms = llmsRes.status === 'fulfilled' ? llmsRes.value : null;
    const md = mdRes.status === 'fulfilled' ? mdRes.value : null;
    const agent = agentRes.status === 'fulfilled' ? agentRes.value : null;
    const sec = secRes.status === 'fulfilled' ? secRes.value : null;

    const robotsCt = (robots?.headers.get('content-type') || '').toLowerCase();
    const robotsOk = Boolean(
      robots &&
        robots.status === 200 &&
        !robotsCt.includes('text/html') &&
        !robots.text.trim().toLowerCase().startsWith('<!doctype') &&
        !robots.text.trim().toLowerCase().startsWith('<html')
    );

    const parsedRobots = robotsOk
      ? evaluateRobotsForBots(robots!.text, finalParsed.pathname || '/')
      : {
          botMatrix: [
            { bot: 'OAI-SearchBot', product: 'ChatGPT Search', status: 'allowed_wildcard' as const, rule: 'No robots.txt' },
            { bot: 'GPTBot', product: 'OpenAI Training', status: 'allowed_wildcard' as const, rule: 'No robots.txt' },
            { bot: 'Claude-SearchBot', product: 'Claude Search', status: 'allowed_wildcard' as const, rule: 'No robots.txt' },
            { bot: 'PerplexityBot', product: 'Perplexity Answer Engine', status: 'allowed_wildcard' as const, rule: 'No robots.txt' },
            { bot: 'Googlebot', product: 'Google Search & AI Overviews', status: 'allowed_wildcard' as const, rule: 'No robots.txt' },
            { bot: 'Bingbot', product: 'Bing & Microsoft Copilot', status: 'allowed_wildcard' as const, rule: 'No robots.txt' },
          ],
          sitemaps: [],
          hasRobotsContentSignal: false,
          robotsContentSignal: '',
        };

    // Verify first declared sitemap actually returns HTTP 200 XML
    let sitemapVerified = false;
    if (parsedRobots.sitemaps.length > 0) {
      try {
        const smRes = await safeBoundedFetch(parsedRobots.sitemaps[0], 'application/xml,text/xml,*/*', 4500, 131072);
        if (smRes.status === 200 && /<(urlset|sitemapindex)\b/i.test(smRes.text)) {
          sitemapVerified = true;
        }
      } catch {
        sitemapVerified = false;
      }
    }

    const checks: CheckItem[] = [];

    // ═══════════ 1. CRAWL & BOT GOVERNANCE (25 pts) ═══════════
    const reachPts = html.redirectHops <= 1 ? 4 : 2;
    checks.push({
      id: 'http-reachability',
      category: 'Crawl & Bot Governance',
      label: 'HTTP 200 Direct Reachability',
      status: html.redirectHops <= 1 ? 'pass' : 'warn',
      points: reachPts,
      maxPoints: 4,
      detail:
        html.redirectHops === 0
          ? `Resolved directly with HTTP ${html.status}`
          : `Resolved via ${html.redirectHops} redirect hop(s) -> ${html.finalUrl}`,
      fix: 'Keep canonical links single-hop or direct 200 OK to preserve crawl budget.',
    });

    const xRobots = (html.headers.get('x-robots-tag') || '').toLowerCase();
    const metaRobotsMatches = Array.from(
      html.text.matchAll(/<meta[^>]+name=["'](?:robots|googlebot)["'][^>]+content=["']([^"']+)["']/gi)
    ).map((m) => m[1].toLowerCase());
    const hasNoindex = xRobots.includes('noindex') || metaRobotsMatches.some((c) => c.includes('noindex'));
    checks.push({
      id: 'indexability',
      category: 'Crawl & Bot Governance',
      label: 'Indexation Permissiveness (No noindex)',
      status: hasNoindex ? 'fail' : 'pass',
      points: hasNoindex ? 0 : 5,
      maxPoints: 5,
      detail: hasNoindex
        ? 'Blocked by `noindex` directive in meta robots or X-Robots-Tag header'
        : 'No `noindex` directive blocking search or AI indexing',
      fix: 'Remove `noindex` from public production pages while keeping admin/staging paths noindexed.',
    });

    checks.push({
      id: 'robots-present',
      category: 'Crawl & Bot Governance',
      label: 'Valid Non-HTML robots.txt',
      status: robotsOk ? 'pass' : 'fail',
      points: robotsOk ? 4 : 0,
      maxPoints: 4,
      detail: robotsOk ? `Valid text/plain robots.txt (${robots?.text.length} bytes)` : 'No valid robots.txt found at origin root',
      fix: 'Serve a clean text/plain /robots.txt without HTML SPA catch-all fallbacks.',
    });

    const searchBots = parsedRobots.botMatrix.filter((b) =>
      ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'Googlebot', 'Bingbot'].includes(b.bot)
    );
    const explicitCount = searchBots.filter((b) => b.status === 'allowed_explicit').length;
    const blockedBots = parsedRobots.botMatrix.filter((b) => b.status === 'blocked');
    const botPts =
      !robotsOk ? 0 : blockedBots.length >= 2 ? 1 : blockedBots.length === 1 ? 3 : explicitCount >= 4 ? 7 : 4;
    checks.push({
      id: 'ai-bot-matrix',
      category: 'Crawl & Bot Governance',
      label: 'RFC 9309 AI Search Bot Access',
      status: blockedBots.length > 0 ? 'fail' : explicitCount >= 4 ? 'pass' : 'warn',
      points: botPts,
      maxPoints: 7,
      detail:
        blockedBots.length > 0
          ? `Blocked bot(s): ${blockedBots.map((b) => b.bot).join(', ')}`
          : explicitCount >= 4
            ? `${explicitCount}/5 primary search & AI citation bots explicitly permitted per RFC 9309`
            : 'Allowed via wildcard * without explicit per-bot OAI-SearchBot/Claude-SearchBot/PerplexityBot blocks',
      fix: 'Add explicit User-agent rules for OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot, and Bingbot with repeated Disallow rules per RFC 9309.',
    });

    const smPts = sitemapVerified ? 5 : parsedRobots.sitemaps.length > 0 ? 3 : 0;
    checks.push({
      id: 'sitemap-verified',
      category: 'Crawl & Bot Governance',
      label: 'Live XML Sitemap Declared & Valid',
      status: sitemapVerified ? 'pass' : parsedRobots.sitemaps.length > 0 ? 'warn' : 'fail',
      points: smPts,
      maxPoints: 5,
      detail: sitemapVerified
        ? `Verified live XML sitemap at ${parsedRobots.sitemaps[0]}`
        : parsedRobots.sitemaps.length > 0
          ? `Declared (${parsedRobots.sitemaps[0]}) but failed XML HTTP 200 verification`
          : 'No Sitemap directive declared in robots.txt',
      fix: 'Declare `Sitemap: https://yourdomain.com/sitemap.xml` in robots.txt and verify it returns HTTP 200 XML.',
    });

    // ═══════════ 2. SSR & AI EXTRACTABILITY (25 pts) ═══════════
    const visibleText = html.text
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const ssrWords = visibleText ? visibleText.split(' ').length : 0;
    const textToHtmlRatio = html.text.length > 0 ? Math.min(100, Math.round((visibleText.length / html.text.length) * 100)) : 0;
    const ssrPts = ssrWords >= 300 ? 8 : ssrWords >= 100 ? 4 : 0;
    checks.push({
      id: 'ssr-depth',
      category: 'SSR & AI Extractability',
      label: 'Server-Rendered Content Depth',
      status: ssrWords >= 300 ? 'pass' : ssrWords >= 100 ? 'warn' : 'fail',
      points: ssrPts,
      maxPoints: 8,
      detail: `${ssrWords} clean words in initial HTML (${textToHtmlRatio}% text-to-HTML ratio)`,
      fix: 'Render primary headings, answers, and links on the server (SSR/SSG) so JS-blind LLM fetchers see full text.',
    });

    const titleMatch = html.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || '';
    const metaDescMatch =
      html.text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const metaDesc = metaDescMatch?.[1]?.trim() || '';
    const titleGood = pageTitle.length >= 15 && pageTitle.length <= 75;
    const descGood = metaDesc.length >= 70 && metaDesc.length <= 175;
    const metaPts = titleGood && descGood ? 5 : pageTitle.length > 0 || metaDesc.length > 0 ? 3 : 0;
    checks.push({
      id: 'title-meta',
      category: 'SSR & AI Extractability',
      label: 'Title & Meta Description Precision',
      status: metaPts === 5 ? 'pass' : metaPts > 0 ? 'warn' : 'fail',
      points: metaPts,
      maxPoints: 5,
      detail: `Title (${pageTitle.length} chars) | Meta Description (${metaDesc.length} chars)`,
      fix: 'Use an entity-clear <title> (15–60 chars) and informative meta description (110–160 chars).',
    });

    const canonicalMatch =
      html.text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
      html.text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const canonicalHref = canonicalMatch?.[1]?.trim() || '';
    let canonicalSameHost = false;
    if (canonicalHref) {
      try {
        canonicalSameHost = new URL(canonicalHref, html.finalUrl).hostname === finalParsed.hostname;
      } catch {
        canonicalSameHost = false;
      }
    }
    const h1Count = (html.text.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) ?? []).filter(
      (h) => h.replace(/<[^>]+>/g, '').trim().length > 0
    ).length;
    const canH1Pts = canonicalSameHost && h1Count === 1 ? 6 : canonicalHref || h1Count >= 1 ? 3 : 0;
    checks.push({
      id: 'canonical-h1',
      category: 'SSR & AI Extractability',
      label: 'Self-Referencing Canonical & Single H1',
      status: canH1Pts === 6 ? 'pass' : canH1Pts > 0 ? 'warn' : 'fail',
      points: canH1Pts,
      maxPoints: 6,
      detail: `Canonical: ${canonicalHref || 'Missing'} | Non-empty H1 count: ${h1Count}`,
      fix: 'Emit exactly one descriptive <h1> and a self-referencing absolute <link rel="canonical"> on the same canonical host.',
    });

    const hasMaxImage = /max-image-preview\s*:\s*large/i.test(html.text);
    const hasOg = /property=["']og:title["']/i.test(html.text) && /property=["']og:image["']/i.test(html.text);
    const mediaPts = hasMaxImage && hasOg ? 3 : hasMaxImage || hasOg ? 2 : 0;
    checks.push({
      id: 'media-og',
      category: 'SSR & AI Extractability',
      label: 'OpenGraph & max-image-preview:large',
      status: mediaPts === 3 ? 'pass' : mediaPts > 0 ? 'warn' : 'fail',
      points: mediaPts,
      maxPoints: 3,
      detail: `max-image-preview:large: ${hasMaxImage ? 'Yes' : 'No'} | OG tags: ${hasOg ? 'Complete' : 'Partial/Missing'}`,
      fix: 'Add `max-image-preview:large` plus explicit `og:title` and 1200x630 `og:image`.',
    });

    const hasLang = /<html[^>]+lang=["'][a-z]{2}/i.test(html.text);
    const hasMainOrArticle = /<(main|article)\b/i.test(html.text);
    const hasH2 = /<h2\b/i.test(html.text);
    const semPts = hasLang && hasMainOrArticle && hasH2 ? 3 : hasLang && (hasMainOrArticle || hasH2) ? 2 : 1;
    checks.push({
      id: 'semantic-landmarks',
      category: 'SSR & AI Extractability',
      label: 'Semantic HTML Landmarks & Hierarchy',
      status: semPts === 3 ? 'pass' : 'warn',
      points: semPts,
      maxPoints: 3,
      detail: `lang attr: ${hasLang ? 'Yes' : 'No'} | <main>/<article>: ${hasMainOrArticle ? 'Yes' : 'No'} | H2 sections: ${hasH2 ? 'Yes' : 'No'}`,
      fix: 'Set <html lang="en">, wrap core prose in <main>/<article>, and structure answers under <h2> headings.',
    });

    // ═══════════ 3. SCHEMA & KNOWLEDGE GRAPH (20 pts) ═══════════
    const ldScripts = Array.from(
      html.text.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    );
    const jsonLdTypes = new Set<string>();
    const schemaIds = new Set<string>();
    let hasWikidata = false;
    let hasSocialSameAs = false;
    let hasAeoSchema = false;
    let invalidJsonCount = 0;

    const inspectSchema = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach(inspectSchema);
        return;
      }
      const obj = node as Record<string, unknown>;
      const t = obj['@type'];
      const types = typeof t === 'string' ? [t] : Array.isArray(t) ? t.filter((x): x is string => typeof x === 'string') : [];
      for (const typeName of types) {
        jsonLdTypes.add(typeName);
        if (['SpeakableSpecification', 'FAQPage', 'DefinedTermSet', 'DefinedTerm'].includes(typeName)) {
          hasAeoSchema = true;
        }
      }
      if (typeof obj['@id'] === 'string') schemaIds.add(obj['@id']);
      if (obj.speakable || obj.citation) hasAeoSchema = true;

      const sameAs = obj.sameAs;
      const sameArr = typeof sameAs === 'string' ? [sameAs] : Array.isArray(sameAs) ? sameAs : [];
      for (const s of sameArr) {
        if (typeof s === 'string') {
          if (s.includes('wikidata.org')) hasWikidata = true;
          if (/linkedin\.com|x\.com|twitter\.com|github\.com|wikipedia\.org/i.test(s)) hasSocialSameAs = true;
        }
      }
      Object.values(obj).forEach(inspectSchema);
    };

    for (const m of ldScripts) {
      try {
        inspectSchema(JSON.parse(m[1]));
      } catch {
        invalidJsonCount++;
      }
    }

    const ldPts = invalidJsonCount > 0 && jsonLdTypes.size === 0 ? 0 : jsonLdTypes.size >= 2 ? 8 : jsonLdTypes.size === 1 ? 4 : 0;
    checks.push({
      id: 'jsonld-valid',
      category: 'Schema & Knowledge Graph',
      label: 'Valid JSON-LD Structured Data',
      status: ldPts === 8 ? 'pass' : ldPts > 0 ? 'warn' : 'fail',
      points: ldPts,
      maxPoints: 8,
      detail:
        jsonLdTypes.size > 0
          ? `Types: ${Array.from(jsonLdTypes).join(', ')}${invalidJsonCount ? ` (${invalidJsonCount} malformed block)` : ''}`
          : 'No valid JSON-LD structured data found',
      fix: 'Emit valid schema.org JSON-LD blocks describing Organization, WebSite, Product/Service, and Articles.',
    });

    const hasEntityAnchor =
      schemaIds.size >= 2 &&
      ['Organization', 'WebSite', 'Person', 'SoftwareApplication', 'Service', 'TechArticle'].some((t) => jsonLdTypes.has(t));
    const entityPts = hasEntityAnchor ? 5 : jsonLdTypes.has('Organization') || jsonLdTypes.has('WebSite') ? 3 : 0;
    checks.push({
      id: 'entity-authority',
      category: 'Schema & Knowledge Graph',
      label: 'Connected @id Entity Graph',
      status: entityPts === 5 ? 'pass' : entityPts > 0 ? 'warn' : 'fail',
      points: entityPts,
      maxPoints: 5,
      detail: hasEntityAnchor
        ? `${schemaIds.size} persistent @id entity nodes linked across graph`
        : 'Missing persistent @id graph links across Organization, WebSite, and Founders/Products',
      fix: 'Link Organization, Founders, Products, and WebSite with persistent @id URIs in one unified @graph.',
    });

    const wikiPts = hasWikidata ? 4 : hasSocialSameAs ? 2 : 0;
    checks.push({
      id: 'wikidata-sameas',
      category: 'Schema & Knowledge Graph',
      label: 'Wikidata & External sameAs Grounding',
      status: wikiPts === 4 ? 'pass' : wikiPts > 0 ? 'warn' : 'fail',
      points: wikiPts,
      maxPoints: 4,
      detail: hasWikidata
        ? 'Wikidata QID entity links present alongside external sameAs profiles'
        : hasSocialSameAs
          ? 'Social sameAs present, but missing canonical Wikidata concept QIDs'
          : 'No Wikidata or authoritative external sameAs links found',
      fix: 'Link knowsAbout / about Thing nodes to canonical Wikidata URIs (e.g. wikidata.org/wiki/Q11660).',
    });

    checks.push({
      id: 'aeo-schema',
      category: 'Schema & Knowledge Graph',
      label: 'AEO Schema (Speakable / FAQPage / Citation)',
      status: hasAeoSchema ? 'pass' : 'warn',
      points: hasAeoSchema ? 3 : 0,
      maxPoints: 3,
      detail: hasAeoSchema
        ? 'Detected AEO extraction schema (SpeakableSpecification / FAQPage / citation / DefinedTermSet)'
        : 'No FAQPage, SpeakableSpecification, or citation schema detected on this URL',
      fix: 'Add FAQPage or SpeakableSpecification selectors around concise answer-first summaries.',
    });

    // ═══════════ 4. 2026 AI-NATIVE PROTOCOLS (20 pts) ═══════════
    const llmsCt = (llms?.headers.get('content-type') || '').toLowerCase();
    const llmsValid = Boolean(
      llms &&
        llms.status === 200 &&
        !llmsCt.includes('text/html') &&
        !llms.text.trim().toLowerCase().startsWith('<!doctype') &&
        !llms.text.trim().toLowerCase().startsWith('<html') &&
        /^#\s|\]\(https?:\/\//m.test(llms.text)
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
        ? `Valid Markdown /llms.txt (~${Math.ceil((llms?.text.length || 0) / 4)} tokens${hasMdLinksInLlms ? ', v2 .md links present' : ''})`
        : 'Missing valid Markdown /llms.txt index at origin root',
      fix: 'Publish a structured Markdown /llms.txt file with v2 .md mirror links for coding & research agents.',
    });

    const mdCt = (md?.headers.get('content-type') || '').toLowerCase();
    const mdNegotiated = Boolean(
      md && md.status === 200 && mdCt.includes('text/markdown') && !md.text.trim().toLowerCase().startsWith('<!doctype')
    );
    checks.push({
      id: 'accept-markdown',
      category: '2026 AI-Native Protocols',
      label: 'HTTP Accept: text/markdown Negotiation',
      status: mdNegotiated ? 'pass' : 'warn',
      points: mdNegotiated ? 5 : 0,
      maxPoints: 5,
      detail: mdNegotiated
        ? `Served clean text/markdown (X-Markdown-Tokens: ${md?.headers.get('x-markdown-tokens') || 'n/a'})`
        : `Returned "${mdCt.split(';')[0] || 'HTML'}" when Accept: text/markdown was requested`,
      fix: 'Negotiate Accept: text/markdown at middleware/edge to serve stripped Markdown twins to AI agents.',
    });

    const headerSignal = html.headers.get('content-signal') || '';
    const hasContentSignal = Boolean(headerSignal || parsedRobots.hasRobotsContentSignal);
    checks.push({
      id: 'content-signal',
      category: '2026 AI-Native Protocols',
      label: 'Content-Signal Usage Policy',
      status: hasContentSignal ? 'pass' : 'warn',
      points: hasContentSignal ? 4 : 0,
      maxPoints: 4,
      detail: hasContentSignal
        ? `Policy declared: ${headerSignal || parsedRobots.robotsContentSignal}`
        : 'No Content-Signal directive found in HTTP headers or robots.txt',
      fix: 'Declare `Content-Signal: search=yes, ai-input=yes, ai-train=yes` (or custom AI policy) in headers & robots.txt.',
    });

    let agentCardValid = false;
    if (agent && agent.status === 200) {
      try {
        const parsedAgent = JSON.parse(agent.text);
        if (parsedAgent && typeof parsedAgent.name === 'string' && (parsedAgent.skills || parsedAgent.capabilities || parsedAgent.url)) {
          agentCardValid = true;
        }
      } catch {
        agentCardValid = false;
      }
    }
    checks.push({
      id: 'agent-card',
      category: '2026 AI-Native Protocols',
      label: 'Google A2A /.well-known/agent-card.json',
      status: agentCardValid ? 'pass' : 'warn',
      points: agentCardValid ? 3 : 0,
      maxPoints: 3,
      detail: agentCardValid ? 'Valid A2A Agent Card manifest published' : 'No valid /.well-known/agent-card.json found',
      fix: 'Expose an A2A Agent Card describing capabilities, endpoints, and supported input/output modes.',
    });

    const hasSpeculation = /<script[^>]+type=["']speculationrules["']/i.test(html.text);
    checks.push({
      id: 'speculation-rules',
      category: '2026 AI-Native Protocols',
      label: 'Speculation Rules API Prerendering',
      status: hasSpeculation ? 'pass' : 'warn',
      points: hasSpeculation ? 3 : 0,
      maxPoints: 3,
      detail: hasSpeculation ? 'Speculation Rules prerender block active' : 'No <script type="speculationrules"> detected',
      fix: 'Declare moderate Speculation Rules prerendering for high-intent documentation and product paths.',
    });

    // ═══════════ 5. DISCOVERY, TRUST & SPEED (10 pts) ═══════════
    const isHttps = finalParsed.protocol === 'https:';
    const speedPts = !isHttps ? 1 : html.ttfbMs <= 600 ? 5 : html.ttfbMs <= 1400 ? 3 : 1;
    checks.push({
      id: 'ttfb-https',
      category: 'Discovery, Trust & Speed',
      label: 'HTTPS Transport & Edge TTFB Speed',
      status: speedPts === 5 ? 'pass' : speedPts >= 3 ? 'warn' : 'fail',
      points: speedPts,
      maxPoints: 5,
      detail: `Protocol: ${finalParsed.protocol.replace(':', '').toUpperCase()} | Measured TTFB: ${html.ttfbMs}ms`,
      fix: 'Serve over HTTPS with edge caching / ISR and cookie-free public SSR to keep TTFB <= 600ms.',
    });

    const hasFeed = /application\/(rss|atom)\+xml/i.test(html.text);
    const linkHeader = (html.headers.get('link') || '').toLowerCase();
    const hasDiscoveryLink = hasFeed || linkHeader.includes('rel="describedby"') || linkHeader.includes('rel="alternate"');
    checks.push({
      id: 'discovery-links',
      category: 'Discovery, Trust & Speed',
      label: 'RSS/Atom & Link Header Autodiscovery',
      status: hasFeed && linkHeader.includes('alternate') ? 'pass' : hasDiscoveryLink ? 'pass' : 'warn',
      points: hasDiscoveryLink ? 3 : 0,
      maxPoints: 3,
      detail: `RSS/Atom feed: ${hasFeed ? 'Yes' : 'No'} | HTTP Link header: ${linkHeader ? 'Yes' : 'No'}`,
      fix: 'Expose <link rel="alternate" type="application/rss+xml"> and HTTP Link rel="describedby" / rel="alternate" headers.',
    });

    const secCt = (sec?.headers.get('content-type') || '').toLowerCase();
    const secValid = Boolean(sec && sec.status === 200 && !secCt.includes('text/html') && /contact:/i.test(sec.text));
    checks.push({
      id: 'security-txt',
      category: 'Discovery, Trust & Speed',
      label: 'RFC 9116 /.well-known/security.txt',
      status: secValid ? 'pass' : 'warn',
      points: secValid ? 2 : 0,
      maxPoints: 2,
      detail: secValid ? 'Valid RFC 9116 security disclosure file found' : 'No valid /.well-known/security.txt found',
      fix: 'Publish /.well-known/security.txt with Contact: and Canonical: fields for enterprise security trust.',
    });

    const totalScore = checks.reduce((sum, c) => sum + c.points, 0);
    const categories = Array.from(new Set(checks.map((c) => c.category))).map((cat) => {
      const group = checks.filter((c) => c.category === cat);
      return {
        category: cat,
        score: group.reduce((s, c) => s + c.points, 0),
        max: group.reduce((s, c) => s + c.maxPoints, 0),
      };
    });

    const protocolSummary = [
      { key: 'llms.txt', active: llmsValid },
      { key: 'text/markdown', active: mdNegotiated },
      { key: 'Content-Signal', active: hasContentSignal },
      { key: 'A2A Agent Card', active: agentCardValid },
      { key: 'Speculation Rules', active: hasSpeculation },
      { key: 'Wikidata QIDs', active: hasWikidata },
      { key: 'AEO Schema', active: hasAeoSchema },
      { key: 'RSS / Discovery', active: hasDiscoveryLink },
    ];

    const embedBadgeHtml = `<a href="https://www.pixenox.com/tools/ai-visibility-checker" target="_blank" rel="noopener">AI Visibility Audited (${totalScore}/100) by Pixenox Engenox</a>`;

    return NextResponse.json({
      auditState: 'ok' as AuditState,
      auditedUrl: html.finalUrl,
      host: finalParsed.hostname,
      statusCode: html.status,
      redirectHops: html.redirectHops,
      redirectChain: html.redirectChain,
      score: totalScore,
      grade: gradeFromScore(totalScore),
      ttfbMs: html.ttfbMs,
      ssrWords,
      textToHtmlRatio,
      pageTitle: pageTitle || finalParsed.hostname,
      detectedSchemaTypes: Array.from(jsonLdTypes),
      botMatrix: parsedRobots.botMatrix,
      protocolSummary,
      categories,
      checks,
      embedBadgeHtml,
    });
  } catch {
    return NextResponse.json({ error: 'Unexpected error while auditing target URL.' }, { status: 500 });
  }
}
