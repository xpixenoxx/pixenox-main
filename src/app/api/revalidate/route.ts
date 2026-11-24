import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { CORE_INDEXNOW_URLS, submitIndexNow } from '@/lib/seo/indexnow'

export async function POST(req: NextRequest) {
  try {
    // Basic verification token logic (In production verify Supabase webhook signature)
    const token = req.nextUrl.searchParams.get('token')
    if (process.env.REVALIDATION_TOKEN && token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()

    // Fast heuristic based on table to clear layout cache / root cache
    const table = payload.table
    
    // Purges all public ISR routes & cache tags cleanly
    revalidatePath('/', 'layout')
    for (const tag of ['layout', 'home', 'seo', 'engineering', 'blog', 'work', 'company', 'faqs', 'careers']) {
      revalidateTag(tag, 'max')
    }

    let indexNowResult = null;
    try {
      const slug = payload?.record?.slug;
      const urlsToPing =
        table === 'blog_posts' && typeof slug === 'string' && slug
          ? ['https://www.pixenox.com/blog', `https://www.pixenox.com/blog/${slug}`]
          : CORE_INDEXNOW_URLS;
      indexNowResult = await submitIndexNow(urlsToPing);
    } catch {
      indexNowResult = { ok: false };
    }

    return NextResponse.json({ 
      revalidated: true, 
      table, 
      indexNow: indexNowResult,
      now: Date.now() 
    })
  } catch {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}
