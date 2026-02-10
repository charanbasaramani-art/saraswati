import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickPrompts } from './QuickPrompts';
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export function ChatBot({ hasResume = false, resumeScore, userName }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: hasResume
          ? `Hi${userName ? ` ${userName}` : ''}! 👋 I see you've uploaded your resume${resumeScore ? ` and scored **${resumeScore}/100**` : ''}. How can I help you improve it or find matching jobs?`
          : `Hi${userName ? ` ${userName}` : ''}! 👋 Welcome to **ResumeAI**! I'm **R-ATLAS**, your AI assistant. I can help you analyze your resume, find skill gaps, and discover job opportunities. Would you like to upload your resume to get started?`,
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, hasResume, resumeScore, userName, messages.length]);

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

    // Abort any previous stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let assistantSoFar = '';
    const assistantId = (Date.now() + 1).toString();

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          context: { hasResume, resumeScore, userName },
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { id: assistantId, role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantSoFar } : m
                )
              );
            }
          } catch { /* ignore */ }
        }
      }

      // Ensure assistant message exists even if empty
      if (!assistantSoFar) {
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: "I'm sorry, I couldn't generate a response. Please try again." },
        ]);
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Connection error';
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: `Sorry, something went wrong: ${errorMsg}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, hasResume, resumeScore, userName]);

  return (
    <>
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

      <div className={cn(
        "fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] z-50",
        "transition-all duration-300 ease-out transform origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      )}>
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[70vh]">
          <div className="p-4 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">R-ATLAS</h3>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? 'Thinking...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
          </div>

          {messages.length <= 1 && (
            <QuickPrompts onSelect={handleSendMessage} hasResume={hasResume} />
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && !messages.some(m => m.role === 'assistant' && m.id === (Date.now() + 1).toString()) && messages[messages.length - 1]?.role === 'user' && (
              <ChatMessage role="assistant" content="" isLoading />
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
