import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user to determine redirect
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Fetch user profile for role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Redirect based on role
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin))
      } else {
        return NextResponse.redirect(new URL('/rep/dashboard', requestUrl.origin))
      }
    }
  }

  // If no code or something went wrong, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
