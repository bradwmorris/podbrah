// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) throw authError;
      
      if (session) {
        // First, check if a profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', session.user.id)
          .single();

        // If no profile exists or profile is not completed, redirect to complete-profile
        if (!profile || !profile.profile_completed) {
          // If no profile exists, create one
          if (!profile) {
            await supabase
              .from('profiles')
              .insert([{ 
                id: session.user.id, 
                email: session.user.email,
                profile_completed: false 
              }]);
          }
          return NextResponse.redirect(new URL('/complete-profile', request.url));
        }
        
        // If profile exists and is completed, redirect to profile
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url));
}