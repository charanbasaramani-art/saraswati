import { Button } from '@/components/ui/button';
import { Upload, BarChart3, Briefcase, HelpCircle } from 'lucide-react';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  hasResume: boolean;
}

export function QuickPrompts({ onSelect, hasResume }: QuickPromptsProps) {
  const prompts = hasResume
    ? [
        { icon: BarChart3, text: "Explain my resume score", prompt: "Can you explain what my resume score means and how to improve it?" },
        { icon: Briefcase, text: "Show job matches", prompt: "What jobs match my skills based on my resume?" },
        { icon: HelpCircle, text: "What skills to add?", prompt: "What skills are missing from my resume that I should add?" },
      ]
    : [
        { icon: Upload, text: "How to upload?", prompt: "How do I upload my resume for analysis?" },
        { icon: BarChart3, text: "How scoring works", prompt: "How does the resume scoring system work?" },
        { icon: Briefcase, text: "Browse jobs", prompt: "How can I find job recommendations?" },
      ];

  return (
    <div className="p-3 border-b border-border/50">
      <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((item, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(item.prompt)}
            className="text-xs h-7 glass hover-lift"
          >
            <item.icon className="h-3 w-3 mr-1" />
            {item.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
