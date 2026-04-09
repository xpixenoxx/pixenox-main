import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Basic verification token logic (In production verify Supabase webhook signature)
    const token = req.nextUrl.searchParams.get('token')
    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()

    // Fast heuristic based on table to clear layout cache / root cache
    const table = payload.table
    
    // Purges everything
    revalidatePath('/', 'layout')

    return NextResponse.json({ 
      revalidated: true, 
      table, 
      now: Date.now() 
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}
