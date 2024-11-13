'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ThemeResponse {
  themeTitle: string;
  userExplanation: string;
}

interface ResponseData {
  themes: ThemeResponse[];
  whyListen: string;
}

interface ProfileData {
  name: string;
  twin_name: string;
  avatar_url: string;
}

// Custom hook for handling search params
function useResponseParams(): ResponseData | null {
  const [data, setData] = useState<ResponseData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const responsesParam = searchParams.get('responses');
      if (responsesParam) {
        try {
          const decodedResponses = decodeURIComponent(responsesParam);
          const parsedData: ResponseData = JSON.parse(decodedResponses);
          setData(parsedData);
        } catch (err) {
          console.error('Error parsing responses:', err);
        }
      }
    }
  }, []);

  return data;
}

export default function SummaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const responseData = useResponseParams();
  const [themeResponses, setThemeResponses] = useState<ThemeResponse[]>([]);
  const [whyListen, setWhyListen] = useState<string>('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (responseData) {
      setThemeResponses(responseData.themes);
      setWhyListen(responseData.whyListen);
    }
  }, [responseData]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabaseAuth
          .from('profiles')
          .select('name, twin_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!user) {
        setError('User not authenticated.');
        console.error('User is not authenticated.');
        setIsSubmitting(false);
        return;
      }

      const externalPodcastId = localStorage.getItem('podcast_id');
      if (!externalPodcastId) {
        setError('Podcast ID not found.');
        console.error('Podcast ID not found in local storage.');
        setIsSubmitting(false);
        return;
      }

      const [podcastResponse, profileResponse] = await Promise.all([
        supabaseAuth
          .from('overview_embed')
          .select('id, podcast_title, podcast_link')
          .eq('podcast_id', externalPodcastId)
          .single(),
        
        supabaseAuth
          .from('profiles')
          .select('twin_name, avatar_url')
          .eq('id', user.id)
          .single()
      ]);

      if (podcastResponse.error || !podcastResponse.data) {
        setError('Podcast data not found.');
        console.error('Podcast fetch error:', podcastResponse.error);
        setIsSubmitting(false);
        return;
      }

      if (profileResponse.error || !profileResponse.data) {
        setError('Profile data not found.');
        console.error('Profile fetch error:', profileResponse.error);
        setIsSubmitting(false);
        return;
      }

      const { id: internalPodcastId, podcast_title, podcast_link } = podcastResponse.data;
      const profileData = profileResponse.data as ProfileData;

      const ideasToInsert = themeResponses.map(response => ({
        user_id: user.id,
        podcast_id: internalPodcastId,
        podcast_title: podcast_title,
        theme_id: null,
        user_interpretation: response.userExplanation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const feedData = {
        user_id: user.id,
        podcast_id: internalPodcastId,
        podcast_title: podcast_title,
        podcast_link: podcast_link,
        twin_name: profileData.twin_name,
        avatar_url: profileData.avatar_url,
        why_listen: whyListen,
      };

      const { error: ideasError } = await supabaseAuth
        .from('user_ideas')
        .insert(ideasToInsert);

      if (ideasError) {
        throw new Error(`Failed to insert ideas: ${ideasError.message}`);
      }

      const { error: feedError } = await supabaseAuth
        .from('feed')
        .upsert(feedData, {
          onConflict: 'user_id,podcast_id',
          ignoreDuplicates: false
        });

      if (feedError) {
        console.error('Error inserting feed:', feedError);
      }

      console.log('Data saved successfully');
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/profile');
      }, 2000);

    } catch (err: any) {
      console.error('Error processing summary:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!responseData) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-white font-sans">
        <Header showFullNav={false} />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-white font-sans">
      <Header showFullNav={false} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Profile Section */}
          {profile && (
            <div className="flex items-center space-x-4 mb-12">
              <Avatar className="w-12 h-12 border border-ctaGreen/20">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.twin_name} />
                <AvatarFallback>{profile.twin_name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-400">Your Digital Twin</p>
                <p className="text-lg font-semibold text-ctaGreen">{profile.twin_name}</p>
              </div>
            </div>
          )}

          <h1 className="text-4xl font-bold mb-8">Theme Summary</h1>

          {error && (
            <p className="text-red-500 mb-4 text-center">{error}</p>
          )}

          {success ? (
            <div className="space-y-6">
              <p className="text-center text-green-500">Your ideas have been successfully saved!</p>
              
              <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors mb-8">
                <h2 className="text-lg font-medium text-ctaGreen mb-4">
                  Why Others Should Listen
                </h2>
                <p className="text-gray-300">{whyListen}</p>
              </div>

              <div className="space-y-6">
                {themeResponses.map((response, index) => (
                  <div 
                    key={index} 
                    className="bg-[#161B22] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                  >
                    <h2 className="text-lg font-medium text-gray-200 mb-4">
                      {response.themeTitle}
                    </h2>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Your Understanding:</p>
                      <p className="text-gray-300">{response.userExplanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => router.push('/profile')}
                  className="bg-ctaGreen text-white py-3 px-6 rounded-lg hover:bg-ctaGreenDark transition-colors duration-200"
                >
                  View Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xl text-gray-300 text-center mb-8">
                Ready to share your ideas with other weird humans? 
              </p>

              <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors mb-8">
                <h2 className="text-lg font-medium text-ctaGreen mb-4">
                  Why Others Should Listen
                </h2>
                <p className="text-gray-300">{whyListen}</p>
              </div>

              {themeResponses.map((response, index) => (
                <div 
                  key={index} 
                  className="bg-[#161B22] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  <h2 className="text-lg font-medium text-gray-200 mb-4">
                    {response.themeTitle}
                  </h2>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Your Understanding:</p>
                    <p className="text-gray-300">{response.userExplanation}</p>
                  </div>
                </div>
              ))}

              {error && (
                <div className="mt-4 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleSubmit}
                  className="bg-ctaGreen text-white py-3 px-6 rounded-lg hover:bg-ctaGreenDark transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ideas'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}