import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const resolved = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase();
  const currentLanguage =
    languages.find((lang) => resolved === lang.code || resolved.startsWith(`${lang.code}-`)) ||
    languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 glass hover:bg-accent/10 theme-transition px-3"
          aria-label={t('language.select')}
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card min-w-[200px] p-2">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Select Language
        </div>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer rounded-lg px-3 py-3 theme-transition flex items-center justify-between ${
              currentLanguage.code === language.code
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{language.flag}</span>
              <div>
                <span className="font-medium block">{language.nativeName}</span>
                {language.code !== 'en' && (
                  <span className="text-xs text-muted-foreground">
                    {language.name}
                  </span>
                )}
              </div>
            </div>
            {currentLanguage.code === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}