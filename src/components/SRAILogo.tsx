import sraiLogo from '@/assets/srai-logo.png';

interface SRAILogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function SRAILogo({ size = 'md', showText = true, className = '' }: SRAILogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={sraiLogo} alt="SRAI Logo" className={`${sizeMap[size]} object-contain`} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textSizeMap[size]} font-bold text-foreground tracking-tight`}>SRAI</span>
          {(size === 'lg' || size === 'xl') && (
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Saraswati Resume AI</span>
          )}
        </div>
      )}
    </div>
  );
}
