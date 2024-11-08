'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from '@/components/header';

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
}

interface UserIdea {
  id: number;
  podcast_id: number;
  user_interpretation: string;
  created_at: string;
  podcast_title?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ideas, setIdeas] = useState<UserIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const userId = user?.id;
    if (!userId) return;

    if (isInitialized.current && userId === currentUserId.current) {
      return;
    }

    async function loadProfileAndIdeas() {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabaseAuth
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Fetch ideas
        const { data: ideasData, error: ideasError } = await supabaseAuth
          .from('user_ideas')
          .select(`
            *,
            overview_embed(metadata)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (ideasError) throw ideasError;

        setProfile(profileData);
        setIdeas(ideasData.map((idea: any) => ({
          id: idea.id,
          podcast_id: idea.podcast_id,
          user_interpretation: idea.user_interpretation,
          created_at: idea.created_at,
          podcast_title: idea.overview_embed?.[0]?.metadata?.podcast_title || 'Unknown Podcast',
        })));

        currentUserId.current = userId;
        isInitialized.current = true;
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndIdeas();
  }, [user, authLoading, router]);

  if (authLoading || (loading && !isInitialized.current)) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <p className="text-red-500">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
            <p>{error || 'Profile not found'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-border rounded-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
              <AvatarFallback>{profile.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-gray-400 mt-2">Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Ideas & Podcasts</h2>
          {ideas.length === 0 ? (
            <p className="text-gray-400">No ideas shared yet.</p>
          ) : (
            ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-border rounded-lg p-6 hover:border-ctaGreen transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ctaGreen">
                      {idea.podcast_title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-200">{idea.user_interpretation}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}