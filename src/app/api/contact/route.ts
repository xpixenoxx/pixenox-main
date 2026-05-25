import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isVpnIp } from '@/lib/vpn-check';

/**
 * POST /api/contact
 *
 * Rate-limited API route for all public contact/lead submissions.
 * Replaces direct client-side Supabase inserts for security.
 *
 * Body: { name, email, mobile?, services_interested?, message }
 *
 * Rate limit: 3 submissions per 24 hours per IP.
 *
 * Response codes:
 *   201 = submission accepted
 *   400 = validation failure (malformed body or missing required fields)
 *   403 = VPN/proxy/spam protection block
 *   429 = rate limit exceeded
 *   503 = external dependency unavailable (Supabase / Redis down)
 *   500 = unexpected server bug (should not happen in normal operation)
 */
export async function POST(req: NextRequest) {
  // ── Guard: ensure supabaseAdmin client was initialized ──
  // If SUPABASE_SERVICE_ROLE_KEY is missing, supabaseAdmin is null.
  // Attempting .from() on null throws a JS TypeError caught below.
  // Return 503 immediately instead so the root cause is surfaced clearly.
  if (!supabaseAdmin) {
    console.error('[/api/contact] supabaseAdmin is null — SUPABASE_SERVICE_ROLE_KEY may be missing.');
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  // ── Rate Limiting ──
  // Runs before VPN check and DB work to reject excess traffic cheaply.
  let rateLimitResult: { success: boolean; retryAfterSeconds?: number };
  try {
    rateLimitResult = await rateLimit(req, { limit: 3, windowSeconds: 86400 });
  } catch (err: any) {
    // Rate limiter threw (e.g. Upstash network error). Fail open to avoid blocking legit users.
    console.error('[/api/contact] Rate limiter threw unexpectedly:', err?.message ?? err);
    rateLimitResult = { success: true };
  }

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimitResult.retryAfterSeconds ?? 86400) },
      }
    );
  }

  // ── VPN / Proxy Check ──
  // Runs after rate limit so spammers are blocked cheaply first.
  // Fails open (returns false) on API errors — see vpn-check.ts.
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

  if (ip !== 'unknown') {
    let isVpn = false;
    try {
      isVpn = await isVpnIp(ip);
    } catch (err: any) {
      // isVpnIp already catches internally, but guard here too.
      console.warn('[/api/contact] VPN check threw unexpectedly:', err?.message ?? err);
      isVpn = false; // Fail open — do not block legitimate users if check errors.
    }

    if (isVpn) {
      return NextResponse.json(
        { error: 'VPN or Proxy usage detected. Please disable your VPN to submit this form.' },
        { status: 403 }
      );
    }
  }

  // ── Body Parsing ──
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    // req.json() throws SyntaxError for malformed JSON bodies.
    return NextResponse.json({ error: 'Invalid request body: expected JSON.' }, { status: 400 });
  }

  // ── Validation ──
  const { name, email, mobile, services_interested, message } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  // ── Sanitize Inputs ──
  const payload: Record<string, any> = {
    name: name.trim().slice(0, 200),
    email: email.trim().slice(0, 200),
    message: message.trim().slice(0, 5000),
  };

  if (mobile && typeof mobile === 'string' && mobile.trim()) {
    payload.mobile = mobile.trim().slice(0, 30);
  }

  if (Array.isArray(services_interested)) {
    payload.services_interested = services_interested
      .filter((s: any) => typeof s === 'string')
      .map((s: string) => s.trim().slice(0, 200))
      .slice(0, 20);
  }

  // ── Insert via server-side admin client ──
  try {
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert(payload);

    if (dbError) {
      // Supabase returned a structured error (e.g. schema violation, constraint error).
      console.error('[/api/contact] Supabase insert error:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
      });

      // Distinguish between a client-caused error (bad data) and a service-side failure.
      // Supabase error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
      // 23xxx = constraint violations (e.g. duplicate, not-null, check constraint)
      if (dbError.code?.startsWith('23')) {
        return NextResponse.json(
          { error: 'Submission rejected due to a data conflict.' },
          { status: 409 }
        );
      }

      // All other DB errors (connection timeout, server error) → 503
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (err: any) {
    // Catches unexpected JS exceptions during DB work (e.g. network timeout throwing,
    // or a fetch-level error from the Supabase client internals).
    console.error('[/api/contact] Unexpected exception during DB insert:', {
      message: err?.message ?? String(err),
      stack: err?.stack,
    });
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}
