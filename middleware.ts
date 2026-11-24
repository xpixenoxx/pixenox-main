import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const SITE_BASE = 'https://www.pixenox.com';

const EXACT_ELIGIBLE_PATHS = new Set([
  '/',
  '/company',
  '/faqs',
  '/glossary',
  '/products/engenox',
  '/tools/ai-visibility-checker',
  '/research/ai-visibility-benchmark-2026',
  '/compare/ai-visibility-platforms',
  '/engineering',
  '/work',
  '/blog',
]);

function isMarkdownEligiblePath(p: string): boolean {
  if (!p) return false;
  if (
    p === '/blog/feed.xml' ||
    p.startsWith('/api/') ||
    p.startsWith('/admin/') ||
    p.startsWith('/_next/') ||
    p.startsWith('/.well-known/') ||
    p === '/robots.txt' ||
    p === '/sitemap.xml' ||
    p === '/llms.txt' ||
    p === '/llms-full.txt' ||
    p === '/manifest.webmanifest'
  ) {
    return false;
  }
  if (EXACT_ELIGIBLE_PATHS.has(p)) return true;
  if (p.startsWith('/engineering/') || p.startsWith('/work/') || p.startsWith('/blog/')) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Redirect malformed /%24 or /$ crawl URL to homepage (GSC Not found 404 fix)
  if (path === '/$' || path === '/%24') {
    const dest = new URL('/', request.url);
    dest.search = '';
    return NextResponse.redirect(dest, 308);
  }

  // Return 410 Gone for retired off-topic ad-tutorial URLs from early site history
  if (path === '/blog/google-ads-for-beginners' || path === '/blog/meta-ads-complete-guide') {
    return new NextResponse('410 Gone — This legacy marketing article has been permanently retired.', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  if (path.startsWith('/admin')) {
    return await updateSession(request)
  }

  // Explicit .md twin routes (e.g. /index.md, /products/engenox.md, /blog/slug.md)
  if (path.endsWith('.md')) {
    const stripped = path.slice(0, -3) || '/';
    const base = stripped === '/index' ? '/' : stripped;
    if (isMarkdownEligiblePath(base)) {
      const apiTarget = `/api/md${base === '/' ? '' : base}`;
      return NextResponse.rewrite(new URL(apiTarget, request.url));
    }
  }

  // HTTP Accept: text/markdown content negotiation for AI agents
  if (isMarkdownEligiblePath(path)) {
    const accept = (request.headers.get('accept') || '').toLowerCase();
    const mdIdx = accept.indexOf('text/markdown');
    const htmlIdx = accept.indexOf('text/html');
    if (mdIdx !== -1 && (htmlIdx === -1 || mdIdx < htmlIdx)) {
      const apiTarget = `/api/md${path === '/' ? '' : path}`;
      return NextResponse.rewrite(new URL(apiTarget, request.url));
    }

    const res = NextResponse.next();
    res.headers.set('Vary', 'Accept');
    res.headers.set('Content-Signal', 'search=yes, ai-input=yes, ai-train=yes');
    const mdUrl = path === '/' ? `${SITE_BASE}/index.md` : `${SITE_BASE}${path}.md`;
    res.headers.set(
      'Link',
      `<${SITE_BASE}/llms.txt>; rel="describedby"; type="text/markdown", <${mdUrl}>; rel="alternate"; type="text/markdown"`
    );
    return res;
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|css)$).*)',
  ],
}
