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
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center bg-background text-foreground">
        <div className="max-w-2xl w-full px-4 md:px-0">
          <div className="flex flex-col gap-8">
            <h1 className="text-2xl font-bold">Sir H.C. Waif here, how may I help?</h1>
            {messages.map((m, index) => (
              <div key={index} className="flex items-start gap-4">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>{m.role === 'user' ? 'YO' : 'AI'}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-bold">{m.role === 'user' ? 'You' : 'Sir H.C. Waif'}</div>
                  <div className="prose text-muted-foreground">
                    {formatMessage(m.content)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-bold">Sir H.C. Waif</div>
                  <div className="prose text-muted-foreground">
                    <p>Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="max-w-2xl w-full sticky bottom-0 mx-auto py-2 flex flex-col gap-1.5 px-4 bg-background">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
              />
              <Button type="submit" size="icon" className="absolute w-8 h-8 top-3 right-3" disabled={isLoading}>
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
            <p className="text-xs font-medium text-center text-neutral-700">
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