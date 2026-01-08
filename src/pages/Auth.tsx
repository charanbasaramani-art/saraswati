import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ResumeAI</span>
          </Link>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}</CardTitle>
            <CardDescription>{isSignUp ? t('auth.startJourney') : t('auth.signInAccess')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={isLoading} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? t('auth.creatingAccount') : t('auth.signingIn')}</>) : (isSignUp ? t('auth.signup') : t('auth.login'))}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {isSignUp ? (
                <p className="text-muted-foreground">{t('auth.hasAccount')}{' '}<button type="button" onClick={() => setIsSignUp(false)} className="text-primary hover:underline font-medium">{t('auth.login')}</button></p>
              ) : (
                <p className="text-muted-foreground">{t('auth.noAccount')}{' '}<button type="button" onClick={() => setIsSignUp(true)} className="text-primary hover:underline font-medium">{t('auth.signup')}</button></p>
              )}
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">{t('auth.termsNotice')}</p>
      </div>
    </div>
  );
}