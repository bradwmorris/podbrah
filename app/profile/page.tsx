// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from '@/components/header';

interface UserIdea {
  id: number;
  podcast_id: number;
  user_interpretation: string;
  created_at: string;
  podcast_title?: string;
}

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ideas, setIdeas] = useState<UserIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Profile page mounted, auth loading:', authLoading, 'user:', user?.id);
    
    async function loadProfileAndIdeas() {
      if (authLoading) {
        console.log('Auth is still loading...');
        return;
      }
      
      if (!user || !session) {
        console.log('No user or session, redirecting to login...');
        router.push('/auth/login');
        return;
      }

      try {
        // Fetch profile
        console.log('Fetching profile for user:', user.id);
        const { data: profileData, error: profileError } = await supabaseAuth
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }

        console.log('Profile data retrieved:', profileData);
        setProfile(profileData);

        // Fetch ideas
        const { data: ideasData, error: ideasError } = await supabaseAuth
          .from('user_ideas')
          .select(`
            *,
            overview_embed(metadata)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ideasError) {
          console.error('Ideas fetch error:', ideasError);
          throw ideasError;
        }

        setIdeas(ideasData.map(idea => ({
          id: idea.id,
          podcast_id: idea.podcast_id,
          user_interpretation: idea.user_interpretation,
          created_at: idea.created_at,
          podcast_title: idea.overview_embed?.metadata?.podcast_title || 'Unknown Podcast',
        })));
      } catch (err: any) {
        console.error('Error loading profile data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndIdeas();
  }, [user, authLoading, session, router]);

  if (authLoading || loading) {
    console.log('Showing loading state...');
    return (
      <div className="min-h-screen bg-[#0E1116] text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    console.log('No user/session in render phase, showing sign in message...');
    return (
      <div className="min-h-screen bg-[#0E1116] text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-500">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    console.log('Error or no profile:', error);
    return (
      <div className="min-h-screen bg-[#0E1116] text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-500">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1116] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-[#161B22] rounded-lg p-8 mb-8">
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
                className="bg-[#161B22] rounded-lg p-6 hover:border-[#21C55D] border border-transparent transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#21C55D]">
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
