import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { OrnamentalDivider } from '@/components/OrnamentalDivider';
import {
  Upload, FileText, Brain, Briefcase, TrendingUp, Clock, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, Sparkles, Target, Users, Zap, BarChart3, Video, ArrowUpRight, Activity, Flame,
} from 'lucide-react';
import { ResumeUpload } from '@/components/dashboard/ResumeUpload';
import sraiLogo from '@/assets/srai-logo.png';

interface Resume { id: string; file_name: string; created_at: string; parsed_data: unknown; }
interface Analysis { id: string; resume_id: string; overall_score: number; skill_analysis: any; created_at: string; }

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: resumeData } = await supabase.from('resumes').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      const { data: analysisData } = await supabase.from('resume_analyses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      setResumes(resumeData || []);
      setAnalyses(analysisData || []);
    } catch (error) { console.error('Error fetching data:', error); }
    finally { setIsLoading(false); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const latestResume = resumes[0];
  const latestAnalysis = analyses[0];
  const overallScore = latestAnalysis?.overall_score || 0;
  const skillsCount = latestAnalysis?.skill_analysis?.detected_skills?.length || 0;

  const tools = [
    { icon: Target, label: t('dashboard.quickActions.atsCheck'), href: '/ats-simulator', desc: 'Test ATS compatibility', gradient: 'from-primary/20 to-primary/5' },
    { icon: Brain, label: t('dashboard.quickActions.softSkills'), href: '/soft-skills', desc: 'Personality analysis', gradient: 'from-peacock/20 to-peacock/5' },
    { icon: Video, label: t('nav.mockInterview'), href: '/mock-interview', desc: 'Practice interviews', gradient: 'from-lotus/20 to-lotus/5' },
    { icon: TrendingUp, label: t('nav.hiringPredictor'), href: '/hiring-predictor', desc: 'Predict hiring chances', gradient: 'from-gold/20 to-gold/5' },
    { icon: Zap, label: t('dashboard.quickActions.improve'), href: '/resume-improvements', desc: 'AI suggestions', gradient: 'from-bronze/20 to-bronze/5' },
    { icon: Briefcase, label: t('dashboard.quickActions.findJobs'), href: '/jobs', desc: 'Browse opportunities', gradient: 'from-peacock/20 to-peacock/5' },
  ];

  return (
    <Layout showFooter={false}>
      <div className="container py-6 md:py-10 space-y-8 relative parchment-bg min-h-screen">
        {/* Hero Greeting */}
        <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-card/90 via-card/60 to-gold-muted/30 backdrop-blur-md p-6 md:p-10 animate-fade-in-up shadow-lg">
          {/* decorative orbs */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0 group">
                <div className="absolute inset-0 rounded-2xl bg-gold/30 blur-xl group-hover:bg-gold/50 transition-all duration-500" />
                <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-background/70 border border-gold/30 flex items-center justify-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                  <img src={sraiLogo} alt="SRAI" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-muted border border-gold/30 text-foreground text-xs font-semibold mb-2">
                  <Flame className="h-3 w-3 text-gold flame-flicker" />
                  Welcome to SRAI
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight font-serif leading-tight">
                  Your Resume Sanctuary
                </h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl">
                  Analyze, refine and elevate your career manuscript with timeless wisdom and modern AI.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:flex-col md:items-end">
              <Link to="/interview-prep">
                <Button variant="outline" className="gap-2 glass border-gold/30 hover:border-gold/60 hover-lift w-full sm:w-auto">
                  <FileText className="h-4 w-4" />
                  Interview Prep
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link to="/ats-simulator">
                <Button className="gap-2 btn-plaque hover-lift w-full sm:w-auto">
                  <Target className="h-4 w-4" />
                  Run ATS Check
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <OrnamentalDivider className="animate-fade-in-up stagger-1" />

        {/* === BENTO GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)] relative z-10">

          {/* SCORE CARD */}
          <Card className="manuscript-card corner-ornament md:col-span-3 lg:col-span-4 md:row-span-2 flex flex-col justify-between overflow-hidden relative group animate-fade-in-up">
            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/8 blur-3xl group-hover:bg-gold/15 transition-all duration-700" />
            <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('common.overallScore')}</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-6xl md:text-7xl font-bold text-foreground leading-none font-serif">{overallScore || '--'}</span>
                  {overallScore > 0 && <span className="text-2xl text-muted-foreground mb-1">/100</span>}
                </div>
              </div>
              {overallScore > 0 && (
                <div className="mt-6 space-y-2">
                  <Progress value={overallScore} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('common.skillsDetected')}: {skillsCount}</span>
                    {latestAnalysis && (
                      <Link to={`/analysis/${latestAnalysis.id}`} className="text-primary hover:underline flex items-center gap-1">
                        {t('common.viewFullAnalysis')} <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
              {!overallScore && <p className="text-sm text-muted-foreground mt-4">{t('common.uploadFirstResume')}</p>}
            </CardContent>
          </Card>

          {/* STAT MINI CARDS */}
          <StatCard icon={FileText} value={resumes.length} label={t('dashboard.stats.resumes')} className="lg:col-span-2 md:col-span-3 animate-fade-in-up stagger-1" />
          <StatCard icon={Brain} value={analyses.length} label={t('dashboard.stats.analyses')} className="lg:col-span-2 md:col-span-3 animate-fade-in-up stagger-2" />
          <StatCard icon={BarChart3} value={skillsCount} label={t('common.skillsDetected')} className="lg:col-span-2 md:col-span-3 animate-fade-in-up stagger-3" />
          <Link to="/jobs" className="lg:col-span-2 md:col-span-3 animate-fade-in-up stagger-4">
            <Card className="manuscript-card h-full group cursor-pointer hover:border-gold/40 transition-all">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-gold/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground font-serif">{t('common.view')}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.stats.jobMatches')}</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* UPLOAD */}
          <div className="md:col-span-6 lg:col-span-7 animate-fade-in-up stagger-2">
            <ResumeUpload onUploadComplete={fetchData} />
          </div>

          {/* RECENT RESUMES */}
          <Card className="manuscript-card corner-ornament md:col-span-6 lg:col-span-5 animate-fade-in-up stagger-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-serif">
                <Clock className="h-4 w-4 text-gold" />
                {t('dashboard.recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{t('common.loadingResumes')}</p>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3 border border-gold/10">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{t('common.noResumesYet')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('common.uploadFirstResume')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resumes.slice(0, 4).map((resume) => {
                    const analysis = analyses.find(a => a.resume_id === resume.id);
                    return (
                      <div key={resume.id} className="flex items-center justify-between p-3 rounded-lg border border-gold/10 bg-muted/20 hover:bg-muted/40 transition-all group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-gold/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{resume.file_name}</p>
                            <p className="text-[11px] text-muted-foreground">{new Date(resume.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {analysis ? (
                            <>
                              <Badge variant="secondary" className="text-[11px] gap-1 bg-primary/10 text-primary border-none">
                                <CheckCircle2 className="h-3 w-3" />{analysis.overall_score}%
                              </Badge>
                              <Link to={`/analysis/${analysis.id}`}>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRight className="h-3.5 w-3.5" /></Button>
                              </Link>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-[11px] gap-1 animate-pulse border-gold/20">
                              <AlertCircle className="h-3 w-3" />{t('common.processing')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TOOLS GRID */}
          <div className="md:col-span-6 lg:col-span-12 animate-fade-in-up stagger-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-serif">Quick Tools</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {tools.map((tool, i) => (
                <Link key={i} to={tool.href}>
                  <Card className="manuscript-card h-full group cursor-pointer hover:border-gold/40 transition-all hover-lift corner-ornament">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center group-hover:scale-110 transition-transform border border-gold/10`}>
                        <tool.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{tool.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* LATEST ANALYSIS */}
          {latestAnalysis && (
            <Card className="manuscript-card corner-ornament md:col-span-6 lg:col-span-12 animate-fade-in-up stagger-5 overflow-hidden relative">
              <div className="absolute top-0 right-0 h-40 w-40 bg-gold/5 rounded-full blur-3xl" />
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/15">
                      <Sparkles className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground font-serif">{t('common.latestAnalysis')}</h3>
                      <p className="text-xs text-muted-foreground">{t('common.latestAnalysisDesc')}</p>
                    </div>
                  </div>
                  <Link to={`/analysis/${latestAnalysis.id}`}>
                    <Button size="sm" className="gap-2 btn-plaque">{t('common.viewFullAnalysis')} <ArrowRight className="h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <AnalysisStat icon={<TrendingUp className="h-5 w-5 text-primary" />} label={t('common.overallScore')} value={`${latestAnalysis.overall_score}%`} />
                  <AnalysisStat icon={<Brain className="h-5 w-5 text-peacock" />} label={t('common.skillsDetected')} value={String(skillsCount)} />
                  <AnalysisStat icon={<Clock className="h-5 w-5 text-gold" />} label={t('common.analysisDate')} value={new Date(latestAnalysis.created_at).toLocaleDateString()} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, value, label, className = '' }: { icon: any; value: number | string; label: string; className?: string }) {
  return (
    <Card className={`manuscript-card group ${className}`}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-gold/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground font-serif">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalysisStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-gold/10">
      <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center flex-shrink-0 border border-gold/10">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground font-serif">{value}</p>
      </div>
    </div>
  );
}
