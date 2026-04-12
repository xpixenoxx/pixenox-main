import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/contact
 *
 * Rate-limited API route for all public contact/lead submissions.
 * Replaces direct client-side Supabase inserts for security.
 *
 * Body: { name, email, mobile?, services_interested?, message }
 *
 * Rate limit: 5 submissions per 60 seconds per IP.
 */
export async function POST(req: NextRequest) {
  // ── Rate Limiting ──
  const { success, retryAfterSeconds } = await rateLimit(req, {
    limit: 5,
    windowSeconds: 60,
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      }
    );
  }

  // ── Validation ──
  try {
    const body = await req.json();
    const { name, email, mobile, services_interested, message, turnstileToken } = body;

    // ── Turnstile Cloudflare Verification ──
    if (!turnstileToken) {
      return NextResponse.json({ error: 'Turnstile verification token missing. Are you a robot?' }, { status: 400 });
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
    });
    
    const turnstileData = await verifyRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({ error: 'Failed Turnstile validation. Security breach prevented.' }, { status: 403 });
    }

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

    // Sanitize inputs
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
    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .insert(payload);

    if (error) {
      console.error('[/api/contact] Supabase error:', error.message);
      return NextResponse.json(
        { error: 'Failed to submit. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[/api/contact] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
