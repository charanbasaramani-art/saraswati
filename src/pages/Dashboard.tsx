import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  FileText,
  Brain,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { ResumeUpload } from '@/components/dashboard/ResumeUpload';

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
  parsed_data: unknown;
}

interface Analysis {
  id: string;
  resume_id: string;
  overall_score: number;
  skill_analysis: any;
  created_at: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const { data: analysisData } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setResumes(resumeData || []);
      setAnalyses(analysisData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const latestResume = resumes[0];
  const latestAnalysis = analyses[0];

  const quickActions = [
    { icon: Target, label: 'ATS Check', href: '/ats-simulator', color: 'from-blue-500 to-cyan-500' },
    { icon: Brain, label: 'Soft Skills', href: '/soft-skills', color: 'from-purple-500 to-pink-500' },
    { icon: Briefcase, label: 'Find Jobs', href: '/jobs', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, label: 'Improve', href: '/resume-improvements', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <Layout showFooter={false}>
      {/* Header Section */}
      <section className="relative py-8 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-50" />
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm font-medium mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                Welcome back!
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t('nav.dashboard')}</h1>
              <p className="text-muted-foreground mt-1">{t('dashboard.uploadDesc')}</p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 glass hover:bg-primary/10 border-border/50"
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{resumes.length}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.stats.resumes')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Brain className="h-7 w-7 text-purple-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{analyses.length}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.stats.analyses')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {latestAnalysis?.overall_score || '--'}
                    {latestAnalysis && <span className="text-lg text-muted-foreground">%</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.stats.latestScore')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <Link to="/jobs" className="text-3xl font-bold text-foreground hover:text-primary transition-colors">
                    View
                  </Link>
                  <p className="text-sm text-muted-foreground">{t('dashboard.stats.jobMatches')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <ResumeUpload onUploadComplete={fetchData} />

          {/* Recent Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                {t('dashboard.recentActivity')}
              </CardTitle>
              <CardDescription>{t('dashboard.latestAnalysis')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">Loading your resumes...</p>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground mb-1">No resumes uploaded yet</p>
                  <p className="text-sm text-muted-foreground">Upload your first resume to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.slice(0, 3).map((resume, index) => {
                    const analysis = analyses.find(a => a.resume_id === resume.id);
                    return (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all group animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{resume.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {analysis ? (
                            <>
                              <Badge className="gap-1.5 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {analysis.overall_score}%
                              </Badge>
                              <Link to={`/analysis/${analysis.id}`}>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  View <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <Badge variant="outline" className="gap-1.5 animate-pulse">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Processing
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
        </div>

        {/* Latest Analysis Preview */}
        {latestAnalysis && (
          <Card className="glass-card mt-8 animate-fade-in">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Latest Analysis</CardTitle>
                    <CardDescription>Your most recent resume analysis results</CardDescription>
                  </div>
                </div>
                <Link to={`/analysis/${latestAnalysis.id}`}>
                  <Button className="btn-glow gap-2">
                    View Full Analysis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={latestAnalysis.overall_score} className="h-3" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                      {latestAnalysis.overall_score}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Skills Detected</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      {latestAnalysis.skill_analysis?.detected_skills?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Analysis Date</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      {new Date(latestAnalysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}