'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from '@/components/header';
import { X, ArrowRight } from 'lucide-react';
import { supabaseAuth } from '@/lib/supabaseAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/components/auth/AuthProvider';
import Chat from './chat';

interface BigIdea {
  title: string;
  quote: string;
}

interface Theme {
  chapter_number: number;
  theme_title: string;
  theme_gist: string;
  metadata?: {
    theme_gist?: string;
    simple_breakdown?: string;
  };
  big_ideas?: BigIdea[];
  simple_breakdown?: string;
}

interface PodcastOverview {
  metadata: {
    featuring: string;
    podcast_id: number;
    podcast_title: string;
    number_of_themes: number;
    podcast_overview: string;
    thumbnail_url: string;
    themes: Theme[];
  }
}

interface Profile {
  name: string;
  twin_name: string;
  avatar_url: string | null;
}

function OverviewContent() {
  const [podcastOverview, setPodcastOverview] = useState<PodcastOverview | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [podcastTitle, setPodcastTitle] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const storedThumbnail = localStorage.getItem('podcast_thumbnail');
    const storedTitle = localStorage.getItem('podcast_title');
    if (storedThumbnail) setThumbnailUrl(storedThumbnail);
    if (storedTitle) setPodcastTitle(storedTitle);
  }, []);

  useEffect(() => {
    const loadProfileAndOverview = async () => {
      try {
        const podcastId = localStorage.getItem('podcast_id');
        if (!user || !podcastId) {
          setError('Missing required information.');
          setLoading(false);
          return;
        }

        const [profileResponse, overviewResponse] = await Promise.all([
          supabaseAuth
            .from('profiles')
            .select('name, twin_name, avatar_url')
            .eq('id', user.id)
            .single(),
          
          supabaseAuth
            .from('overview_embed')
            .select('metadata')
            .eq('metadata->>podcast_id', podcastId)
            .single()
        ]);

        if (profileResponse.error) throw profileResponse.error;
        if (overviewResponse.error) throw overviewResponse.error;

        const transformedData = {
          ...overviewResponse.data,
          metadata: {
            ...overviewResponse.data.metadata,
            themes: overviewResponse.data.metadata.themes.map((theme: any) => ({
              ...theme,
              big_ideas: Array.isArray(theme.big_ideas) ? theme.big_ideas.map((idea: string) => {
                const parts = idea.split('"');
                return {
                  title: parts[0].trim().replace('• ', ''),
                  quote: parts[1] || ''
                };
              }) : []
            }))
          }
        };

        setProfile(profileResponse.data);
        setPodcastOverview(transformedData as PodcastOverview);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndOverview();
  }, [user]);

  useEffect(() => {
    if (podcastOverview && !showChat && !showCards) {
      const heading = "wtf was this podcast all about?";
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
  }, [podcastOverview, showChat, showCards]);

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
    return podcastOverview.metadata.themes.filter(theme => 
      selectedThemes.includes(theme.chapter_number)
    );
  };

  const handleStartChat = () => {
    if (selectedThemes.length === 0) {
      setError('Please select at least one theme to explore.');
      return;
    }
    const selectedThemeObjects = getSelectedThemeObjects();
    localStorage.setItem('selectedThemes', JSON.stringify(selectedThemeObjects));
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading overview...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  if (!podcastOverview || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex items-center justify-center">
          <p>No overview available.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-white font-sans">
      <Header showFullNav={false} />
      {!showCards && !showChat ? (
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <Avatar className="w-20 h-20 border-2 border-ctaGreen">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.twin_name} />
                  <AvatarFallback>{profile.twin_name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="relative flex-grow bg-[#1E1E1E] rounded-2xl p-8 shadow-lg">
                <div className="absolute left-0 top-8 -translate-x-2">
                  <div className="w-4 h-4 bg-[#1E1E1E] transform rotate-45" />
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    {typedText}
                  </h1>
                  {thumbnailUrl && (
                    <div className="w-full rounded-lg overflow-hidden">
                      <img 
                        src={thumbnailUrl}
                        alt={podcastTitle || "Podcast thumbnail"}
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
                  <h2 className="text-2xl font-semibold text-ctaGreen">
                    {podcastTitle || podcastOverview.metadata.podcast_title}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-200">
                    {podcastOverview.metadata.podcast_overview}
                  </p>
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setShowCards(true)}
                      className="bg-ctaGreen hover:bg-ctaGreen/90 text-white px-8 py-6 text-lg rounded-xl 
                                flex items-center space-x-2 transition-all duration-200 transform hover:translate-x-1"
                    >
                      <span>Explore Themes</span>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : showChat ? (
        <Chat 
          podcastId={podcastOverview.metadata.podcast_id} 
          podcastTitle={podcastTitle || podcastOverview.metadata.podcast_title}
          selectedThemes={getSelectedThemeObjects()}
        />
      ) : (
        <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-start space-x-6 mb-12">
              <div className="flex-shrink-0">
                <Avatar className="w-20 h-20 border-2 border-ctaGreen">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.twin_name} />
                  <AvatarFallback>{profile.twin_name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="relative flex-grow bg-[#1E1E1E] rounded-2xl p-6 shadow-lg">
                <div className="absolute left-0 top-8 -translate-x-2">
                  <div className="w-4 h-4 bg-[#1E1E1E] transform rotate-45" />
                </div>
                
                <div className="space-y-4">
                  <p className="text-xl text-gray-200">
                    I've extracted <span className="text-ctaGreen font-semibold">{podcastOverview.metadata.number_of_themes}</span> key themes from this conversation. 
                    Click 'view details' to learn more about each theme, and use the checkboxes to select the ones you'd like to explore further together.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcastOverview.metadata.themes.map((theme) => (
                <motion.div
                  key={theme.chapter_number}
                  className={`relative bg-[#161B22] border border-gray-800 rounded-lg p-6 ${
                    selectedThemes.includes(theme.chapter_number) 
                      ? 'ring-1 ring-ctaGreen'
                      : 'hover:border-gray-700'
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
                      className="border-gray-700"
                    />
                    <button
                      onClick={() => handleCardClick(theme)}
                      className="text-ctaGreen text-sm hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                  <h2 className="text-lg font-medium text-gray-200">{theme.theme_title}</h2>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={handleStartChat}
                className="bg-ctaGreen hover:bg-ctaGreen/90 text-white px-8 py-6 text-lg rounded-xl 
                          flex items-center space-x-2 transition-all duration-200 transform hover:translate-x-1"
                disabled={selectedThemes.length === 0}
              >
                <span>Start Theme Exploration ({selectedThemes.length} selected)</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <AnimatePresence>
              {selectedTheme && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedTheme(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-[#161B22] border border-gray-800 rounded-lg p-8 max-w-2xl w-full shadow-xl"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-gray-200">{selectedTheme.theme_title}</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTheme(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                      </div>
                    <p className="text-gray-300 leading-relaxed">{selectedTheme.theme_gist}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      )}
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