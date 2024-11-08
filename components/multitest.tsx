// multitest.tsx
import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Message {
  role: string;
  content: string;
}

interface ChatProps {
  agentId: string;
  agentName: string;
  initialMessage?: string;
  userName?: string;
  email?: string;
  onConfirm?: (message: string, sessionId: string) => void;
  ref?: React.RefObject<{ 
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>, 
    handleSubmit: (e?: React.FormEvent, message?: string) => Promise<void>,
    getSessionId: () => string 
  }>;
}

const ChatInterface = React.forwardRef<{ 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>, 
  handleSubmit: (e?: React.FormEvent, message?: string) => Promise<void>,
  getSessionId: () => string
}, ChatProps>(
  ({ agentId, agentName, initialMessage, userName, email, onConfirm }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [hiddenMessages, setHiddenMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
    const [error, setError] = useState<string | null>(null);
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [showDebriefButton, setShowDebriefButton] = useState(agentId === 'agent2');
    const [debriefTriggered, setDebriefTriggered] = useState(false);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    React.useImperativeHandle(ref, () => ({
      setMessages,
      handleSubmit,
      getSessionId: () => sessionId,
    }));

    const handleSubmit = async (e?: React.FormEvent, message?: string) => {
      e?.preventDefault();
      const inputMessage = message || input;
      if (!inputMessage.trim()) return;

      setIsLoading(true);
      setError(null);

      if (!message) {
        setMessages(prevMessages => [...prevMessages, { role: 'user', content: inputMessage }]);
      }

      try {
        let endpoint;
        switch (agentId) {
          case 'agentwaif':
            endpoint = '/multitest/api/chat/initial';
            break;
          case 'agent0':
            endpoint = '/multitest/api/chat/agent0';
            break;
          case 'agent1':
            endpoint = '/multitest/api/chat/agent1';
            break;
          case 'agent2':
            endpoint = '/multitest/api/chat/agent2';
            break;
          default:
            throw new Error(`Invalid agent ID: ${agentId}`);
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: inputMessage,
            sessionId: sessionId,
            name: userName || 'anonymous',
            email: email || '',
            triggerDebrief: agentId === 'agent2' && debriefTriggered,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        let assistantResponse: string;
        if (Array.isArray(data) && data.length > 0 && data[0][agentId]) {
          assistantResponse = data[0][agentId] as string;
        } else if (data[agentId]) {
          assistantResponse = data[agentId] as string;
        } else {
          throw new Error(`No response found for agent ${agentId}`);
        }
        
        if (assistantResponse) {
          if (agentId === 'agent2' && !debriefTriggered) {
            setHiddenMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
          } else {
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantResponse }]);
          }
          console.log(`Received N8N response:`, assistantResponse);

          if (agentId === 'agentwaif') {
            setShowConfirmButton(true);
          }
        }

        if (agentId === 'agent2' && !debriefTriggered) {
          setShowDebriefButton(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' },
        ]);
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

    const handleDebriefClick = async () => {
      setDebriefTriggered(true);
      setShowDebriefButton(false);
      setMessages(prev => [...prev, ...hiddenMessages]);
      setHiddenMessages([]);
    };

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900 text-green-400 font-mono border border-green-700 rounded-lg overflow-hidden">
        <header className="bg-gray-800 p-4 text-green-400 font-bold border-b border-green-700">
          {agentName} - Session: {sessionId}
        </header>
        <div className="flex-1 overflow-auto p-4">
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${
                m.role === 'user' ? 'bg-gray-800' : 'bg-gray-700'
              } p-4 rounded-lg border border-green-700 mb-4`}
            >
              <Avatar className="w-8 h-8 border border-green-500">
                <AvatarFallback className="bg-gray-900 text-green-500">
                  {m.role === 'user' ? '>' : '$'}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1">
                <div className="font-bold text-green-300">
                  {m.role === 'user' ? 'User' : m.role === 'system' ? 'System' : agentName}
                </div>
                <div className="text-green-100 whitespace-pre-wrap">{formatMessage(m.content)}</div>
              </div>
            </div>
          ))}
          {showConfirmButton && (
            <div className="mt-4">
              <Button
                onClick={() => {
                  onConfirm?.(initialMessage || '', sessionId);
                  setShowConfirmButton(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Ready to proceed with simulation
              </Button>
            </div>
          )}
          {showDebriefButton && (
            <div className="mt-4">
              <Button
                onClick={handleDebriefClick}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Ready to debrief
              </Button>
            </div>
          )}
          {isLoading && (
            <div className="flex items-start gap-4 bg-gray-700 p-4 rounded-lg border border-green-700">
              <Avatar className="w-8 h-8 border border-green-500">
                <AvatarFallback className="bg-gray-900 text-green-500">$</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-bold text-green-300">{agentName}</div>
                <div className="text-green-100">
                  <p>Processing query...</p>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div
              className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-lg"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-green-700">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your command..."
              rows={1}
              className="min-h-[48px] rounded-lg resize-none p-4 pr-16 w-full bg-gray-700 text-green-300 border border-green-700 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute w-8 h-8 top-3 right-3 bg-green-700 hover:bg-green-600 text-gray-900"
              disabled={isLoading}
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

ChatInterface.displayName = 'ChatInterface';

interface ChatComponentProps {
  initialMessage?: string;
}

export function ChatComponent({ initialMessage }: ChatComponentProps) {
  const [showOtherAgents, setShowOtherAgents] = useState(false);
  const n8nRefs = useRef<
    Array<
      React.RefObject<{
        setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
        handleSubmit: (e?: React.FormEvent, message?: string) => Promise<void>;
        getSessionId: () => string;
      }>
    >
  >([React.createRef(), React.createRef(), React.createRef(), React.createRef()]);

  // Extract query parameters using useSearchParams
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'anonymous';
  const email = searchParams.get('email') || '';
  const beliefs = searchParams.get('beliefs') || '';

  // Use the initialMessage passed in props, or construct it
  const initialMessageToUse = initialMessage || `Name: ${userName}\nBeliefs: ${beliefs}\n`;

  // Use a ref to prevent multiple submissions
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!hasSubmittedRef.current && initialMessageToUse && n8nRefs.current[0].current?.handleSubmit) {
      n8nRefs.current[0].current.handleSubmit(undefined, initialMessageToUse);
      hasSubmittedRef.current = true;
    }
  }, [initialMessageToUse]);

  const handleConfirmation = async (initialMessage: string, sessionId: string) => {
    setShowOtherAgents(true);
    setTimeout(() => {
      ['agent0', 'agent1', 'agent2'].forEach((agentId, index) => {
        const ref = n8nRefs.current[index + 1];
        if (ref.current?.handleSubmit) {
          ref.current.handleSubmit(undefined, initialMessage);
        }
      });
    }, 0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <ChatInterface
          agentId="agentwaif"
          agentName="Agent Waif"
          ref={n8nRefs.current[0]}
          onConfirm={handleConfirmation}
          initialMessage={initialMessageToUse}
          userName={userName}
          email={email}
        />
        {showOtherAgents && (
          <>
            <ChatInterface
              agentId="agent0"
              agentName="Agent 0"
              ref={n8nRefs.current[1]}
              userName={userName}
              email={email}
            />
            <ChatInterface
              agentId="agent1"
              agentName="Agent 1"
              ref={n8nRefs.current[2]}
              userName={userName}
              email={email}
            />
            <ChatInterface
              agentId="agent2"
              agentName="Agent 2"
              ref={n8nRefs.current[3]}
              userName={userName}
              email={email}
            />
          </>
        )}
      </div>
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
      <path d="M5 12L12 5l7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export default ChatComponent
