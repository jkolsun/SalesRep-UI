import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/auth']

// Routes that require admin role
const adminRoutes = ['/admin']

// Routes that require rep role
const repRoutes = ['/rep']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const pathname = req.nextUrl.pathname

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Skip middleware for public routes and static files
  if (
    isPublicRoute ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return res
  }

  try {
    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session and trying to access protected route, redirect to login
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user profile for role-based access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    // Check if user is active
    if (profile && !profile.is_active) {
      // Sign out inactive user
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=inactive', req.url))
    }

    // Check admin route access
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
    if (isAdminRoute && profile?.role !== 'admin') {
      // Redirect non-admins to rep dashboard
      return NextResponse.redirect(new URL('/rep/dashboard', req.url))
    }

    // Check rep route access
    const isRepRoute = repRoutes.some((route) => pathname.startsWith(route))
    if (isRepRoute && profile?.role !== 'rep' && profile?.role !== 'admin') {
      // Redirect to login if not a rep or admin
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return res
  } catch (error) {
    // On error, redirect to login
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
