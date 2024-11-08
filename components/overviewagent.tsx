"use client";

import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from 'lucide-react';

interface ConversationState {
  stage: 'introduction' | 'content_discussion' | 'idea_refinement' | 'conclusion';
  discussedTopics: string[];
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<{
    name: string;
    selectedOption: string;
    selectedOptionText: string;
    selectedThemes: string[];
    selectedThemeTexts: string[];
    podcastId: string;
  } | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'introduction',
    discussedTopics: []
  });

  // Static set of questions for testing
  const staticQuestions = [
    'What aspects of this podcast topic interest you the most?',
    'How do you think these ideas could apply to your own experiences?',
    'What potential challenges do you see in implementing these concepts?'
  ];

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
    }

    // Retrieve user preferences from localStorage
    const name = localStorage.getItem('userName') || '';
    const selectedOption = localStorage.getItem('selectedOption') || '';
    const selectedOptionText = localStorage.getItem('selectedOptionText') || '';
    const selectedThemes = JSON.parse(localStorage.getItem('selectedThemes') || '[]');
    const selectedThemeTexts = JSON.parse(localStorage.getItem('selectedThemeTexts') || '[]');
    const podcastId = localStorage.getItem('podcast_id') || '';

    setUserPreferences({ name, selectedOption, selectedOptionText, selectedThemes, selectedThemeTexts, podcastId });

    // Initial greeting message
    if (name) {
      setMessages([{ role: 'assistant', content: `Hello ${name}! How can I assist you with the podcast today?` }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim()) return;

    if (!userPreferences?.podcastId) {
      setError('Podcast ID is missing. Please go back and select a podcast.');
      console.error('Podcast ID is missing from localStorage.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const newUserMessage = { role: 'user', content: messageToSend };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    try {
      const response = await fetch('/api/overviewchat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageToSend,
          sessionId: sessionId,
          ...userPreferences,
          conversationState
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const responseData = await response.json();
      const assistantResponse = responseData.output || 'No response received';

      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: assistantResponse }
      ]);

      // Update conversation state
      setConversationState(prevState => ({
        ...prevState,
        stage: prevState.stage === 'introduction' ? 'content_discussion' : prevState.stage,
        discussedTopics: [...prevState.discussedTopics, messageToSend]
      }));

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatMessage = (content: string | undefined) => {
    if (!content) return null;
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index !== content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0E1116] text-white font-sans">
      <header className="sticky top-0 z-50 bg-[#161B22] p-4 border-b border-[#30363D]">
        <nav className="flex justify-between items-center">
          <a href="/" className="text-[#21C55D] text-sm font-medium hover:text-[#1CA54C]">
            ← Back to Home
          </a>
          <div className="text-[#21C55D] text-sm">Session: {sessionId}</div>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-auto bg-[#0E1116]">
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl font-bold text-center text-white mb-8">
            H.C. Waif Chat Interface
          </h1>
          <div className="bg-[#161B22] inline-block rounded-full px-4 py-2 mb-8">
            <h2 className="text-[#21C55D] text-xl uppercase tracking-wider">Your AI Assistant</h2>
          </div>
          <div className="flex flex-col gap-6 bg-[#161B22] p-6 rounded-lg shadow-lg">
            {messages.map((m, index) => (
              <div key={index} className={`flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${m.role === 'user' ? 'bg-[#21C55D]' : 'bg-[#30363D]'} p-4 rounded-lg`}>
                  <Avatar className="w-8 h-8 mb-2">
                    <AvatarFallback>{m.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <div className={`${m.role === 'user' ? 'text-black' : 'text-white'} whitespace-pre-wrap`}>
                    {formatMessage(m.content)}
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
                    <p>Processing query...</p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex items-center bg-[#161B22] rounded-lg overflow-hidden">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your message..."
                className="flex-grow bg-transparent border-none text-white placeholder-gray-400 px-6 py-3 focus:outline-none"
              />
              <Button 
                type="submit" 
                className="bg-[#21C55D] text-white px-6 py-3 rounded-lg hover:bg-[#1CA54C] transition-colors duration-200"
                disabled={isLoading}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <p className="w-full text-center mb-2">Suggested Questions:</p>
            {staticQuestions.map((prompt, index) => (
              <Button
                key={index}
                onClick={() => handleSubmit(undefined, prompt)}
                className="bg-[#161B22] text-[#21C55D] hover:bg-[#21C55D] hover:text-white border border-[#21C55D] transition-colors duration-200 rounded-lg"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}