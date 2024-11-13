// app/profile/page.tsx
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
  name: string;
  twin_name: string;
  avatar_url: string | null;
  created_at: string;
}

interface UserIdea {
  id: number;
  podcast_title: string;
  user_interpretation: string;
  created_at: string;
  podcast_id: string;
}

interface GroupedIdeas {
  [key: string]: UserIdea[];
}

interface PodcastData {
  id: number;
  metadata: {
    podcast_link: string;
  };
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

export default function ProfilePage() {
  const router = useRouter();
  const ideasSectionRef = useRef<HTMLDivElement>(null);
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ideas, setIdeas] = useState<UserIdea[]>([]);
  const [podcastLinks, setPodcastLinks] = useState<Record<string, string>>({});
  const [groupedIdeas, setGroupedIdeas] = useState<GroupedIdeas>({});
  const [expandedPodcasts, setExpandedPodcasts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    if (ideas.length > 0) {
      const grouped = ideas.reduce((acc: GroupedIdeas, idea) => {
        if (!acc[idea.podcast_title]) {
          acc[idea.podcast_title] = [];
        }
        acc[idea.podcast_title].push(idea);
        return acc;
      }, {});
      setGroupedIdeas(grouped);

      const podcastIds = Array.from(new Set(ideas.map(idea => idea.podcast_id)));

      const fetchPodcastLinks = async () => {
        const { data, error } = await supabaseAuth
          .from('overview_embed')
          .select('id, metadata')
          .in('id', podcastIds);

        if (!error && data) {
          const links = data.reduce((acc: Record<string, string>, curr) => {
            if (curr.metadata?.podcast_link) {
              acc[curr.id] = curr.metadata.podcast_link;
            }
            return acc;
          }, {});
          setPodcastLinks(links);
        }
      };

      fetchPodcastLinks();
    }
  }, [ideas]);

  const togglePodcast = (podcastTitle: string) => {
    setExpandedPodcasts(prev => {
      const next = new Set(prev);
      if (next.has(podcastTitle)) {
        next.delete(podcastTitle);
      } else {
        next.add(podcastTitle);
      }
      return next;
    });
  };

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
        
        const { data: profileData, error: profileError } = await supabaseAuth
          .from('profiles')
          .select('id, name, twin_name, avatar_url, created_at')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        const { data: ideasData, error: ideasError } = await supabaseAuth
          .from('user_ideas')
          .select(`
            id,
            podcast_title,
            user_interpretation,
            created_at,
            podcast_id
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (ideasError) throw ideasError;
        
        setProfile(profileData);
        setIdeas(ideasData || []);

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
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Profile Section */}
        <div className="p-6 mb-12">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-transparent hover:border-ctaGreen transition-colors">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.twin_name} />
              <AvatarFallback className="bg-gradient-to-br from-ctaGreen/20 to-blue-500/20 text-2xl">
                {profile.twin_name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{profile.twin_name}</h1>
              <p className="text-gray-400 mt-2">
                Member since: {new Date(profile.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-300 mt-4">
                Hi {profile.name}, it's {profile.twin_name} your AI-Powered Podcast servant. Click the 'Feed' button above to view podcasts your friends are listening to.
              </p>
            </div>
          </div>
        </div>

        {/* Ideas Section */}
        <div className="space-y-8" ref={ideasSectionRef}>
          <h2 className="text-2xl font-bold text-white">
            All your Ideas and Podcasts
          </h2>

          {Object.keys(groupedIdeas).length === 0 ? (
            <p className="text-gray-400">No ideas shared yet.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedIdeas).map(([podcastTitle, podcastIdeas]) => {
                const firstIdea = podcastIdeas[0];
                const link = podcastLinks[firstIdea.podcast_id];
                const thumbnailUrl = link ? getPodcastThumbnail(link) : null;

                return (
                  <div
                    key={podcastTitle}
                    className="bg-background/50 rounded-xl p-6 hover:bg-background/60 transition-all duration-300"
                  >
                    <button
                      className="w-full"
                      onClick={() => togglePodcast(podcastTitle)}
                    >
                      <div className="flex gap-6 items-start">
                        {thumbnailUrl && (
                          <div className="flex-shrink-0 w-48">
                            <img
                              src={thumbnailUrl}
                              alt={podcastTitle}
                              className="w-48 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                console.log('Image error, trying fallback');
                                const img = e.target as HTMLImageElement;
                                if (img.src.includes('maxresdefault')) {
                                  img.src = img.src.replace('maxresdefault', 'hqdefault');
                                }
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-white text-left">
                            {podcastTitle}
                          </h3>
                          <div className={`transform transition-transform duration-300 ${
                            expandedPodcasts.has(podcastTitle) ? 'rotate-180' : ''
                          }`}>
                            ▼
                          </div>
                        </div>
                      </div>
                    </button>

                    {expandedPodcasts.has(podcastTitle) && (
                      <div className="mt-6 space-y-6">
                        {podcastIdeas.map((idea) => (
                          <div
                            key={idea.id}
                            className="pl-4 border-l-2 border-ctaGreen/30"
                          >
                            <p className="text-gray-200">{idea.user_interpretation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}