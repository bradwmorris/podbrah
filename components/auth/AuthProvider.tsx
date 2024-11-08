'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const isRestoringSession = useRef(false);
  const initialized = useRef(false);

  const restoreSession = useCallback(async (force = false) => {
    if (isRestoringSession.current) return;
    if (!force && initialized.current) return;
    
    try {
      isRestoringSession.current = true;
      
      // Only show loading on initial load
      if (!initialized.current) {
        setIsLoading(true);
      }

      const { data: { session: currentSession }, error } = await supabaseAuth.auth.getSession();

      if (error) throw error;

      if (currentSession?.user) {
        setUser(currentSession.user);
        setSession(currentSession);

        // Only fetch profile if we don't have it yet
        if (!profileCompleted) {
          const { data: profile } = await supabaseAuth
            .from('profiles')
            .select('profile_completed')
            .eq('id', currentSession.user.id)
            .single();

          setProfileCompleted(!!profile?.profile_completed);
        }
      } else {
        setUser(null);
        setSession(null);
        setProfileCompleted(false);
      }
    } catch (error) {
      console.error('Session restoration error:', error);
      // Only clear state on force restore
      if (force) {
        setUser(null);
        setSession(null);
        setProfileCompleted(false);
      }
    } finally {
      initialized.current = true;
      isRestoringSession.current = false;
      setIsLoading(false);
    }
  }, [profileCompleted]);

  // Initial session restore
  useEffect(() => {
    restoreSession(true);
  }, [restoreSession]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setProfileCompleted(false);
          setIsLoading(false);
          router.push('/');
          return;
        }

        if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setUser(newSession.user);
          setSession(newSession);

          if (event === 'SIGNED_IN') {
            try {
              const { data: profile } = await supabaseAuth
                .from('profiles')
                .select('profile_completed')
                .eq('id', newSession.user.id)
                .single();

              setProfileCompleted(!!profile?.profile_completed);

              if (profile?.profile_completed) {
                router.push('/profile');
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
            }
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Focus handler with better state preservation
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && initialized.current) {
        // Only check session validity, don't reset state
        supabaseAuth.auth.getSession().then(({ data: { session: currentSession } }) => {
          if (currentSession?.user && currentSession.user.id !== user?.id) {
            restoreSession(true);
          }
        });
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [restoreSession, user?.id]);

  const value = {
    user,
    session,
    isLoading,
    profileCompleted,
    setProfileCompleted,
    signOut: useCallback(async () => {
      try {
        setIsLoading(true);
        const { error } = await supabaseAuth.auth.signOut();
        if (error) throw error;
        setUser(null);
        setSession(null);
        setProfileCompleted(false);
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        router.push('/');
      } catch (error) {
        console.error('Sign out error:', error);
      } finally {
        setIsLoading(false);
      }
    }, [router])
  };

  return (
    <AuthContext.Provider value={value}>
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