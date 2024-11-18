'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from 'lucide-react';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { useAuth } from '@/components/auth/AuthProvider';

interface ThemeResponse {
  themeTitle: string;
  userExplanation: string;
}

interface Profile {
  twin_name: string;
  avatar_url: string | null;
}

function useExplanationParams(): ThemeResponse[] {
  const [explanations, setExplanations] = useState<ThemeResponse[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const explanationsParam = searchParams.get('explanations');
      if (explanationsParam) {
        try {
          const decodedExplanations = decodeURIComponent(explanationsParam);
          const parsedData: ThemeResponse[] = JSON.parse(decodedExplanations);
          setExplanations(parsedData);
        } catch (err) {
          console.error('Error parsing explanations:', err);
        }
      }
    }
  }, []);

  return explanations;
}

const DiscussionView = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const explanations = useExplanationParams();

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabaseAuth
        .from('profiles')
        .select('twin_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (explanations.length > 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: "Let's have a chat and get to the core of what made the conversation and ideas so interesting. When you feel we've explored enough, click 'Proceed to Summary' and I'll synthesize the key insights from our discussion."
        },
        {
          role: 'assistant',
          content: "How would you explain the 'gist', or the 'essence' of this conversation to a dumb friend, who had no idea what the podcast was talking about? Think of a friend you believe would benefit from listening to this podcast, and convince them to listen."
        }
      ]);
    }
  }, [explanations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const podcastId = localStorage.getItem('podcast_id');
      if (!podcastId) throw new Error('Podcast ID not found');

      const response = await fetch('/api/overviewchat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId,
          podcastId,
          name: profile?.twin_name || 'User',
          themeContext: {
            stage: 'discussion',
            currentTheme: {
              userExplanation: explanations.map(exp => exp.userExplanation).join('\n\n')
            },
            progress: {
              currentTheme: 1,
              totalThemes: explanations.length,
              stage: 'discussion'
            }
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.output 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleProceedToSummary = async () => {
    setIsSynthesizing(true);
    try {
      const podcastId = localStorage.getItem('podcast_id');
      if (!podcastId) throw new Error('Podcast ID not found');

      const conversationSummary = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n');

      const response = await fetch('/api/overviewchat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Based on this user's discussion: ${conversationSummary}\n\nCreate a compelling, punchy synthesis of why others should listen to this podcast. Focus on the unique insights and value discovered through our discussion.`,
          sessionId,
          podcastId,
          name: profile?.twin_name || 'User',
          themeContext: {
            stage: 'synthesis',
            currentTheme: {
              userExplanation: messages
                .filter(m => m.role === 'user')
                .map(m => m.content)
                .join('\n')
            },
            progress: {
              currentTheme: explanations.length,
              totalThemes: explanations.length,
              stage: 'synthesis'
            }
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch synthesis');
      
      const data = await response.json();

      const summaryData = {
        themes: explanations,
        whyListen: data.output
      };

      const encodedData = encodeURIComponent(JSON.stringify(summaryData));
      router.push(`/simulate/overview/summary?responses=${encodedData}`);

    } catch (error) {
      console.error('Error getting synthesis:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error generating the summary. Please try again.' 
      }]);
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
        <div className="flex justify-between items-center p-6">
          <p className="text-gray-400">Discussion</p>
          <Button
            onClick={handleProceedToSummary}
            className="bg-ctaGreen text-white px-4 py-2 rounded-lg hover:bg-ctaGreen/90 transition-colors duration-200"
            disabled={isLoading || isSynthesizing || messages.length < 4}
          >
            {isSynthesizing ? 'Synthesizing ideas...' : 'Proceed to Summary'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6">
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {messages.map((m, index) => (
              <div key={index} className={`flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    {profile ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile.avatar_url || ''} alt={profile.twin_name} />
                        <AvatarFallback>{profile.twin_name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    m.role === 'user' 
                      ? 'bg-ctaGreen text-black ml-auto' 
                      : 'bg-[#2A2B32] text-white'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="flex-shrink-0">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8">
                  {profile ? (
                    <>
                      <AvatarImage src={profile.avatar_url || ''} alt={profile.twin_name} />
                      <AvatarFallback>{profile.twin_name[0]}</AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>AI</AvatarFallback>
                  )}
                </Avatar>
                <div className="bg-[#2A2B32)} px-4 py-3 rounded-2xl">
                  <p className="text-white">...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 max-w-2xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-[#2A2B32] border border-gray-600/40 text-white placeholder-gray-400 px-4 py-3 rounded-xl pr-12 focus:outline-none focus:border-ctaGreen/50 focus:ring-1 focus:ring-ctaGreen/50"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent hover:bg-ctaGreen/10 text-ctaGreen p-2 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {isSynthesizing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 space-y-4">
            <h3 className="text-xl font-semibold text-center text-white">
              Synthesizing Your Ideas
            </h3>
            <p className="text-gray-400 text-center">
              Creating a compelling summary of your insights and perspectives...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionView;