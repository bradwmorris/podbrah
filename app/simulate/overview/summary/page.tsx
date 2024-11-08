// app/simulate/overview/summary/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import supabaseAuth from '@/lib/supabaseAuth'; // Correct import
import { useAuth } from '@/components/auth/AuthProvider';

interface ThemeResponse {
  themeTitle: string;
  userExplanation: string;
}

export default function SummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [themeResponses, setThemeResponses] = useState<ThemeResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Parse responses on component mount
  useEffect(() => {
    try {
      const responsesParam = searchParams.get('responses');
      if (!responsesParam) {
        setError('No responses found.');
        console.error('No responses parameter found in URL.');
        return;
      }

      const decodedResponses = decodeURIComponent(responsesParam);
      const parsedResponses: ThemeResponse[] = JSON.parse(decodedResponses);
      setThemeResponses(parsedResponses);
      console.log('Parsed Responses:', parsedResponses);
    } catch (err: any) {
      console.error('Error parsing summary:', err);
      setError('Failed to parse responses.');
    }
  }, [searchParams]);

  // Handle submission of ideas
  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Ensure user is authenticated
      if (!user) {
        setError('User not authenticated.');
        console.error('User is not authenticated.');
        setIsSubmitting(false);
        return;
      }

      // Retrieve external podcast_id from local storage
      const externalPodcastId = localStorage.getItem('podcast_id');
      if (!externalPodcastId) {
        setError('Podcast ID not found.');
        console.error('Podcast ID not found in local storage.');
        setIsSubmitting(false);
        return;
      }

      // Fetch the internal id from overview_embed using externalPodcastId
      const { data: overviewData, error: overviewError } = await supabaseAuth
        .from('overview_embed')
        .select('id')
        .eq('podcast_id', externalPodcastId)
        .single();

      if (overviewError || !overviewData) {
        setError('Podcast does not exist.');
        console.error('Podcast does not exist:', externalPodcastId);
        setIsSubmitting(false);
        return;
      }

      const internalPodcastId = overviewData.id;

      // Prepare data for insertion
      const ideasToInsert = themeResponses.map(response => ({
        user_id: user.id,
        podcast_id: internalPodcastId, // Use the internal id from overview_embed
        theme_id: null, // Assign if you have theme IDs, otherwise set to null
        user_interpretation: response.userExplanation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      console.log('Ideas to Insert:', ideasToInsert);

      // Insert into 'user_ideas' table
      const { data, error } = await supabaseAuth.from('user_ideas').insert(ideasToInsert);

      if (error) {
        console.error('Error inserting ideas:', error);
        setError(error.message || 'Failed to save ideas. Please try again.');
      } else {
        console.log('Ideas saved successfully:', data);
        setSuccess(true);
        // Redirect to profile after a short delay
        setTimeout(() => {
          router.push('/profile');
        }, 2000); // 2 seconds delay to show success message
      }
    } catch (err: any) {
      console.error('Error processing summary:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-white font-sans">
      <Header showFullNav={false} />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Theme Summary</h1>

          {/* Display error message if any */}
          {error && (
            <p className="text-red-500 mb-4 text-center">{error}</p>
          )}

          {/* Display success message and redirect */}
          {success ? (
            <div className="space-y-6">
              <p className="text-center text-green-500">Your ideas have been successfully saved!</p>
              <div className="space-y-6">
                {themeResponses.map((response, index) => (
                  <div 
                    key={index} 
                    className="bg-border rounded-lg p-6 shadow-lg"
                  >
                    <h2 className="text-xl font-semibold text-ctaGreen mb-4">
                      {response.themeTitle}
                    </h2>
                    <div className="text-gray-300">
                      <p className="mb-2 text-sm text-gray-400">Your Understanding:</p>
                      <p className="text-white">{response.userExplanation}</p>
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
            /* Display theme summaries and submit button */
            <div className="space-y-6">
              {themeResponses.map((response, index) => (
                <div 
                  key={index} 
                  className="bg-border rounded-lg p-6 shadow-lg"
                >
                  <h2 className="text-xl font-semibold text-ctaGreen mb-4">
                    {response.themeTitle}
                  </h2>
                  <div className="text-gray-300">
                    <p className="mb-2 text-sm text-gray-400">Your Understanding:</p>
                    <p className="text-white">{response.userExplanation}</p>
                  </div>
                </div>
              ))}

              {/* Display error below summaries if any */}
              {error && (
                <div className="mt-4 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              {/* Submit Ideas Button */}
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
