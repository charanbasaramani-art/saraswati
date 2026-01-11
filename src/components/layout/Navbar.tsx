import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Briefcase, LayoutDashboard, LogOut, User, Menu, X, Brain, Target, Users } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

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
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">ResumeAI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.about')}
          </Link>
          <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.jobs')}
          </Link>
          
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link to="/soft-skills" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    {t('nav.softSkills')}
                  </Link>
                  <Link to="/ats-simulator" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {t('nav.atsSimulator')}
                  </Link>
                  {isRecruiter && (
                    <Link to="/recruiter" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {t('nav.recruiter')}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2 glass theme-transition">
                    <LogOut className="h-4 w-4" />
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="glass theme-transition">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button className="btn-glow">{t('landing.cta')}</Button>
                  </Link>
                </>
              )}
            </>
          )}

          <LanguageSelector />
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <button
            className="p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border glass p-4 space-y-4 theme-transition">
          <Link to="/about" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.about')}
          </Link>
          <Link to="/jobs" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            {t('nav.jobs')}
          </Link>
          {!isLoading && user ? (
            <>
              <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.dashboard')}
              </Link>
              <Link to="/soft-skills" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.softSkills')}
              </Link>
              <Link to="/ats-simulator" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.atsSimulator')}
              </Link>
              {isRecruiter && (
                <Link to="/recruiter" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('nav.recruiter')}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="block text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <Button variant="outline" onClick={handleSignOut} className="w-full glass">
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full glass">{t('nav.login')}</Button>
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full btn-glow">{t('landing.cta')}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
