import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { OrnamentalDivider } from '@/components/OrnamentalDivider';
import sraiLogo from '@/assets/srai-logo.png';
import { 
  Brain, Target, Briefcase, Upload, BarChart3, CheckCircle2, ArrowRight,
  Zap, Shield, Users, Star, TrendingUp, Award, Flame, ScrollText, Lamp
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
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center parchment-bg">
        {/* Warm golden ambient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-muted/40 via-background to-background" />
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-gold/8 blur-[120px] animate-soft-glow" />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-primary/6 blur-[100px] animate-soft-glow" style={{ animationDelay: '1.5s' }} />

        <div className="container relative z-10 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT: Title & CTA */}
            <div className="lg:col-span-5 text-center lg:text-left order-2 lg:order-1">
              {/* Diya icon */}
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-muted border border-gold/20">
                  <Flame className="h-4 w-4 text-gold flame-flicker" />
                  <span className="text-sm font-medium text-foreground/80">Wisdom-Powered Resume Intelligence</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground font-serif leading-tight animate-fade-in-up">
                <span className="gradient-text-animate">SRAI</span>
              </h1>
              <p className="text-lg md:text-xl font-semibold text-primary/90 font-serif italic mt-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Saraswati Resume Artificial Intelligence
              </p>

              <OrnamentalDivider className="max-w-xs mx-auto lg:mx-0 my-5 animate-fade-in-up" />

              <p className="text-base text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Ancient Wisdom Empowering Modern Careers — Analyze resumes, detect skill gaps, improve ATS compatibility, and optimize your career profile.
              </p>

              {/* Scroll-style CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link to="/dashboard">
                  <Button size="lg" className="btn-plaque px-8 py-6 text-base rounded-lg hover-scale">
                    <ScrollText className="mr-2 h-5 w-5" />
                    START RESUME ANALYSIS (SRAI CHECK)
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-base border-gold/30 hover:border-gold/50 hover:bg-gold-muted/30 rounded-lg">
                    {t('landing.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* CENTER: SRAI Logo in ornamental frame */}
            <div className="lg:col-span-4 flex justify-center order-1 lg:order-2 animate-fade-in-up">
              <div className="relative flex items-center justify-center">
                {/* Outer halo glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-gold/30 via-gold/10 to-transparent blur-3xl scale-150 animate-soft-glow" />
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-125" />

                {/* Diya at top */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                  <Lamp className="h-8 w-8 text-gold diya-glow flame-flicker" />
                </div>

                {/* Ornamental frame */}
                <div className="relative manuscript-card corner-ornament temple-border p-8 md:p-10 rounded-2xl bg-gradient-to-br from-gold-muted/40 via-card/80 to-gold-muted/30">
                  <div className="relative w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
                    {/* Inner golden ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-gold/30" />
                    <div className="absolute inset-3 rounded-full border border-gold/20" />
                    <img
                      src={sraiLogo}
                      alt="SRAI Logo"
                      className="w-44 md:w-52 lg:w-60 object-contain drop-shadow-[0_0_30px_hsl(40_70%_50%/0.5)] hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Stats metal panel */}
            <div className="lg:col-span-3 order-3 animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="metal-panel rounded-xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-center font-serif">Platform Statistics</h3>
                <OrnamentalDivider className="!py-2" />
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-gold/15">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground font-serif">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 relative parchment-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-gold-muted/10 to-background" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-4 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4 font-serif">{t('landing.features.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.features.subtitle')}</p>
          </div>
          <OrnamentalDivider className="max-w-sm mx-auto mb-12" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="manuscript-card corner-ornament bg-card/70 hover:shadow-xl hover:shadow-gold/8 transition-all duration-500 group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-gold/10 group-hover:from-primary/25 group-hover:to-gold/20 group-hover:scale-110 transition-all duration-300 border border-gold/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-foreground text-lg font-serif">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 relative heritage-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-card/50" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-4 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4 font-serif">{t('landing.howItWorks.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.howItWorks.subtitle')}</p>
          </div>
          <OrnamentalDivider className="max-w-sm mx-auto mb-14" />
          <div className="grid gap-10 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '01', title: t('landing.howItWorks.step1'), description: t('landing.howItWorks.step1Desc'), icon: ScrollText },
              { step: '02', title: t('landing.howItWorks.step2'), description: t('landing.howItWorks.step2Desc'), icon: Brain },
              { step: '03', title: t('landing.howItWorks.step3'), description: t('landing.howItWorks.step3Desc'), icon: Lamp },
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-fade-in-up group" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="mb-5 text-7xl font-bold text-gold/15 group-hover:text-gold/30 transition-all duration-500 font-serif">{item.step}</div>
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300 border border-gold/20">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-serif">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="py-20 relative parchment-bg">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Shield, title: t('landing.trust.secure'), description: t('landing.trust.secureDesc') },
              { icon: Zap, title: t('landing.trust.instant'), description: t('landing.trust.instantDesc') },
              { icon: Users, title: t('landing.trust.trusted'), description: t('landing.trust.trustedDesc') },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 animate-fade-in-left p-6 rounded-xl temple-border bg-card/60 hover:shadow-lg hover:shadow-gold/8 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-gold/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 font-serif">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[100px] animate-soft-glow" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[100px] animate-soft-glow" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <Flame className="h-10 w-10 text-gold mx-auto mb-4 flame-flicker diya-glow" />
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4 font-serif">{t('landing.cta2.title')}</h2>
            <p className="text-lg text-primary-foreground/80 mb-10">{t('landing.cta2.subtitle')}</p>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 hover-scale font-semibold shadow-xl border border-gold/30">
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
