// app/simulate/overview/chat.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

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

type Stage = 'present' | 'understand' | 'articulate' | 'confirm';

const Chat = ({ podcastId, podcastTitle, selectedThemes = [] }: ChatProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<Stage>('present');
  const [userExplanation, setUserExplanation] = useState('');
  const [themeResponses, setThemeResponses] = useState<ThemeResponse[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  // Calculate progress
  const totalSteps = selectedThemes.length * 4; // 4 stages per theme
  const currentStep = (currentThemeIndex * 4) + 
    ['present', 'understand', 'articulate', 'confirm'].indexOf(currentStage) + 1;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (selectedThemes.length > 0) {
      const currentTheme = selectedThemes[currentThemeIndex];
      setMessages([{
        role: 'assistant',
        content: `${currentTheme.theme_gist}\n\nWhat are your initial thoughts on this?`
      }]);
    }
  }, [currentThemeIndex, selectedThemes]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNext = () => {
    if (currentThemeIndex < selectedThemes.length - 1) {
      setCurrentThemeIndex(prev => prev + 1);
      setCurrentStage('present');
      setUserExplanation('');
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const currentTheme = selectedThemes[currentThemeIndex];
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      let nextMessage = '';

      switch (currentStage) {
        case 'present':
          setUserExplanation(input);
          nextMessage = "Great. Now, how would you explain this to a friend in your own words?";
          setCurrentStage('articulate');
          break;

        case 'articulate':
          const newResponse = {
            themeTitle: currentTheme.theme_title,
            userExplanation: input
          };
          setThemeResponses(prev => [...prev, newResponse]);
          setUserExplanation(input);
          nextMessage = `Here's what I understand from your explanation:\n\n${input}\n\nIs this correct? ${
            currentThemeIndex === selectedThemes.length - 1 
              ? "Click 'Complete' to finish." 
              : "Click 'Next Theme' to continue."
          }`;
          setCurrentStage('confirm');
          break;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: nextMessage }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleComplete = () => {
    if (currentThemeIndex === selectedThemes.length - 1 && currentStage === 'confirm') {
      const encodedResponses = encodeURIComponent(JSON.stringify(themeResponses));
      router.push(`/simulate/overview/summary?responses=${encodedResponses}`);
    } else {
      handleNext();
    }
  };

  const currentTheme = selectedThemes[currentThemeIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">{currentTheme?.theme_title}</h1>
          <div className="text-[#21C55D] text-sm">
            Theme {currentThemeIndex + 1} of {selectedThemes.length}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-gray-400 flex justify-between">
            <span>Stage: {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-[#161B22] p-6 rounded-lg shadow-lg">
        {messages.map((m, index) => (
          <div key={index} className={`flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${m.role === 'user' ? 'bg-[#21C55D]' : 'bg-[#30363D]'} p-4 rounded-lg`}>
              <Avatar className="w-8 h-8 mb-2">
                <AvatarFallback>{m.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
              </Avatar>
              <div className={`${m.role === 'user' ? 'text-black' : 'text-white'} whitespace-pre-wrap`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="max-w-[80%] bg-[#30363D] p-4 rounded-lg">
              <Avatar className="w-8 h-8 mb-2">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p>...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-8 flex gap-4">
        {currentStage === 'confirm' ? (
          <Button
            onClick={handleComplete}
            className="w-full bg-[#21C55D] text-white py-2 px-4 rounded-lg hover:bg-[#1CA54C] transition-colors duration-200"
            disabled={isLoading}
          >
            {currentThemeIndex === selectedThemes.length - 1 ? 'Complete' : 'Next Theme'}
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-grow bg-[#161B22] border-none text-white placeholder-gray-400 px-6 py-3 rounded-lg focus:outline-none"
            />
            <Button 
              type="submit" 
              className="bg-[#21C55D] text-white px-6 py-3 rounded-lg hover:bg-[#1CA54C] transition-colors duration-200"
              disabled={isLoading}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;