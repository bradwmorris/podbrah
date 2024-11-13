'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight } from 'lucide-react';

interface Profile {
  name: string;
  twin_name: string;
  avatar_url: string | null;
}

interface Podcast {
  id: string;
  title: string;
  thumbnail: string;
  overview: string;
  featuring?: string;
  number_of_themes?: number;
}

export default function SimulationPage() {
  const [error, setError] = useState('');
  const [themeLoading, setThemeLoading] = useState(true);
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [typedText, setTypedText] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabaseAuth
        .from('profiles')
        .select('name, twin_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
        return;
      }

      setProfile(data);
    };

    loadProfile();
  }, [user]);

  const fetchPodcastData = async (podcastId: string) => {
    setThemeLoading(true);
    try {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabaseAuth
        .from('overview_embed')
        .select('metadata')
        .eq('metadata->>podcast_id', podcastId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data && data.metadata) {
        const { featuring, number_of_themes, podcast_overview } = data.metadata;
        const podcast = {
          id: podcastId,
          title: data.metadata.podcast_title,
          thumbnail: data.metadata.thumbnail_url,
          overview: podcast_overview,
          featuring,
          number_of_themes,
        };
        setCurrentPodcast(podcast);
      } else {
        setError('No metadata found for this podcast.');
      }
    } catch (error) {
      console.error('Error fetching podcast data:', error);
      setError('Failed to load podcast data. Please try again.');
    } finally {
      setThemeLoading(false);
    }
  };

  useEffect(() => {
    const storedPodcastId = localStorage.getItem('podcast_id');
    if (storedPodcastId) {
      setPodcastId(storedPodcastId);
      fetchPodcastData(storedPodcastId);
    } else {
      setError('No podcast selected. Please go back and select a podcast.');
    }
  }, []);

  useEffect(() => {
    if (currentPodcast && profile) {
      const heading = `Hey ${profile.name}! 👋`;
      let i = 1;
      setTypedText(heading[0]);
      const typingInterval = setInterval(() => {
        if (i < heading.length) {
          setTypedText(prev => heading.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [currentPodcast, profile]);

  if (!currentPodcast || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <p className="text-center">{error || 'Loading...'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-white font-sans">
      <Header showFullNav={false} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Guide Section */}
          <div className="flex items-start space-x-6 mb-12">
            <div className="flex-shrink-0">
              <Avatar className="w-20 h-20 border-2 border-ctaGreen">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.twin_name} />
                <AvatarFallback>{profile.twin_name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            
            {/* Speech Bubble */}
            <div className="relative flex-grow bg-[#1E1E1E] rounded-2xl p-6 shadow-lg">
              {/* Speech Bubble Pointer */}
              <div className="absolute left-0 top-6 -translate-x-2">
                <div className="w-4 h-4 bg-[#1E1E1E] transform rotate-45" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  {typedText}
                </h1>
                <p className="text-lg leading-relaxed text-gray-200">
                  It's <span className="text-ctaGreen font-semibold">{profile.twin_name}</span>, your digital twin and guide 
                  for this podcast exploration. I'm here to help you squeeze the most goodness from this conversation. We'll start by unpacking all the big themes and ideas, and trying to understand their relevance to your own (insignificant) life. I'll then get to work connecting your ideas with other ideas, and other weird humans.
                </p>
                <p className="text-lg leading-relaxed text-gray-300">
                  Ready to roll?
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => router.push('/simulate/overview')}
              className="bg-ctaGreen hover:bg-ctaGreen/90 text-white px-8 py-6 text-lg rounded-xl 
                         flex items-center space-x-2 transition-all duration-200 transform hover:translate-x-1"
            >
              <span>Let's go</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {error && <p className="text-sm font-medium text-red-500 mt-4">{error}</p>}
        </div>
      </main>
    </div>
  );
}