import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/ThemeProvider';
import { Palette, Check, Moon, Sun, Monitor, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-7 w-7 text-gold diya-glow" />
            <h1 className="text-3xl font-bold font-serif text-foreground animate-fade-in-up">Settings</h1>
          </div>
          <p className="text-muted-foreground mt-2 animate-fade-in-up stagger-1">
            Manage your application preferences
          </p>
        </div>

        <Card className="manuscript-card corner-ornament animate-fade-in-up stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme
            </CardTitle>
            <CardDescription>Choose your preferred theme for the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: Sun, description: 'Light background with dark text' },
                { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark background with light text' },
                { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preferences' },
              ].map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'system')}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-left ${
                    theme === themeOption.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 glass'
                  }`}
                >
                  {theme === themeOption.value && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center animate-bounce-in z-10">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <themeOption.icon className={`h-8 w-8 mb-2 relative z-10 ${theme === themeOption.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h4 className="font-medium relative z-10">{themeOption.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1 relative z-10">{themeOption.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
