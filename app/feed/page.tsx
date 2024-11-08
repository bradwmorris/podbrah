'use client';

import { useEffect, useState, useRef } from 'react';
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
  const { user, isLoading: authLoading } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    // Handle the case where user is not authenticated
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Guard against performing operations with null user
    const userId = user?.id;
    if (!userId) return;

    // Prevent duplicate fetches
    if (isInitialized.current && userId === currentUserId.current) {
      return;
    }

    async function loadFeed() {
      try {
        setLoading(true);
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

        const formattedData = data?.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          user_interpretation: item.user_interpretation,
          created_at: item.created_at,
          podcast_title: item.overview_embed?.[0]?.metadata?.podcast_title || 'Unknown Podcast',
          profile: {
            id: item.profiles?.[0]?.id || 'unknown',
            twin_name: item.profiles?.[0]?.twin_name || 'Unknown User',
            avatar_url: item.profiles?.[0]?.avatar_url
          }
        })) || [];

        setFeedItems(formattedData);
        currentUserId.current = userId;
        isInitialized.current = true;
      } catch (err) {
        console.error('Error loading feed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [user, authLoading, router]);

  if (authLoading || (loading && !isInitialized.current)) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse text-lg">
            Loading feed...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-red-500">Please sign in to view the feed</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
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
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Friends Feed</h1>
        
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
                className="bg-border rounded-lg p-6 hover:border-ctaGreen transition-colors duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <Link href={`/profile/${item.user_id}`}>
                    <Avatar className="w-12 h-12 border-2 border-transparent hover:border-ctaGreen transition-colors">
                      <AvatarImage src={item.profile.avatar_url || ''} alt={item.profile.twin_name} />
                      <AvatarFallback className="bg-ctaGreen/20">
                        {item.profile.twin_name[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div className="flex-1">
                    <Link 
                      href={`/profile/${item.user_id}`}
                      className="font-semibold hover:text-ctaGreen transition-colors inline-block"
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
                    {new Date(item.created_at).toLocaleDateString()}
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