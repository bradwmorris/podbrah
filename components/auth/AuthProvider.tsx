// components/auth/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profileCompleted: boolean;
  setProfileCompleted: (completed: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  profileCompleted: false,
  setProfileCompleted: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabaseAuth
        .from('profiles')
        .select('profile_completed')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return !!profile?.profile_completed;
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('Initializing auth...');
      const { data: { session: currentSession }, error } = await supabaseAuth.auth.getSession();

      if (error) throw error;

      if (currentSession?.user) {
        const isProfileCompleted = await checkProfile(currentSession.user.id);
        
        setUser(currentSession.user);
        setSession(currentSession);
        setProfileCompleted(isProfileCompleted);

        // Handle routing based on profile completion
        if (!isProfileCompleted && window.location.pathname !== '/complete-profile') {
          router.push('/complete-profile');
        } else if (isProfileCompleted && window.location.pathname === '/complete-profile') {
          router.push('/profile');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setSession(null);
      setProfileCompleted(false);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [checkProfile, router]);

  // Initial auth check
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auth state listener
  useEffect(() => {
    if (!isInitialized) return;

    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setProfileCompleted(false);
          setIsLoading(false);
          router.push('/auth/login');
          return;
        }

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
          setIsLoading(true);
          try {
            const isProfileCompleted = await checkProfile(newSession.user.id);
            
            setUser(newSession.user);
            setSession(newSession);
            setProfileCompleted(isProfileCompleted);

            if (event === 'SIGNED_IN') {
              if (isProfileCompleted) {
                router.push('/profile');
              } else {
                router.push('/complete-profile');
              }
            }
          } catch (error) {
            console.error('Profile check error:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, router, checkProfile]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabaseAuth.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        profileCompleted,
        setProfileCompleted,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};