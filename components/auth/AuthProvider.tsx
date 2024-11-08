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
  const isMounted = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const isInitialized = useRef(false);

  const initializeAuth = useCallback(async () => {
    if (isInitialized.current) return;
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error } = await supabaseAuth.auth.getSession();
      
      if (error) throw error;

      if (currentSession?.user && currentSession.user.id !== currentUserId.current) {
        currentUserId.current = currentSession.user.id;
        setUser(currentSession.user);
        setSession(currentSession);

        if (isMounted.current) {
          const { data: profile } = await supabaseAuth
            .from('profiles')
            .select('profile_completed')
            .eq('id', currentSession.user.id)
            .single();

          setProfileCompleted(!!profile?.profile_completed);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      currentUserId.current = null;
      setUser(null);
      setSession(null);
    } finally {
      isInitialized.current = true;
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // One-time setup
  useEffect(() => {
    isMounted.current = true;
    initializeAuth();
    return () => {
      isMounted.current = false;
    };
  }, [initializeAuth]);

  // Auth state listener
  useEffect(() => {
    if (!isMounted.current) return;

    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession?.user?.id);

        if (event === 'SIGNED_OUT') {
          currentUserId.current = null;
          setUser(null);
          setSession(null);
          setProfileCompleted(false);
          setIsLoading(false);
          router.push('/');
          return;
        }

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
          // Prevent duplicate state updates
          if (newSession.user.id === currentUserId.current) {
            setIsLoading(false);
            return;
          }

          setIsLoading(true);
          currentUserId.current = newSession.user.id;
          setUser(newSession.user);
          setSession(newSession);

          try {
            const { data: profile } = await supabaseAuth
              .from('profiles')
              .select('profile_completed')
              .eq('id', newSession.user.id)
              .single();

            if (isMounted.current) {
              setProfileCompleted(!!profile?.profile_completed);
              if (event === 'SIGNED_IN' && profile?.profile_completed) {
                router.push('/profile');
              }
            }
          } catch (error) {
            console.error('Profile fetch error:', error);
          } finally {
            if (isMounted.current) {
              setIsLoading(false);
            }
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Handle visibility change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized.current) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Only check session if we have a current user
          if (currentUserId.current) {
            supabaseAuth.auth.getSession().then(({ data: { session: currentSession } }) => {
              if (!currentSession || currentSession.user?.id !== currentUserId.current) {
                initializeAuth();
              }
            });
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [initializeAuth]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabaseAuth.auth.signOut();
      if (error) throw error;

      currentUserId.current = null;
      setUser(null);
      setSession(null);
      setProfileCompleted(false);
      
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [router]);

  const value = {
    user,
    session,
    isLoading,
    profileCompleted,
    setProfileCompleted,
    signOut
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