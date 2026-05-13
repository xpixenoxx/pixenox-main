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
 * Rate limit: 3 submissions per 24 hours per IP.
 */
export async function POST(req: NextRequest) {
  // ── Rate Limiting ──
  const { success, retryAfterSeconds } = await rateLimit(req, {
    limit: 3,
    windowSeconds: 86400, // 24 hours
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
