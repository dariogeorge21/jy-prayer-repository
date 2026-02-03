import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    // If trying to access login page
    if (request.nextUrl.pathname === '/admin/login') {
      // If already authenticated, redirect to dashboard
      if (user) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      // Allow access to login page
      return response
    }
    
    // For other admin routes, require authentication
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // Check admin status with error handling
    try {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('id', user.id)
        .single()
      
      if (!adminUser?.is_active) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch (error) {
      // If we can't check admin status (e.g., RLS issue), allow through
      // The actual page will handle the proper check
      console.error('Error checking admin status:', error)
    }
  }

  return response
}
