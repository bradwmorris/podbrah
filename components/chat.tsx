'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function Component() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    console.log('Submitting message:', input);

    setMessages(prevMessages => [...prevMessages, { role: 'user', content: input }]);

    try {
      const response = await fetch('/talk/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: input }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const responseText = await response.text();
      console.log('Received response:', responseText);

      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index !== content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-mono">
      <header className="sticky top-0 z-50 bg-gray-800 p-4">
        <nav className="flex justify-center">
          <a href="/" className="text-white text-sm font-medium">
            ← Back to Home
          </a>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-2xl w-full">
          <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-center">Sir H.C. Waif here, how may I help?</h1>
            {messages.map((m, index) => (
              <div key={index} className="flex items-start gap-4 bg-white p-4 rounded-lg shadow">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>{m.role === 'user' ? 'YO' : 'AI'}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-bold">{m.role === 'user' ? 'You' : 'Sir H.C. Waif'}</div>
                  <div className="text-gray-700">
                    {formatMessage(m.content)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-bold">Sir H.C. Waif</div>
                  <div className="text-gray-700">
                    <p>Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-8 sticky bottom-0 bg-gray-50 pt-4">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="min-h-[48px] rounded-lg resize-none p-4 border border-gray-300 shadow-sm pr-16 w-full"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute w-8 h-8 top-3 right-3 bg-red-500 hover:bg-red-600 text-white" 
                disabled={isLoading}
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
            <p className="text-xs font-medium text-center text-gray-600 mt-2">
              Ask better questions
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}