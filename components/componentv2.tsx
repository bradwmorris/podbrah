// components/componentv2.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/header';
import { Play } from 'lucide-react';

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
    // Find the selected podcast
    const selectedPodcast = podcasts.find(p => p.id === podcastId);
    if (selectedPodcast) {
      // Store both podcast ID and thumbnail
      localStorage.setItem('podcast_id', podcastId);
      localStorage.setItem('podcast_thumbnail', selectedPodcast.thumbnail);
      localStorage.setItem('podcast_title', selectedPodcast.title);
      console.log('Stored podcast data:', {
        id: podcastId,
        thumbnail: selectedPodcast.thumbnail,
        title: selectedPodcast.title
      });
    }
    router.push('/simulate');
  };

  const handleStartClick = () => {
    router.push('/auth/login');
  };

  const podcasts: Podcast[] = [
    {
      id: '20241029083036',
      title: "Joscha Bach - Why Your Thoughts Aren't Yours",
      thumbnail: 'https://img.youtube.com/vi/3MkJEGE9GRY/maxresdefault.jpg',
    },
    {
      id: '20241031095658',
      title: 'Marc Andreessen - AI is Bigger Than the Internet. How AI Will Change EVERYTHING',
      thumbnail: 'https://img.youtube.com/vi/6twxFu3bL0w/maxresdefault.jpg',
    },
    {
      id: '20241110094358',
      title: 'The Elegant Math Behind Machine Learning',
      thumbnail: 'https://img.youtube.com/vi/URtF_UHYBSo/maxresdefault.jpg',
    },
    {
      id: '20241110102028',
      title: 'Elon Musk on Joe Rogan November 24',
      thumbnail: 'https://img.youtube.com/vi/7qZl_5xHoBw/maxresdefault.jpg',
    },
    {
      id: '20241110110501',
      title: 'Pattern Recognition vs True Intelligence with Francois Chollet',
      thumbnail: 'https://img.youtube.com/vi/JTU8Ha4Jyfc/maxresdefault.jpg',
    },
    {
      id: '20241111074933',
      title: 'The Investing and Crypto Expert Raoul Pal',
      thumbnail: 'https://img.youtube.com/vi/XyhhwVJB9Z4/maxresdefault.jpg',
    },
    {
      id: '20241111100657',
      title: 'Esther Perel： How to Find, Build & Maintain Healthy Romantic Relationships',
      thumbnail: 'https://img.youtube.com/vi/ajneRM-ET1Q/maxresdefault.jpg',
    },
    {
      id: '20241113130212',
      title: 'YUDKOWSKY + WOLFRAM ON AI RISK',
      thumbnail: 'https://img.youtube.com/vi/xjH2B_sE_RQ/maxresdefault.jpg',
    },
    {
      id: '20241115090315',
      title: 'Graham Hancock: Lost Civilization of the Ice Age & Ancient Human History',
      thumbnail: 'https://img.youtube.com/vi/NMHiLvirCb0/maxresdefault.jpg',
    },
        {
      id: '20241115164319',
      title: 'How Barbara Corcoran Turned $1,000 into a $5B+ Empire',
      thumbnail: 'https://img.youtube.com/vi/qh5EL9akLX4/maxresdefault.jpg',
    },
  ];

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'https://img.youtube.com/vi/ccOFLML25K8/hqdefault.jpg';
    console.warn('Image failed to load, using fallback thumbnail.');
  };

  if (isLoading) {
    return (
      <div className="bg-background text-white min-h-screen font-sans flex flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-white min-h-screen font-sans flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        {/* Main Banner */}
        <div className="h-screen flex flex-col items-center justify-center space-y-8 text-center px-4 md:px-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Nerd out on your favourite podcasts, with your favourite humans
            </h1>
            <p className="text-xl text-gray-400">
              with a little help from your personally designed AI-powered podcast twin
            </p>
            <Button
              onClick={handleStartClick}
              className="bg-ctaGreen hover:bg-ctaGreen/90 text-white py-4 px-6 rounded-xl transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-ctaGreen/20"
            >
              Create your AI-Powered Podcast Twin
            </Button>
          </div>
        </div>

        {/* Trending Podcasts */}
        <div ref={podcastsRef} className="px-4 md:px-6 py-12 flex flex-col items-center bg-background">
          <h2 className="text-ctaGreen text-2xl uppercase tracking-wider mb-8">
            Trending Podcasts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="rounded-xl overflow-hidden bg-background border border-gray-800 hover:border-ctaGreen/30 transition-all duration-300 group"
              >
                <div className="relative">
                  <img
                    src={podcast.thumbnail}
                    alt={`Podcast ${podcast.id}: ${podcast.title}`}
                    onError={handleImageError}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handlePodcastClick(podcast.id)}
                    className="absolute bottom-4 right-4 bg-ctaGreen hover:bg-ctaGreen/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                  >
                    <Play size={16} />
                    Simulate
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white group-hover:text-ctaGreen transition-colors duration-200">
                    {podcast.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}