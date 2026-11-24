import { NextRequest, NextResponse } from 'next/server';
import { CORE_INDEXNOW_URLS, submitIndexNow } from '@/lib/seo/indexnow';

export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-revalidation-token');
    if (process.env.REVALIDATION_TOKEN && token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawUrls = Array.isArray(body?.urls) ? body.urls.filter((u: unknown): u is string => typeof u === 'string') : [];
    const targetUrls = body?.all || rawUrls.length === 0 ? CORE_INDEXNOW_URLS : rawUrls;

    const result = await submitIndexNow(targetUrls);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ error: 'IndexNow submission failed' }, { status: 500 });
  }
}
