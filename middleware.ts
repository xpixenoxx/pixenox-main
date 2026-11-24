import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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
