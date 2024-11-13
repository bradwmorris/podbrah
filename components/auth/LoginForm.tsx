// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Handle Sign Up
        const { data, error: signUpError } = await supabaseAuth.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Create initial profile
        if (data.user) {
          try {
            await supabaseAuth.from('profiles').insert([
              { 
                id: data.user.id,
                email: data.user.email,
                profile_completed: false
              }
            ]);
          } catch (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }

        setIsEmailSent(true);
        
      } else {
        // Handle Sign In
        const { error: signInError, data: signInData } = await supabaseAuth.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;

        if (signInData.session) {
          // Check if profile exists
          const { data: profile } = await supabaseAuth
            .from('profiles')
            .select('profile_completed')
            .eq('id', signInData.session.user.id)
            .single();

          if (!profile) {
            // Create profile if it doesn't exist
            await supabaseAuth.from('profiles').insert([
              {
                id: signInData.session.user.id,
                email: signInData.session.user.email,
                profile_completed: false
              }
            ]);
            router.push('/complete-profile');
          } else if (!profile.profile_completed) {
            router.push('/complete-profile');
          } else {
            router.push('/profile');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Check Your Email</h2>
        <p className="text-gray-300 mb-4">
          Please check your email for a confirmation link to complete your registration.
        </p>
        <Button
          onClick={() => {
            setIsEmailSent(false);
            setIsSignUp(false);
          }}
          className="w-full bg-ctaGreen text-white"
        >
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-input border-none text-white"
            required
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-input border-none text-white"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-ctaGreen text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Button>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-ctaGreen text-sm mt-4 hover:underline"
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
}