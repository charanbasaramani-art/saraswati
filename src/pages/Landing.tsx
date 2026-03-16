import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { SRAILogo } from '@/components/SRAILogo';
import sraiLogo from '@/assets/srai-logo.png';
import { 
  Brain, 
  Target, 
  Briefcase, 
  Upload, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Shield,
  Users,
  Sparkles,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: Upload, title: t('landing.features.upload'), description: t('landing.features.uploadDesc') },
    { icon: Brain, title: t('landing.features.analysis'), description: t('landing.features.analysisDesc') },
    { icon: Target, title: t('landing.features.ats'), description: t('landing.features.atsDesc') },
    { icon: Briefcase, title: t('landing.features.jobs'), description: t('landing.features.jobsDesc') },
    { icon: BarChart3, title: t('landing.features.skillGap'), description: t('landing.features.skillGapDesc') },
    { icon: CheckCircle2, title: t('landing.features.insights'), description: t('landing.features.insightsDesc') },
  ];

  const stats = [
    { value: '10K+', label: t('landing.stats.resumes'), icon: TrendingUp },
    { value: '95%', label: t('landing.stats.satisfaction'), icon: Star },
    { value: '500+', label: t('landing.stats.matches'), icon: Award },
    { value: '50+', label: t('landing.stats.companies'), icon: Briefcase },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-accent-foreground/8 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container relative z-10 py-20 md:py-32">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-medium animate-fade-in-down backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse" />
              <span className="text-foreground/80">Wisdom-Powered Resume Intelligence</span>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <img src={sraiLogo} alt="SRAI" className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Title */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text-animate">Saraswati Resume AI</span>
            </h1>
            
            <p className="mb-4 text-xl md:text-2xl font-semibold text-primary/90 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              Wisdom-Powered Resume Intelligence
            </p>
            
            <p className="mb-10 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              SRAI helps you analyze resumes, detect skill gaps, improve ATS compatibility, and optimize your career profile — powered by AI and inspired by the wisdom of Saraswati.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-6 btn-glow hover-scale font-semibold shadow-lg shadow-primary/25">
                  {t('landing.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-6 hover-scale border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                  {t('landing.learnMore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm relative">
        <div className="container py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up group" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground number-animate">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t('landing.features.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.features.subtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 group-hover:from-primary/25 group-hover:to-accent/25 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-foreground text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-card/30 relative">
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t('landing.howItWorks.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.howItWorks.subtitle')}</p>
          </div>
          <div className="grid gap-12 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '01', title: t('landing.howItWorks.step1'), description: t('landing.howItWorks.step1Desc'), icon: Upload },
              { step: '02', title: t('landing.howItWorks.step2'), description: t('landing.howItWorks.step2Desc'), icon: Brain },
              { step: '03', title: t('landing.howItWorks.step3'), description: t('landing.howItWorks.step3Desc'), icon: Target },
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-fade-in-up group" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="mb-6 text-7xl font-bold text-primary/10 group-hover:text-primary/25 transition-all duration-500">{item.step}</div>
                <div className="mb-5 inline-flex h-18 w-18 items-center justify-center rounded-2xl bg-primary text-primary-foreground group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 p-4">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 relative">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, title: t('landing.trust.secure'), description: t('landing.trust.secureDesc') },
              { icon: Zap, title: t('landing.trust.instant'), description: t('landing.trust.instantDesc') },
              { icon: Users, title: t('landing.trust.trusted'), description: t('landing.trust.trustedDesc') },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 animate-fade-in-left p-6 rounded-2xl border border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-accent-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary-foreground/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-foreground/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4">{t('landing.cta2.title')}</h2>
            <p className="text-lg text-primary-foreground/80 mb-10">{t('landing.cta2.subtitle')}</p>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 hover-scale font-semibold shadow-xl">
                {t('landing.cta2.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
