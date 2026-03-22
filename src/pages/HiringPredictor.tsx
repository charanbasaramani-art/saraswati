import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Loader2,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Shield,
  BarChart3,
  Gauge,
} from 'lucide-react';

interface PredictionData {
  hiringProbability: number;
  resumeStrength: number;
  skillMatchScore: number;
  atsCompatibility: number;
  softSkillScore: number;
  interviewPerformance: number;
  positiveFactors: string[];
  negativeFactors: string[];
  recommendations: string[];
  breakdown: {
    category: string;
    score: number;
    weight: number;
    contribution: number;
    icon: any;
  }[];
}

export default function HiringPredictor() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkExistingData();
    }
  }, [user]);

  const checkExistingData = async () => {
    try {
      const [resumeRes, atsRes, softSkillsRes] = await Promise.all([
        supabase.from('resumes').select('id').eq('user_id', user?.id).limit(1),
        supabase.from('ats_results').select('id').eq('user_id', user?.id).limit(1),
        supabase.from('soft_skill_analyses').select('id').eq('user_id', user?.id).limit(1),
      ]);
      setHasData(
        (resumeRes.data?.length ?? 0) > 0 ||
        (atsRes.data?.length ?? 0) > 0 ||
        (softSkillsRes.data?.length ?? 0) > 0
      );
    } catch (err) {
      console.error('Error checking data:', err);
    }
  };

  const calculatePrediction = async () => {
    setIsLoading(true);
    try {
      const [resumeRes, analysisRes, atsRes, softSkillsRes] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('resume_analyses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('ats_results').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('soft_skill_analyses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
      ]);

      const resumeStrength = analysisRes.data?.[0]?.overall_score || 65;
      const atsCompatibility = atsRes.data?.[0]?.ats_score || 60;
      const softSkillData = softSkillsRes.data?.[0];
      const softSkillScore = softSkillData
        ? Math.round(((softSkillData.communication_score || 0) + (softSkillData.teamwork_score || 0) + (softSkillData.leadership_score || 0) + (softSkillData.problem_solving_score || 0) + (softSkillData.adaptability_score || 0) + (softSkillData.confidence_score || 0)) / 6)
        : 70;
      const interviewPerformance = 72;
      const skillMatchScore = Math.round((resumeStrength + atsCompatibility) / 2);

      const weights = { resumeStrength: 0.25, skillMatchScore: 0.20, atsCompatibility: 0.20, softSkillScore: 0.15, interviewPerformance: 0.20 };
      const hiringProbability = Math.round(
        resumeStrength * weights.resumeStrength + skillMatchScore * weights.skillMatchScore + atsCompatibility * weights.atsCompatibility + softSkillScore * weights.softSkillScore + interviewPerformance * weights.interviewPerformance
      );

      const positiveFactors: string[] = [];
      const negativeFactors: string[] = [];
      const recommendations: string[] = [];

      if (resumeStrength >= 70) positiveFactors.push(t('hiringPredictor.factors.strongResume'));
      else negativeFactors.push(t('hiringPredictor.factors.weakResume'));
      if (atsCompatibility >= 75) positiveFactors.push(t('hiringPredictor.factors.goodAts'));
      else negativeFactors.push(t('hiringPredictor.factors.poorAts'));
      if (softSkillScore >= 70) positiveFactors.push(t('hiringPredictor.factors.goodSoftSkills'));
      else negativeFactors.push(t('hiringPredictor.factors.improveSoftSkills'));
      if (skillMatchScore >= 70) positiveFactors.push(t('hiringPredictor.factors.skillsMatch'));
      else recommendations.push(t('hiringPredictor.recommendations.addSkills'));
      if (interviewPerformance >= 75) positiveFactors.push(t('hiringPredictor.factors.strongInterview'));
      else recommendations.push(t('hiringPredictor.recommendations.practiceInterview'));
      if (resumeStrength < 70) recommendations.push(t('hiringPredictor.recommendations.improveResume'));
      if (atsCompatibility < 75) recommendations.push(t('hiringPredictor.recommendations.optimizeAts'));

      setPrediction({
        hiringProbability, resumeStrength, skillMatchScore, atsCompatibility, softSkillScore, interviewPerformance,
        positiveFactors, negativeFactors, recommendations,
        breakdown: [
          { category: t('hiringPredictor.categories.resume'), score: resumeStrength, weight: 25, contribution: Math.round(resumeStrength * 0.25), icon: FileText },
          { category: t('hiringPredictor.categories.skills'), score: skillMatchScore, weight: 20, contribution: Math.round(skillMatchScore * 0.20), icon: Zap },
          { category: t('hiringPredictor.categories.ats'), score: atsCompatibility, weight: 20, contribution: Math.round(atsCompatibility * 0.20), icon: Target },
          { category: t('hiringPredictor.categories.softSkills'), score: softSkillScore, weight: 15, contribution: Math.round(softSkillScore * 0.15), icon: Brain },
          { category: t('hiringPredictor.categories.interview'), score: interviewPerformance, weight: 20, contribution: Math.round(interviewPerformance * 0.20), icon: BarChart3 },
        ]
      });
    } catch (err) {
      console.error('Error calculating prediction:', err);
      toast({ title: t('common.error'), description: t('hiringPredictor.errorCalculating'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getProbabilityLevel = (p: number) => {
    if (p >= 80) return { label: t('hiringPredictor.levels.excellent'), color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'ring-emerald-500/20', badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (p >= 65) return { label: t('hiringPredictor.levels.high'), color: 'text-primary', bg: 'bg-primary', ring: 'ring-primary/20', badgeBg: 'bg-primary/15 text-primary border-primary/30' };
    if (p >= 45) return { label: t('hiringPredictor.levels.moderate'), color: 'text-amber-500', bg: 'bg-amber-500', ring: 'ring-amber-500/20', badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    return { label: t('hiringPredictor.levels.low'), color: 'text-destructive', bg: 'bg-destructive', ring: 'ring-destructive/20', badgeBg: 'bg-destructive/15 text-destructive border-destructive/30' };
  };

  if (authLoading) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-border/50 py-10 md:py-14">
          <div className="absolute inset-0 overflow-hidden">
            <div className="gradient-orb gradient-orb-1" />
            <div className="gradient-orb gradient-orb-2" />
          </div>
          <div className="container relative">
            <div className="max-w-2xl animate-fade-in-up">
              <Badge variant="outline" className="mb-4 gap-1.5 glass">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                {t('hiringPredictor.title')}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                {t('hiringPredictor.subtitle')}
              </h1>
              <p className="text-muted-foreground mt-3 text-base max-w-lg">
                {t('hiringPredictor.description')}
              </p>
            </div>
          </div>
        </section>

        <div className="container py-8 md:py-12">
          {!prediction ? (
            /* === INITIAL STATE === */
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
              {/* CTA Card */}
              <Card className="manuscript-card overflow-hidden relative">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-foreground/10 blur-3xl" />
                <CardContent className="p-8 md:p-12 text-center relative z-10">
                  <div className="mx-auto mb-6 relative">
                    <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse-glow">
                      <Gauge className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t('hiringPredictor.readyToPredict')}</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">{t('hiringPredictor.description')}</p>

                  {!hasData && (
                    <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-md mx-auto text-left">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-semibold">{t('hiringPredictor.noDataTitle')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('hiringPredictor.noDataDesc')}</p>
                    </div>
                  )}

                  <Button onClick={calculatePrediction} disabled={isLoading} size="lg" className="px-8 gap-2 text-base">
                    {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />{t('hiringPredictor.calculating')}</> : <><Zap className="h-5 w-5" />{t('hiringPredictor.calculate')}</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Feature cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: FileText, title: t('hiringPredictor.basedOn.resume'), desc: t('hiringPredictor.basedOn.resumeDesc') },
                  { icon: Target, title: t('hiringPredictor.basedOn.ats'), desc: t('hiringPredictor.basedOn.atsDesc') },
                  { icon: Brain, title: t('hiringPredictor.basedOn.skills'), desc: t('hiringPredictor.basedOn.skillsDesc') },
                ].map((item, i) => (
                  <Card key={i} className="manuscript-card">
                    <CardContent className="p-5">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* === RESULTS === */
            <div className="space-y-6 animate-fade-in-up">
              {/* Top: probability + breakdown grid */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Big probability display */}
                <Card className={`manuscript-card lg:col-span-5 overflow-hidden relative ${getProbabilityLevel(prediction.hiringProbability).ring} ring-2`}>
                  <div className={`absolute -top-20 -right-20 h-56 w-56 rounded-full ${getProbabilityLevel(prediction.hiringProbability).bg}/10 blur-3xl`} />
                  <CardContent className="p-8 relative z-10 flex flex-col items-center justify-center min-h-[340px]">
                    <Badge className={getProbabilityLevel(prediction.hiringProbability).badgeBg + ' mb-6'}>
                      {getProbabilityLevel(prediction.hiringProbability).label}
                    </Badge>

                    {/* Circular gauge */}
                    <div className="relative mb-6">
                      <svg className="w-48 h-48" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                        <circle
                          cx="100" cy="100" r="85" fill="none"
                          stroke={prediction.hiringProbability >= 80 ? 'hsl(142 76% 36%)' : prediction.hiringProbability >= 65 ? 'hsl(var(--primary))' : prediction.hiringProbability >= 45 ? 'hsl(38 92% 50%)' : 'hsl(var(--destructive))'}
                          strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 85}
                          strokeDashoffset={2 * Math.PI * 85 * (1 - prediction.hiringProbability / 100)}
                          transform="rotate(-90 100 100)"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${getProbabilityLevel(prediction.hiringProbability).color}`}>
                          {prediction.hiringProbability}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium mt-1">/ 100</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground text-center max-w-xs">{t('hiringPredictor.probabilityDesc')}</p>

                    <Button onClick={calculatePrediction} variant="ghost" size="sm" className="mt-4 gap-2" disabled={isLoading}>
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      {t('hiringPredictor.recalculate')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Breakdown cards */}
                <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                  {prediction.breakdown.map((item, i) => {
                    const Icon = item.icon;
                    const scoreColor = item.score >= 75 ? 'text-emerald-500' : item.score >= 50 ? 'text-amber-500' : 'text-destructive';
                    return (
                      <Card key={i} className="manuscript-card group hover:border-primary/20 transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{item.category}</p>
                                <p className="text-[11px] text-muted-foreground">{t('hiringPredictor.weight')}: {item.weight}%</p>
                              </div>
                            </div>
                            <span className={`text-2xl font-bold ${scoreColor}`}>{item.score}</span>
                          </div>
                          <Progress value={item.score} className="h-1.5" />
                          <div className="flex justify-between mt-2">
                            <span className="text-[11px] text-muted-foreground">{t('hiringPredictor.scoreContribution')}</span>
                            <span className="text-[11px] font-medium text-foreground">+{item.contribution}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Summary mini card */}
                  <Card className="manuscript-card sm:col-span-2 border-primary/20">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{t('hiringPredictor.probabilityBreakdown')}</p>
                          <p className="text-xs text-muted-foreground">
                            {prediction.breakdown.map(b => `${b.category}: ${b.contribution}`).join(' + ')} = {prediction.hiringProbability}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Factors row */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="manuscript-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </div>
                      {t('hiringPredictor.insights.increasing')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {prediction.positiveFactors.map((factor, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="manuscript-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      </div>
                      {t('hiringPredictor.insights.decreasing')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {prediction.negativeFactors.map((factor, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {prediction.recommendations.length > 0 && (
                <Card className="manuscript-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      {t('hiringPredictor.recommendations.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {prediction.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                          <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button onClick={() => navigate('/mock-interview')} variant="outline" className="glass gap-2">
                  {t('nav.mockInterview')} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={() => navigate('/resume-improvements')} variant="outline" className="glass gap-2">
                  {t('nav.improvements')} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={() => navigate('/ats-simulator')} className="gap-2">
                  {t('nav.atsSimulator')} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
