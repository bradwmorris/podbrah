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

interface ThemeResponse {
  themeTitle: string;
  userExplanation: string;
}

interface Profile {
  twin_name: string;
  avatar_url: string | null;
}

interface ChatProps {
  podcastId: number;
  podcastTitle: string;
  selectedThemes: Theme[];
}

type Stage = 'present' | 'clarify' | 'explain' | 'confirm';

const Chat = ({ podcastId, podcastTitle, selectedThemes = [] }: ChatProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<Stage>('present');
  const [userExplanations, setUserExplanations] = useState<ThemeResponse[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [localThemes, setLocalThemes] = useState<Theme[]>(selectedThemes);

  const calculateProgress = () => {
    if (localThemes.length === 0) return 0;
    const totalSteps = localThemes.length * 4;
    const currentStep = (currentThemeIndex * 4) + 
      ['present', 'clarify', 'explain', 'confirm'].indexOf(currentStage) + 1;
    return Math.min((currentStep / totalSteps) * 100, 100);
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
    // Load themes from localStorage if none were passed as props
    if (localThemes.length === 0) {
      const storedThemes = localStorage.getItem('selectedThemes');
      if (storedThemes) {
        const parsedThemes = JSON.parse(storedThemes);
        setLocalThemes(parsedThemes);
      }
    }
  }, []);

  useEffect(() => {
    if (localThemes.length > 0 && currentStage === 'present') {
      const currentTheme = localThemes[currentThemeIndex];
      if (!currentTheme) return;

      const initialMessages = [
        {
          role: 'assistant',
          content: currentTheme.theme_gist || currentTheme.metadata?.theme_gist || ''
        }
      ];

      if (currentTheme.big_ideas && Array.isArray(currentTheme.big_ideas)) {
        currentTheme.big_ideas.forEach(idea => {
          if (idea.title && idea.quote) {
            initialMessages.push({
              role: 'assistant',
              content: `💡 ${idea.title}\n"${idea.quote}"`
            });
          }
        });
      }

      initialMessages.push({
        role: 'assistant',
        content: "Would you like me to break this down into simpler terms?"
      });

      setMessages(initialMessages);
      setShowButtons(true);
    }
  }, [currentThemeIndex, localThemes, currentStage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleButtonClick = (button: 'unpack' | 'continue') => {
    setShowButtons(false);
    const currentTheme = localThemes[currentThemeIndex];
    if (!currentTheme) return;

    if (button === 'unpack') {
      setCurrentStage('clarify');
      const simpleBreakdown = currentTheme.metadata?.simple_breakdown || 
                             currentTheme.simple_breakdown || 
                             "Let's explore this concept in simpler terms...";
      
      setMessages(prev => [...prev, 
        { role: 'assistant', content: simpleBreakdown },
        { role: 'assistant', content: "Could you explain this in your own words?" }
      ]);
    } else {
      setCurrentStage('explain');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Could you explain this concept in your own words?"
      }]);
    }
  };

  const moveToNextTheme = () => {
    if (currentThemeIndex < localThemes.length - 1) {
      setCurrentThemeIndex(prev => prev + 1);
      setCurrentStage('present');
      setShowButtons(true);
      setMessages([]);
    } else {
      const encodedExplanations = encodeURIComponent(JSON.stringify(userExplanations));
      router.push(`/simulate/discussion?explanations=${encodedExplanations}`);
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const currentTheme = localThemes[currentThemeIndex];
      if (!currentTheme) throw new Error('No theme found');

      if (currentStage === 'clarify' || currentStage === 'explain') {
        const newResponse = {
          themeTitle: currentTheme.theme_title,
          userExplanation: input,
        };
        setUserExplanations(prev => [...prev, newResponse]);
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Your explanation:\n\n${input}` 
        }]);
        setCurrentStage('confirm');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const currentTheme = localThemes[currentThemeIndex];

  if (!currentTheme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">No themes selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-white mb-2">
            {currentTheme.theme_title}
          </h1>
          <p className="text-gray-400">
            Theme {currentThemeIndex + 1} of {localThemes.length}
          </p>
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
                <div className="bg-[#2A2B32] px-4 py-3 rounded-2xl">
                  <p className="text-white">...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 max-w-2xl mx-auto w-full">
          <div className="mb-4">
            <Progress value={calculateProgress()} className="h-1" />
            <div className="text-xs text-gray-400 flex justify-between mt-1">
              <span>{currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}</span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
          </div>

          {showButtons && currentStage === 'present' ? (
            <div className="flex gap-4">
              <Button
                onClick={() => handleButtonClick('unpack')}
                className="flex-1 bg-ctaGreen text-white py-3 px-4 rounded-xl hover:bg-ctaGreen/90 transition-colors duration-200"
              >
                Unpack Further
              </Button>
              <Button
                onClick={() => handleButtonClick('continue')}
                className="flex-1 bg-ctaGreen text-white py-3 px-4 rounded-xl hover:bg-ctaGreen/90 transition-colors duration-200"
              >
                Makes Sense, Continue
              </Button>
            </div>
          ) : currentStage === 'confirm' ? (
            <Button
              onClick={moveToNextTheme}
              className="w-full bg-ctaGreen text-white py-3 px-4 rounded-xl hover:bg-ctaGreen/90 transition-colors duration-200"
              disabled={isLoading}
            >
              {currentThemeIndex === localThemes.length - 1 ? 'Start Discussion' : 'Next Theme'} 
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