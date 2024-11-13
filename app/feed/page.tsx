'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from '@/components/header';
import { Quote } from 'lucide-react';

interface FeedItem {
  id: number;
  user_id: string;
  podcast_id: number;
  podcast_title: string;
  twin_name: string;
  avatar_url: string | null;
  created_at: string;
  why_listen: string;
  podcast_link: string;
}

const extractYouTubeId = (url: string): string | null => {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return null;
  }
};

const getPodcastThumbnail = (podcastLink: string): string | null => {
  if (!podcastLink) return null;
  const youtubeId = extractYouTubeId(podcastLink);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
};

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
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const userId = user?.id;
    if (!userId) return;

    if (isInitialized.current && userId === currentUserId.current) {
      return;
    }

    async function loadFeed() {
      try {
        setLoading(true);
        const { data, error: queryError } = await supabaseAuth
          .from('feed')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;
        if (data) setFeedItems(data);
        
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
          <div className="animate-pulse text-lg">Loading feed...</div>
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
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">
          Friends Feed
        </h1>
        
        <div className="space-y-8">
          {feedItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No ideas shared yet.</p>
              <p className="text-gray-500 mt-2">Be the first to share your thoughts!</p>
            </div>
          ) : (
            feedItems.map((item) => {
              const thumbnailUrl = getPodcastThumbnail(item.podcast_link);
              
              return (
                <div
                  key={item.id}
                  className="border border-white/10 rounded-xl p-6 hover:border-ctaGreen/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="space-y-6">
                    {/* User Info - Removed Links */}
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 border-2 border-transparent">
                        <AvatarImage src={item.avatar_url || ''} alt={item.twin_name} />
                        <AvatarFallback className="bg-gradient-to-br from-ctaGreen/20 to-blue-500/20 text-xl">
                          {item.twin_name[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 pt-1">
                        <span className="text-xl font-bold text-white">
                          {item.twin_name}
                        </span>
                        <p className="text-sm text-gray-400 mt-1">
                          {item.podcast_title}
                        </p>
                        <time 
                          className="text-sm text-gray-500 block mt-1"
                          dateTime={item.created_at}
                        >
                          {new Date(item.created_at).toLocaleDateString()}
                        </time>
                      </div>
                    </div>

                    {/* Content - Quote Style */}
                    <div className="relative">
                      <Quote className="absolute text-ctaGreen/20 w-12 h-12 -left-2 -top-2" />
                      <div className="relative z-10 pl-8">
                        <p className="text-2xl font-light text-gray-200 leading-relaxed italic">
                          "{item.why_listen}"
                        </p>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {thumbnailUrl && (
                      <div className="w-full mt-6">
                        <img
                          src={thumbnailUrl}
                          alt={item.podcast_title}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes('maxresdefault')) {
                              img.src = img.src.replace('maxresdefault', 'hqdefault');
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end pt-2">
                      {item.podcast_link && (
                        <a
                          href={item.podcast_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-ctaGreen hover:text-white transition-colors"
                        >
                          Listen to the podcast →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}