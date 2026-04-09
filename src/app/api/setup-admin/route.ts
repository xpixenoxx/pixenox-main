import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * POST /api/setup-admin
 * 
 * One-time setup endpoint to promote a user to admin.
 * Requires the SUPABASE_SERVICE_ROLE_KEY to be set.
 * 
 * Body: { "email": "your@email.com" }
 * 
 * SECURITY: This endpoint is disabled in production.
 * Only works in development with the correct setup token.
 */
export async function POST(req: NextRequest) {
  // Kill switch: disabled in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production.' },
      { status: 403 }
    )
  }

  // Require a setup token for additional security
  const setupToken = req.headers.get('x-setup-token')
  if (!setupToken || setupToken !== process.env.SETUP_ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'Invalid setup token.' },
      { status: 401 }
    )
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find the user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const targetUser = users.find(u => u.email === email)

    if (!targetUser) {
      return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 })
    }

    // Update the user's metadata to include admin role
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      {
        user_metadata: {
          ...targetUser.user_metadata,
          role: 'admin',
        },
      }
    )

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been promoted to admin.`,
      user_id: data.user.id,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
