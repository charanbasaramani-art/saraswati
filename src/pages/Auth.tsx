import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, Eye, EyeOff, Sparkles, Shield, Brain, Zap, Flame } from 'lucide-react';
import { z } from 'zod';
import sraiLogo from '@/assets/srai-logo.png';
import saraswatiHero from '@/assets/saraswati-hero.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export default function Auth() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { setIsSignUp(searchParams.get('mode') === 'signup'); }, [searchParams]);

  const validateForm = (): boolean => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (isSignUp) nameSchema.parse(fullName);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0].message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) setError(error.message.includes('already registered') ? 'This email is already registered.' : error.message);
        else navigate('/dashboard');
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message.includes('Invalid login') ? 'Invalid email or password.' : error.message);
        else navigate('/dashboard');
      }
    } catch { setError('An unexpected error occurred.'); } finally { setIsLoading(false); }
  };

  const features = [
    { icon: Sparkles, title: 'AI Analysis', desc: 'Get instant feedback' },
    { icon: Shield, title: 'ATS Optimized', desc: 'Pass screening systems' },
    { icon: Brain, title: 'Smart Insights', desc: 'Personalized suggestions' },
    { icon: Zap, title: 'Fast Results', desc: 'Analyze in seconds' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Heritage Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden parchment-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-foreground/90" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-gold/15 rounded-full blur-[100px] animate-soft-glow" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-gold/10 rounded-full blur-[80px] animate-soft-glow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Link to="/" className="inline-flex items-center gap-3 mb-10">
            <img src={sraiLogo} alt="SRAI" className="h-12 w-12 object-contain brightness-0 invert" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-serif">SRAI</span>
              <span className="text-[10px] opacity-80 tracking-wider uppercase">Saraswati Resume AI</span>
            </div>
            <Flame className="h-4 w-4 text-gold flame-flicker ml-1" />
          </Link>

          {/* Mini Saraswati image */}
          <div className="flex justify-center mb-8">
            <img src={saraswatiHero} alt="Saraswati" className="w-48 rounded-lg border border-gold/20 shadow-2xl opacity-90" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 leading-tight font-serif text-center">
            Ancient Wisdom Empowering Modern Careers
          </h1>
          
          <p className="text-sm text-primary-foreground/75 mb-8 leading-relaxed text-center">
            Join thousands of job seekers who have improved their resumes with SRAI.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
                <div className="h-9 w-9 rounded-lg bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs">{feature.title}</p>
                  <p className="text-[10px] text-primary-foreground/65">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-4 py-12 relative parchment-bg">
        <div className="w-full max-w-md animate-fade-in relative z-10">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src={sraiLogo} alt="SRAI" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold font-serif text-foreground">SRAI</span>
            </Link>
          </div>

          <Card className="manuscript-card corner-ornament border-gold/20 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3">
                <img src={sraiLogo} alt="SRAI" className="h-14 w-14 object-contain mx-auto" />
              </div>
              <CardTitle className="text-2xl font-bold font-serif">
                {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
              </CardTitle>
              <CardDescription className="text-base">
                {isSignUp ? t('auth.startJourney') : t('auth.signInAccess')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">{t('auth.fullName')}</Label>
                    <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={isLoading} className="h-12 bg-muted/50 border-gold/15 focus:border-primary transition-colors" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="h-12 bg-muted/50 border-gold/15 focus:border-primary transition-colors" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="h-12 pr-12 bg-muted/50 border-gold/15 focus:border-primary transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold btn-plaque rounded-lg" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{isSignUp ? t('auth.creatingAccount') : t('auth.signingIn')}</>
                  ) : (
                    <>{isSignUp ? t('auth.signup') : t('auth.login')}</>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gold/15">
                <p className="text-center text-muted-foreground">
                  {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    {isSignUp ? t('auth.login') : t('auth.signup')}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">{t('auth.termsNotice')}</p>
        </div>
      </div>
    </div>
  );
}
