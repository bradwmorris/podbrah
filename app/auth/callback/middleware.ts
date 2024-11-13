// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Get URL information
  const { pathname } = request.nextUrl;

  // Public routes that don't need any checks
  const publicRoutes = ['/auth/login', '/auth/callback'];
  if (publicRoutes.includes(pathname)) {
    return res;
  }

  try {
    // Check auth status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;

    // If not logged in and trying to access protected routes
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Skip profile checks for auth routes
    if (pathname.startsWith('/auth/')) {
      return res;
    }

    // Check profile completion status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('profile_completed')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // Ignore "not found" errors
      throw profileError;
    }

    // If profile doesn't exist or is not completed, and not already on complete-profile
    if ((!profile || !profile.profile_completed) && pathname !== '/complete-profile') {
      return NextResponse.redirect(new URL('/complete-profile', request.url));
    }

    // If profile is completed and trying to access complete-profile
    if (profile?.profile_completed && pathname === '/complete-profile') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};