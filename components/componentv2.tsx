// components/componentv2.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/header';

interface Podcast {
  id: string;
  title: string;
  thumbnail: string;
}

export function Componentv2() {
  const router = useRouter();
  const podcastsRef = useRef<HTMLDivElement>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('Componentv2 mount state:', { 
      isLoading, 
      hasUser: !!user,
      userId: user?.id 
    });
  }, [isLoading, user]);

  const handlePodcastClick = (podcastId: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    console.log(`Clicked Podcast ID: ${podcastId}`);
    localStorage.setItem('podcast_id', podcastId);
    const storedId = localStorage.getItem('podcast_id');
    console.log(`Stored podcast_id in localStorage: ${storedId}`);
    router.push('/simulate');
  };

  const scrollToPodcasts = () => {
    podcastsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const podcasts: Podcast[] = [
    {
      id: '1',
      title: 'Podcast 1: Your First Podcast Title',
      thumbnail: 'https://img.youtube.com/vi/oFfVt3S51T4/maxresdefault.jpg',
    },
    {
      id: '2',
      title: 'Podcast 2: Your Second Podcast Title',
      thumbnail: 'https://img.youtube.com/vi/I0PLTzeEbtg/maxresdefault.jpg',
    },
    {
      id: '20241014113223',
      title: 'Podcast 3: Nate Silver - Predicting Elections in Turbulent Times',
      thumbnail: 'https://img.youtube.com/vi/_6_ZoXadBMk/maxresdefault.jpg',
    },
    {
      id: '20241014171247',
      title: 'Podcast 4: Your New Podcast Title',
      thumbnail: 'https://img.youtube.com/vi/ccOFLML25K8/hqdefault.jpg',
    },
    {
      id: '20241015081353',
      title: "DeepMind's AI Breakthroughs - From AlphaFold to Scientific Discovery",
      thumbnail: 'https://img.youtube.com/vi/BfDACxrdAvQ/maxresdefault.jpg',
    },
    {
      id: '20241016191212',
      title: "HeyGen CEO on TikTok's GenAI Dilemma, Navigating Voice-Cloning and the Path to Interactive Avatars",
      thumbnail: 'https://img.youtube.com/vi/FudGqDZDSx4/maxresdefault.jpg',
    },
    {
      id: '20241029083036',
      title: "Joscha Bach - Why Your Thoughts Aren't Yours",
      thumbnail: 'https://img.youtube.com/vi/3MkJEGE9GRY/maxresdefault.jpg',
    },
    {
      id: '20241031095658',
      title: 'Marc Andreessen - AI is Bigger Than the Internet. How AI Will Change EVERYTHING',
      thumbnail: 'https://img.youtube.com/vi/3MkJEGE9GRY/maxresdefault.jpg',
    },
  ];

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'https://img.youtube.com/vi/ccOFLML25K8/hqdefault.jpg';
    console.warn('Image failed to load, using fallback thumbnail.');
  };

  if (isLoading) {
    return (
      <div className="bg-[#0E1116] text-white min-h-screen font-sans flex flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0E1116] text-white min-h-screen font-sans flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="h-screen flex flex-col items-center justify-center space-y-12 text-center px-4 md:px-6">
          <div className="space-y-8">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-white max-w-4xl mx-auto">
              Get more from your favourite podcasts.
            </h1>
            <div className="bg-[#161B22] inline-block rounded-full px-4 py-2">
              <h2 className="text-[#21C55D] text-xl uppercase tracking-wider">Discover</h2>
            </div>
            <Button
              variant="default"
              className="bg-[#21C55D] hover:bg-[#1CA54C] text-white text-lg py-3 px-8 rounded-lg transition-all duration-300"
              onClick={scrollToPodcasts}
            >
              Trending Podcasts
            </Button>
          </div>
        </div>

        <div ref={podcastsRef} className="px-4 md:px-6 py-12 flex flex-col items-center bg-[#0E1116]">
          <div className="bg-[#161B22] inline-block rounded-full px-4 py-2 mb-8">
            <h2 className="text-[#21C55D] text-2xl uppercase tracking-wider">Trending Podcasts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {podcasts.map((podcast) => (
              <button
                key={podcast.id}
                onClick={() => handlePodcastClick(podcast.id)}
                className="text-left rounded-lg overflow-hidden shadow-lg bg-[#161B22] hover:shadow-[0_0_20px_rgba(33,197,93,0.3)] transition-all duration-300 group focus:outline-none"
              >
                <div className="relative">
                  <img
                    src={podcast.thumbnail}
                    alt={`Podcast ${podcast.id}: ${podcast.title}`}
                    onError={handleImageError}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#21C55D]">{podcast.title}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}