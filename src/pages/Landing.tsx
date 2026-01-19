import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Brain, 
  Target, 
  Briefcase, 
  Upload, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Shield,
  Users
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
    { value: '10K+', label: t('landing.stats.resumes') },
    { value: '95%', label: t('landing.stats.satisfaction') },
    { value: '500+', label: t('landing.stats.matches') },
    { value: '50+', label: t('landing.stats.companies') },
  ];

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm animate-fade-in-down">
              <Zap className="mr-2 h-4 w-4 text-primary animate-pulse" />
              <span className="text-muted-foreground">{t('landing.hero.badge')}</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t('landing.hero.title')}{' '}
              <span className="gradient-text-animate">{t('landing.hero.titleHighlight')}</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>{t('landing.hero.description')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 btn-glow hover-scale">
                  {t('landing.cta')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 hover-scale">
                  {t('landing.learnMore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-primary number-animate">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t('landing.features.title')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{t('landing.features.subtitle')}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-card glass-card hover-lift group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t('landing.howItWorks.title')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{t('landing.howItWorks.subtitle')}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: t('landing.howItWorks.step1'), description: t('landing.howItWorks.step1Desc'), icon: Upload },
              { step: '02', title: t('landing.howItWorks.step2'), description: t('landing.howItWorks.step2Desc'), icon: Brain },
              { step: '03', title: t('landing.howItWorks.step3'), description: t('landing.howItWorks.step3Desc'), icon: Target },
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-fade-in-up group" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="mb-4 text-6xl font-bold text-primary/20 transition-all duration-300 group-hover:text-primary/40">{item.step}</div>
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Shield, title: t('landing.trust.secure'), description: t('landing.trust.secureDesc') },
              { icon: Zap, title: t('landing.trust.instant'), description: t('landing.trust.instantDesc') },
              { icon: Users, title: t('landing.trust.trusted'), description: t('landing.trust.trustedDesc') },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 animate-fade-in-left hover-lift p-4 rounded-xl transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">{t('landing.cta2.title')}</h2>
            <p className="mt-4 text-lg text-primary-foreground/80">{t('landing.cta2.subtitle')}</p>
            <div className="mt-8">
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 hover-scale animate-pulse-glow">
                  {t('landing.cta2.button')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}