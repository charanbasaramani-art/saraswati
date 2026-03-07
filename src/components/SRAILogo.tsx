import sraiLogo from '@/assets/srai-logo.png';

interface SRAILogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
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
