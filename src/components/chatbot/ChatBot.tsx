import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickPrompts } from './QuickPrompts';
import { useVoice } from '@/hooks/useVoice';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  hasResume?: boolean;
  resumeScore?: number;
  userName?: string;
}

export function ChatBot({ hasResume = false, resumeScore, userName }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    isListening, 
    isSupported, 
    isSpeaking,
    startListening, 
    stopListening,
    speak,
    stopSpeaking,
  } = useVoice({
    onResult: (transcript) => {
      handleSendMessage(transcript);
    },
    onError: (error) => {
      console.error('Voice error:', error);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: hasResume
          ? `Hi${userName ? ` ${userName}` : ''}! 👋 I see you've uploaded your resume${resumeScore ? ` and scored ${resumeScore}/100` : ''}. How can I help you improve it or find matching jobs?`
          : `Hi${userName ? ` ${userName}` : ''}! 👋 Welcome to ResumeAI! I'm here to help you analyze your resume, find skill gaps, and discover job opportunities. Would you like to upload your resume to get started?`,
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, hasResume, resumeScore, userName, messages.length]);

  // Hide pulse after opening
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            hasResume,
            resumeScore,
            userName,
          },
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (voiceEnabled) {
        speak(data.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, hasResume, resumeScore, userName, voiceEnabled, speak]);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "btn-glow transition-all duration-300 hover:scale-110",
          isOpen && "rotate-0"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {showPulse && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
              </span>
            )}
          </>
        )}
      </Button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] z-50",
        "transition-all duration-300 ease-out transform origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      )}>
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[70vh]">
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ResumeAI Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? 'Thinking...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <QuickPrompts onSelect={handleSendMessage} hasResume={hasResume} />
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && (
              <ChatMessage role="assistant" content="" isLoading />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isVoiceSupported={isSupported}
            onStartListening={startListening}
            onStopListening={stopListening}
            onStopSpeaking={stopSpeaking}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          />
        </div>
      </div>
    </>
  );
}
