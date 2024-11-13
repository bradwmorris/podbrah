'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { supabaseAuth } from '@/lib/supabaseAuth';
import { useAuth } from '@/components/auth/AuthProvider';

interface Theme {
  theme_title: string;
  theme_gist: string;
  chapter_number: number;
}

interface ChatProps {
  podcastId: number;
  podcastTitle?: string;
  selectedThemes?: Theme[];
}

interface ThemeResponse {
  themeTitle: string;
  userExplanation: string;
}

interface Profile {
  twin_name: string;
  avatar_url: string | null;
}

type Stage = 'present' | 'explain' | 'confirm' | 'why_listen' | 'complete';

const Chat = ({ podcastId, podcastTitle, selectedThemes = [] }: ChatProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<Stage>('present');
  const [userExplanation, setUserExplanation] = useState('');
  const [whyListenResponse, setWhyListenResponse] = useState('');
  const [themeResponses, setThemeResponses] = useState<ThemeResponse[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Calculate progress - themes are 90%, final why_listen is 10%
  const calculateProgress = () => {
    const themeWeight = 90;
    const whyListenWeight = 10;
    
    if (currentStage === 'why_listen' || currentStage === 'complete') {
      return themeWeight + whyListenWeight;
    }

    const stepsPerTheme = 3; // present, explain, confirm
    const currentThemeProgress = themeWeight * (currentThemeIndex / selectedThemes.length);
    const currentStageProgress = themeWeight * (1 / selectedThemes.length) * 
      (['present', 'explain', 'confirm'].indexOf(currentStage) + 1) / stepsPerTheme;

    return Math.min(themeWeight, currentThemeProgress + currentStageProgress);
  };

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
    if (selectedThemes.length > 0 && currentStage === 'present') {
      const currentTheme = selectedThemes[currentThemeIndex];
      setMessages([{
        role: 'assistant',
        content: currentTheme.theme_gist
      }, {
        role: 'assistant',
        content: "How would you explain this to a 'simple' friend, who had no idea what-da-fuck? you were talking bout?"
      }]);
    }
  }, [currentThemeIndex, selectedThemes, currentStage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNext = () => {
    if (currentThemeIndex < selectedThemes.length - 1) {
      setCurrentThemeIndex(prev => prev + 1);
      setCurrentStage('present');
      setUserExplanation('');
    } else if (currentStage === 'confirm') {
      setCurrentStage('why_listen');
      setMessages([{
        role: 'assistant',
        content: "Why should others listen to this podcast?\n\nIf you had to share a single, most impactful insight from this conversation, what would it be?"
      }]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let nextMessage = '';
      const currentTheme = selectedThemes[currentThemeIndex];

      switch (currentStage) {
        case 'present':
          const newResponse = {
            themeTitle: currentTheme.theme_title,
            userExplanation: input
          };
          setThemeResponses(prev => [...prev, newResponse]);
          setUserExplanation(input);
          nextMessage = `Here's what I understand from your explanation:\n\n${input}\n\nIs this correct?`;
          setMessages(prev => [...prev, { role: 'assistant', content: nextMessage }]);
          setCurrentStage('confirm');
          break;

        case 'why_listen':
          setWhyListenResponse(input);
          const encodedResponses = encodeURIComponent(JSON.stringify({
            themes: themeResponses,
            whyListen: input
          }));
          router.push(`/simulate/overview/summary?responses=${encodedResponses}`);
          return;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleComplete = () => {
    if (currentStage === 'confirm') {
      handleNext();
    }
  };

  const currentTheme = selectedThemes[currentThemeIndex];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
        {/* Header - Simplified */}
        <div className="flex justify-between items-center p-6">
          <p className="text-gray-400">
            {currentStage === 'why_listen' ? 'Final Thoughts' : currentTheme?.theme_title}
            {currentStage !== 'why_listen' && (
              <span className="text-[#21C55D] ml-2">
                Theme {currentThemeIndex + 1} of {selectedThemes.length}
              </span>
            )}
          </p>
        </div>

        {/* Chat Messages - Centered Design */}
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
                <div className="bg-[#2A2B32] px-4 py-3 rounded-2xl">
                  <p className="text-white">...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Section - Modern Style */}
        <div className="px-4 md:px-6 py-4 max-w-2xl mx-auto w-full">
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={calculateProgress()} className="h-1" />
            <div className="text-xs text-gray-400 flex justify-between mt-1">
              <span>{currentStage.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}</span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
          </div>

          {currentStage === 'confirm' ? (
            <Button
              onClick={handleComplete}
              className="w-full bg-ctaGreen text-white py-3 px-4 rounded-xl hover:bg-ctaGreen/90 transition-colors duration-200"
              disabled={isLoading}
            >
              {currentThemeIndex === selectedThemes.length - 1 ? 'Final Step' : 'Next Theme'}
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;