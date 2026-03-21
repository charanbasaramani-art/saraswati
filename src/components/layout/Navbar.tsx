import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, LayoutDashboard, LogOut, User, Menu, X, Brain, Target, Users, Video, TrendingUp, Settings, Flame } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import sraiLogo from '@/assets/srai-logo.png';

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAdmin, isRecruiter, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-navbar theme-transition">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={sraiLogo} alt="SRAI" className="h-9 w-9 object-contain group-hover:scale-105 transition-transform" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold font-serif text-foreground tracking-wide">SRAI</span>
            <span className="text-[10px] text-muted-foreground tracking-wider">Saraswati Resume AI</span>
          </div>
          <Flame className="h-3.5 w-3.5 text-gold flame-flicker ml-1 hidden sm:block" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            {t('nav.about')}
          </Link>
          <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            {t('nav.jobs')}
          </Link>
          
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link to="/soft-skills" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                    <Brain className="h-4 w-4" />
                    {t('nav.softSkills')}
                  </Link>
                  <Link to="/ats-simulator" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                    <Target className="h-4 w-4" />
                    {t('nav.atsSimulator')}
                  </Link>
                  <Link to="/mock-interview" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                    <Video className="h-4 w-4" />
                    {t('nav.mockInterview')}
                  </Link>
                  <Link to="/hiring-predictor" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    {t('nav.hiringPredictor')}
                  </Link>
                  {isRecruiter && (
                    <Link to="/recruiter" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      {t('nav.recruiter')}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                      <User className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                    <Settings className="h-4 w-4" />
                    {t('nav.settings')}
                  </Link>
                  <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2 glass theme-transition text-sm border-gold/20">
                    <LogOut className="h-4 w-4" />
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="glass theme-transition border-gold/20">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button className="btn-plaque">{t('landing.cta')}</Button>
                  </Link>
                </>
              )}
            </>
          )}

          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gold/15 glass p-4 space-y-4 theme-transition">
          <Link to="/about" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.about')}
          </Link>
          <Link to="/jobs" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.jobs')}
          </Link>
          {!isLoading && user ? (
            <>
              <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.dashboard')}</Link>
              <Link to="/soft-skills" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.softSkills')}</Link>
              <Link to="/ats-simulator" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.atsSimulator')}</Link>
              <Link to="/mock-interview" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.mockInterview')}</Link>
              <Link to="/hiring-predictor" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.hiringPredictor')}</Link>
              {isRecruiter && <Link to="/recruiter" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.recruiter')}</Link>}
              {isAdmin && <Link to="/admin" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>}
              <Link to="/settings" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.settings')}</Link>
              <Button variant="outline" onClick={handleSignOut} className="w-full glass border-gold/20">{t('nav.logout')}</Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full glass border-gold/20">{t('nav.login')}</Button>
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full btn-plaque">{t('landing.cta')}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
