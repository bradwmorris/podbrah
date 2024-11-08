// app/simulate/overview/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from '@/components/header';
import { X } from 'lucide-react';
import { supabaseAuth } from '@/lib/supabaseAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Chat from './chat';

interface Theme {
  theme_title: string;
  theme_gist: string;
  chapter_number: number;
}

interface PodcastOverview {
  featuring: string;
  podcast_id: number;
  podcast_title: string;
  number_of_themes: number;
  podcast_overview: string;
  themes: Theme[];
}

function OverviewContent() {
  const [podcastOverview, setPodcastOverview] = useState<PodcastOverview | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const podcastId = localStorage.getItem('podcast_id');
        if (!podcastId) {
          setError('Podcast ID is missing.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabaseAuth
          .from('overview_embed')
          .select('metadata')
          .eq('metadata->>podcast_id', podcastId)
          .single();

        if (error || !data) {
          setError('Failed to fetch overview data.');
          setLoading(false);
          return;
        }

        setPodcastOverview(data.metadata as PodcastOverview);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleCardClick = (theme: Theme) => {
    setSelectedTheme(theme);
  };

  const handleCheckboxChange = (themeNumber: number) => {
    setSelectedThemes(prev => 
      prev.includes(themeNumber) 
        ? prev.filter(num => num !== themeNumber)
        : [...prev, themeNumber]
    );
  };

  const getSelectedThemeObjects = (): Theme[] => {
    if (!podcastOverview) return [];
    return podcastOverview.themes.filter(theme => 
      selectedThemes.includes(theme.chapter_number)
    );
  };

  const handleStartChat = () => {
    if (selectedThemes.length === 0) {
      setError('Please select at least one theme to explore.');
      return;
    }
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0E1116] text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading overview...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0E1116] text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  if (!podcastOverview) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0E1116] text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex items-center justify-center">
          <p>No overview available.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0E1116] text-white font-sans">
      <Header showFullNav={false} />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {!showCards && !showChat ? (
          <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">{podcastOverview.podcast_title}</h1>
            <p className="text-gray-300 text-lg mb-12 leading-relaxed">
              {podcastOverview.podcast_overview}
            </p>
            <Button
              onClick={() => setShowCards(true)}
              className="bg-[#21C55D] text-white py-3 px-6 rounded-lg hover:bg-[#1CA54C] transition-colors duration-200 text-lg"
            >
              Explore Themes
            </Button>
          </div>
        ) : showChat ? (
          <Chat 
            podcastId={podcastOverview.podcast_id} 
            podcastTitle={podcastOverview.podcast_title}
            selectedThemes={getSelectedThemeObjects()}
          />
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <p className="text-[#21C55D] text-xl mb-8 text-center">
              We've extracted {podcastOverview.number_of_themes} themes from this conversation. 'view details' for more information, ☑ to select themes you'd like to explore further. 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {podcastOverview.themes.map((theme) => (
                <motion.div
                  key={theme.chapter_number}
                  className={`bg-[#161B22] rounded-lg shadow-md p-6 cursor-pointer ${
                    selectedThemes.includes(theme.chapter_number) ? 'ring-2 ring-[#21C55D]' : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Checkbox
                      id={`checkbox-${theme.chapter_number}`}
                      checked={selectedThemes.includes(theme.chapter_number)}
                      onCheckedChange={() => handleCheckboxChange(theme.chapter_number)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      className="mr-2"
                    />
                    <button
                      onClick={() => handleCardClick(theme)}
                      className="text-[#21C55D] hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{theme.theme_title}</h2>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={handleStartChat}
                className="bg-[#21C55D] text-white py-2 px-4 rounded-lg hover:bg-[#1CA54C] transition-colors duration-200"
                disabled={selectedThemes.length === 0}
              >
                Start Theme Exploration ({selectedThemes.length} selected)
              </Button>
            </div>

            <AnimatePresence>
              {selectedTheme && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedTheme(null)}
                >
                  <motion.div
                    initial={{ scale: 0.8, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, rotateY: 180 }}
                    className="bg-[#161B22] rounded-lg shadow-lg p-8 max-w-2xl w-full"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-white">{selectedTheme.theme_title}</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTheme(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                    <p className="text-gray-300">{selectedTheme.theme_gist}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <OverviewContent />
    </ProtectedRoute>
  );
}