// simulate/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { useAuth } from '@/components/auth/AuthProvider';

interface Podcast {
  id: string;
  title: string;
  thumbnail: string;
  overview: string;
  featuring?: string;
  number_of_themes?: number;
}

export default function SimulationPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [themeLoading, setThemeLoading] = useState(true);
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [typedText, setTypedText] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const fetchPodcastData = async (podcastId: string) => {
    console.log('Fetching podcast data for ID:', podcastId);
    setThemeLoading(true);
    try {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const numericalPodcastId = Number(podcastId);
      console.log('Numerical Podcast ID:', numericalPodcastId);

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
        console.log('Fetched metadata:', data.metadata);
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
        console.log('Current Podcast set:', podcast);
      } else {
        console.warn('No metadata found for this podcast.');
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
    console.log('Stored podcast ID:', storedPodcastId);
    if (storedPodcastId) {
      setPodcastId(storedPodcastId);
      fetchPodcastData(storedPodcastId);
    } else {
      console.error('No podcast ID found in localStorage');
      setError('No podcast selected. Please go back and select a podcast.');
    }
  }, []);

  useEffect(() => {
    if (currentPodcast) {
      const heading = "What's your name?";
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
  }, [currentPodcast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Preparing to proceed...');
    setError('');

    try {
      localStorage.setItem('userName', name);
      router.push('/simulate/overview');
    } catch (error: any) {
      console.error('Simulation error:', error);
      setError(`Failed to process: ${error.message}`);
      setMessage('');
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'https://img.youtube.com/vi/ccOFLML25K8/hqdefault.jpg';
    console.warn('Image failed to load, using fallback thumbnail.');
  };

  if (!currentPodcast) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <p className="text-center">{error || 'Loading podcast information...'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-white font-sans">
      <Header showFullNav={false} />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-center mb-8">
            {typedText}
          </h1>

          <div className="flex items-center bg-border rounded-lg overflow-hidden">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-grow bg-transparent border-none text-white placeholder-gray-400 px-6 py-3 focus:outline-none"
            />
            <Button
              onClick={handleSubmit}
              disabled={!name}
              className="bg-ctaGreen text-white px-6 py-3 rounded-lg hover:bg-ctaGreenDark transition-colors duration-200"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {message && <p className="text-sm font-medium text-ctaGreen mt-4 text-center">{message}</p>}
          {error && <p className="text-sm font-medium text-red-500 mt-4 text-center">{error}</p>}
        </div>
      </main>
    </div>
  );
}
