import { Flower2 } from 'lucide-react';

interface OrnamentalDividerProps {
  className?: string;
}

export function OrnamentalDivider({ className = '' }: OrnamentalDividerProps) {
  return (
    <div className={`ornamental-divider ${className}`}>
      <Flower2 className="ornamental-divider-icon h-4 w-4 flex-shrink-0" />
    </div>
  );
}
