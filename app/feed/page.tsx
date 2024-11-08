// app/feed/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from '@/components/header';
import Link from 'next/link';

interface Profile {
  id: string;
  twin_name: string;
  avatar_url: string | null;
}

interface OverviewEmbed {
  id: number;
  metadata: {
    podcast_title: string;
  };
}

interface SupabaseData {
  id: number;
  user_id: string;
  user_interpretation: string;
  created_at: string;
  podcast_id: number;
  profiles: { 
    id: string;
    twin_name: string;
    avatar_url: string | null;
  }[];
  overview_embed: {
    id: number;
    metadata: {
      podcast_title: string;
    };
  }[];
}

interface FeedItem {
  id: number;
  user_id: string;
  user_interpretation: string;
  created_at: string;
  podcast_title: string;
  profile: Profile;
}

export default function FeedPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, session } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    console.log('Feed page mounted:', {
      authLoading,
      hasUser: !!user,
      hasSession: !!session,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, []);

  useEffect(() => {
    console.log('Feed auth state changed:', {
      authLoading,
      hasUser: !!user,
      hasSession: !!session,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [authLoading, user, session]);

  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      if (!user || !session) {
        console.log('No auth, redirecting...');
        router.push('/auth/login');
        return;
      }

      try {
        console.log('Loading feed for user:', user.id);
        
        const { data, error: queryError } = await supabaseAuth
          .from('user_ideas')
          .select(`
            id,
            user_id,
            user_interpretation,
            created_at,
            podcast_id,
            profiles (
              id,
              twin_name,
              avatar_url
            ),
            overview_embed (
              id,
              metadata
            )
          `)
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;

        if (!data) {
          throw new Error('No data returned from query');
        }

        if (isMounted) {
          const formattedData = data.map((item: any) => {
            // Safely extract profile data
            const profile = item.profiles && Array.isArray(item.profiles) && item.profiles.length > 0
              ? item.profiles[0]
              : { id: 'unknown', twin_name: 'Unknown User', avatar_url: null };

            // Safely extract podcast title
            const podcastTitle = item.overview_embed && 
                               Array.isArray(item.overview_embed) && 
                               item.overview_embed.length > 0 && 
                               item.overview_embed[0]?.metadata?.podcast_title || 'Unknown Podcast';

            return {
              id: item.id,
              user_id: item.user_id,
              user_interpretation: item.user_interpretation,
              created_at: item.created_at,
              podcast_title: podcastTitle,
              profile: {
                id: profile.id,
                twin_name: profile.twin_name,
                avatar_url: profile.avatar_url
              }
            };
          });

          console.log('Feed data loaded:', {
            itemCount: formattedData.length,
            timestamp: new Date().toISOString()
          });

          setFeedItems(formattedData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading feed:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load feed');
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadFeed();
    } else {
      console.log('Waiting for auth to complete...');
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, session, router]);

  if (authLoading || loading) {
    console.log('Rendering loading state:', {
      authLoading,
      loading,
      timestamp: new Date().toISOString()
    });
    return (
      <div className="min-h-screen bg-[#0E1116] text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-lg">
            {authLoading ? 'Checking authentication...' : 'Loading feed...'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1116] text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
            <p>Error: {error}</p>
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
    <div className="min-h-screen bg-[#0E1116] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Digital Twin Feed</h1>
        
        <div className="space-y-6">
          {feedItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No ideas shared yet.</p>
              <p className="text-gray-500 mt-2">Be the first to share your thoughts!</p>
            </div>
          ) : (
            feedItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#161B22] rounded-lg p-6 hover:border-[#21C55D] border border-transparent transition-colors duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <Link href={`/profile/${item.user_id}`}>
                    <Avatar className="w-12 h-12 border-2 border-transparent hover:border-[#21C55D] transition-colors">
                      <AvatarImage src={item.profile.avatar_url || ''} alt={item.profile.twin_name} />
                      <AvatarFallback className="bg-[#21C55D]/20">
                        {item.profile.twin_name[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div className="flex-1">
                    <Link 
                      href={`/profile/${item.user_id}`}
                      className="font-semibold hover:text-[#21C55D] transition-colors inline-block"
                    >
                      {item.profile.twin_name}
                    </Link>
                    <p className="text-sm text-gray-400">
                      From podcast: {item.podcast_title}
                    </p>
                  </div>
                  
                  <time 
                    className="text-sm text-gray-400"
                    dateTime={item.created_at}
                  >
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </div>

                <p className="text-gray-200 leading-relaxed">{item.user_interpretation}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}