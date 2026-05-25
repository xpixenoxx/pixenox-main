import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── INTERNAL APP / VPN FIREWALL ──
  // Block direct internet access to the admin panel. Only allow predefined Corporate VPN IPs.
  if (path.startsWith('/admin')) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

    // Allow localhost for local development
    const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip === 'unknown';

    // Read allowed IPs from environment variable (comma-separated list of your corporate VPN IPs)
    // e.g. ALLOWED_VPN_IPS="203.0.113.50,198.51.100.10"
    const allowedIpsStr = process.env.ALLOWED_VPN_IPS || '';
    const validIps = allowedIpsStr.split(',').map((i) => i.trim()).filter(Boolean);

    // If not local and not in the allowed VPN IP list, deny access.
    // If ALLOWED_VPN_IPS is empty, this blocks everyone (except localhost).
    if (!isLocalhost && !validIps.includes(ip)) {
      return new NextResponse(
        'Access Denied: Direct Internet Access Blocked. You must be connected to the Corporate VPN to access this internal application.',
        { status: 403 }
      );
    }

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
