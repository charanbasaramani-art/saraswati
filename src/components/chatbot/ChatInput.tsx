import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isVoiceSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export function ChatInput({
  onSend,
  isLoading,
  isListening,
  isSpeaking,
  isVoiceSupported,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  voiceEnabled,
  onToggleVoice,
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="p-3 border-t border-border/50 bg-background/50">
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="min-h-[44px] max-h-[120px] resize-none bg-muted/50 border-border/50 focus:border-primary/50"
          disabled={isLoading}
          rows={1}
        />
        <div className="flex flex-col gap-1">
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 btn-glow"
          >
            <Send className="h-4 w-4" />
          </Button>
          {isVoiceSupported && (
            <>
              <Button
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={handleMicClick}
                disabled={isLoading}
                className={cn(
                  "h-9 w-9 transition-all",
                  isListening && "animate-pulse"
                )}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={isSpeaking ? onStopSpeaking : onToggleVoice}
                className="h-9 w-9"
                title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
      {isListening && (
        <p className="text-xs text-primary mt-2 animate-pulse">
          🎤 Listening... Speak now
        </p>
      )}
    </div>
  );
}
