import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrnamentalDivider } from '@/components/OrnamentalDivider';
import { useTranslation } from 'react-i18next';
import {
  Brain, Target, Users, GraduationCap, Code2, Database, Sparkles, Shield, Rocket,
  Heart, Zap, Globe, Flame, FileText, ScanLine, BarChart3, Lightbulb, CheckCircle2,
} from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const technologies = [
    { icon: Code2, name: t('about.tech.react'), description: t('about.tech.reactDesc'), color: 'from-blue-500 to-cyan-500' },
    { icon: Database, name: t('about.tech.backend'), description: t('about.tech.backendDesc'), color: 'from-green-500 to-emerald-500' },
    { icon: Brain, name: t('about.tech.ai'), description: t('about.tech.aiDesc'), color: 'from-purple-500 to-pink-500' },
    { icon: Shield, name: t('about.tech.auth'), description: t('about.tech.authDesc'), color: 'from-orange-500 to-red-500' },
  ];

  const features = [
    { title: t('about.features.parsing'), description: t('about.features.parsingDesc'), icon: Sparkles },
    { title: t('about.features.analysis'), description: t('about.features.analysisDesc'), icon: Brain },
    { title: t('about.features.ats'), description: t('about.features.atsDesc'), icon: Target },
    { title: t('about.features.jobs'), description: t('about.features.jobsDesc'), icon: Rocket },
    { title: t('about.features.admin'), description: t('about.features.adminDesc'), icon: Shield },
    { title: t('about.features.responsive'), description: t('about.features.responsiveDesc'), icon: Globe },
  ];

  const stats = [
    { value: '10K+', label: 'Resumes Analyzed', icon: Sparkles },
    { value: '95%', label: 'Success Rate', icon: Target },
    { value: '50+', label: 'Companies', icon: Users },
    { value: '24/7', label: 'AI Support', icon: Zap },
  ];

  const roadmap = [
    {
      step: '01',
      icon: FileText,
      title: 'Resume Parsing',
      desc: 'Your PDF or DOCX is parsed into structured text — sections, headings, dates, and bullet points are normalized for analysis.',
    },
    {
      step: '02',
      icon: ScanLine,
      title: 'Skill Extraction',
      desc: 'Our AI identifies hard skills, soft skills, tools, and frameworks, comparing them against industry-relevant skill libraries.',
    },
    {
      step: '03',
      icon: Target,
      title: 'ATS Compatibility Check',
      desc: 'We simulate Applicant Tracking Systems — checking formatting, keyword density, section order, and parse-ability.',
    },
    {
      step: '04',
      icon: BarChart3,
      title: 'Scoring Engine',
      desc: 'A weighted composite score (0–100) is computed: 40% skill match, 30% ATS readiness, 20% keyword relevance, 10% structure & clarity.',
    },
    {
      step: '05',
      icon: Lightbulb,
      title: 'Improvement Suggestions',
      desc: 'Gemini AI generates contextual recommendations: missing keywords, weak phrasing, sections to expand, and skills to add.',
    },
    {
      step: '06',
      icon: CheckCircle2,
      title: 'Job Matching',
      desc: 'Your profile is cross-referenced with our job database to surface roles where you have the strongest fit.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden heritage-pattern">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Flame className="h-4 w-4 text-gold flame-flicker" />
              <span className="text-sm font-medium">{t('common.welcome')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 font-serif">
              {t('about.title')} <span className="text-primary">SRAI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>
      
      <div className="container"><OrnamentalDivider /></div>

      {/* Stats Section */}
      <section className="py-12 -mt-12 relative z-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="manuscript-card text-center hover-lift">
                <CardContent className="pt-6 pb-4">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Rocket className="h-4 w-4" />
                {t('about.projectOverview')}
              </div>
              
              <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight">
                Transform Your Career with <span className="text-primary">AI-Powered</span> Resume Analysis
              </h2>
              
              <div className="space-y-4 text-muted-foreground text-lg">
                <p className="leading-relaxed">{t('about.projectDesc1')}</p>
                <p className="leading-relaxed">{t('about.projectDesc2')}</p>
                <p className="leading-relaxed">{t('about.projectDesc3')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, label: t('about.forStudents'), value: t('about.forStudentsDesc'), gradient: 'from-blue-500/20 to-cyan-500/20' },
                { icon: Brain, label: t('about.aiPowered'), value: t('about.aiPoweredDesc'), gradient: 'from-purple-500/20 to-pink-500/20' },
                { icon: Target, label: t('about.atsOptimized'), value: t('about.atsOptimizedDesc'), gradient: 'from-green-500/20 to-emerald-500/20' },
                { icon: Users, label: t('about.userFriendly'), value: t('about.userFriendlyDesc'), gradient: 'from-orange-500/20 to-red-500/20' },
              ].map((item, index) => (
                <Card key={index} className={`glass-card hover-lift bg-gradient-to-br ${item.gradient} border-0`}>
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2">{item.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Features
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">{t('about.keyFeatures')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to give you the competitive edge in your job search
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="manuscript-card corner-ornament hover-lift group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* === Analysis Roadmap === */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 heritage-gradient opacity-60" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <div className="section-pill mx-auto">
              <BarChart3 className="h-3 w-3" />
              How It Works
            </div>
            <h2 className="text-4xl font-bold text-foreground mt-4 mb-4 font-serif">
              The Analysis Roadmap
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From the moment you upload your resume to the final score — here's exactly how SRAI evaluates and elevates your profile.
            </p>
          </div>

          {/* Roadmap timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* vertical saffron rail (desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-gradient-to-b from-primary/40 via-gold/50 to-primary/40 rounded-full" />

            <div className="space-y-10 md:space-y-16">
              {roadmap.map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div
                    key={item.step}
                    className="relative md:grid md:grid-cols-2 md:gap-10 items-center tile-reveal"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    {/* center dot (desktop) */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/40 items-center justify-center z-10 animate-pulse-glow" />

                    {/* card */}
                    <div className={`${isLeft ? 'md:pr-10 md:text-right' : 'md:col-start-2 md:pl-10'}`}>
                      <Card className="manuscript-card corner-ornament saffron-glow hover-lift transition-all">
                        <CardContent className="p-6">
                          <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'md:justify-end' : ''}`}>
                            <span className="section-pill">Step {item.step}</span>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/25 to-gold/15 border border-primary/30 flex items-center justify-center">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold font-serif text-foreground mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoring formula card */}
          <div className="max-w-3xl mx-auto mt-16">
            <Card className="manuscript-card corner-ornament saffron-glow tile-reveal">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="section-pill">Scoring Formula</span>
                    <CardTitle className="text-2xl font-serif mt-1">How Your Score Is Calculated</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="saffron-rule mb-5" />
                <div className="space-y-3">
                  {[
                    { label: 'Skill Match', weight: 40, desc: 'Alignment of your skills with target roles' },
                    { label: 'ATS Readiness', weight: 30, desc: 'Formatting, parse-ability, section order' },
                    { label: 'Keyword Relevance', weight: 20, desc: 'Industry & role-specific keyword coverage' },
                    { label: 'Structure & Clarity', weight: 10, desc: 'Readability, conciseness, action verbs' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground">{row.label}</span>
                          <span className="text-sm font-bold text-primary">{row.weight}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-1000"
                            style={{ width: `${row.weight * 2.5}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Code2 className="h-4 w-4" />
              Technology
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">{t('about.techStack')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with cutting-edge technologies for the best performance
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="manuscript-card hover-lift text-center group">
                <CardContent className="pt-8 pb-6">
                  <div className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${tech.color} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="h-full w-full rounded-2xl bg-card flex items-center justify-center">
                      <tech.icon className="h-9 w-9 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-foreground opacity-90" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gradient-orb gradient-orb-1 opacity-20" />
          <div className="gradient-orb gradient-orb-3 opacity-20" />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary-foreground/20 mb-8">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">{t('about.academic.title')}</h2>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">{t('about.academic.description')}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}