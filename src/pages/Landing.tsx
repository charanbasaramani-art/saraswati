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
import { useEffect, useRef, useState } from 'react';

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
    { value: 10000, suffix: 'K+', display: '10K+', label: 'Resumes Analyzed', icon: TrendingUp },
    { value: 95, suffix: '%', display: '95%', label: 'Accuracy Rate', icon: Star },
    { value: 500, suffix: '+', display: '500+', label: 'Job Matches Daily', icon: Award },
    { value: 50, suffix: '+', display: '50+', label: 'Partner Companies', icon: Briefcase },
  ];

  return (
    <Layout>
      {/* ═══ FUTURISTIC AI HERO ═══ */}
      <FuturisticHero stats={stats} />

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
