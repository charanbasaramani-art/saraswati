import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  ChevronUp,
  ChevronDown,
  BarChart3,
  Gauge,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadialBarChart, RadialBar, Legend } from 'recharts';

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
      // Fetch all user data
      const [resumeRes, analysisRes, atsRes, softSkillsRes] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('resume_analyses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('ats_results').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('soft_skill_analyses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
      ]);

      // Calculate scores
      const resumeStrength = analysisRes.data?.[0]?.overall_score || 65;
      const atsCompatibility = atsRes.data?.[0]?.ats_score || 60;
      
      const softSkillData = softSkillsRes.data?.[0];
      const softSkillScore = softSkillData 
        ? Math.round((
            (softSkillData.communication_score || 0) +
            (softSkillData.teamwork_score || 0) +
            (softSkillData.leadership_score || 0) +
            (softSkillData.problem_solving_score || 0) +
            (softSkillData.adaptability_score || 0) +
            (softSkillData.confidence_score || 0)
          ) / 6)
        : 70;
      
      // Mock interview performance (would come from interview results)
      const interviewPerformance = 72;
      
      // Skill match score (would be calculated based on job requirements)
      const skillMatchScore = Math.round((resumeStrength + atsCompatibility) / 2);

      // Calculate weighted hiring probability
      const weights = {
        resumeStrength: 0.25,
        skillMatchScore: 0.20,
        atsCompatibility: 0.20,
        softSkillScore: 0.15,
        interviewPerformance: 0.20
      };

      const hiringProbability = Math.round(
        resumeStrength * weights.resumeStrength +
        skillMatchScore * weights.skillMatchScore +
        atsCompatibility * weights.atsCompatibility +
        softSkillScore * weights.softSkillScore +
        interviewPerformance * weights.interviewPerformance
      );

      // Generate factors and recommendations
      const positiveFactors = [];
      const negativeFactors = [];
      const recommendations = [];

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
        hiringProbability,
        resumeStrength,
        skillMatchScore,
        atsCompatibility,
        softSkillScore,
        interviewPerformance,
        positiveFactors,
        negativeFactors,
        recommendations,
        breakdown: [
          { category: t('hiringPredictor.categories.resume'), score: resumeStrength, weight: 25, contribution: Math.round(resumeStrength * 0.25) },
          { category: t('hiringPredictor.categories.skills'), score: skillMatchScore, weight: 20, contribution: Math.round(skillMatchScore * 0.20) },
          { category: t('hiringPredictor.categories.ats'), score: atsCompatibility, weight: 20, contribution: Math.round(atsCompatibility * 0.20) },
          { category: t('hiringPredictor.categories.softSkills'), score: softSkillScore, weight: 15, contribution: Math.round(softSkillScore * 0.15) },
          { category: t('hiringPredictor.categories.interview'), score: interviewPerformance, weight: 20, contribution: Math.round(interviewPerformance * 0.20) },
        ]
      });

    } catch (err) {
      console.error('Error calculating prediction:', err);
      toast({
        title: t('common.error'),
        description: t('hiringPredictor.errorCalculating'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return 'text-emerald-500';
    if (prob >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProbabilityBg = (prob: number) => {
    if (prob >= 75) return 'from-emerald-500/20 to-emerald-500/5';
    if (prob >= 50) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const getProbabilityLabel = (prob: number) => {
    if (prob >= 80) return t('hiringPredictor.levels.excellent');
    if (prob >= 70) return t('hiringPredictor.levels.high');
    if (prob >= 55) return t('hiringPredictor.levels.moderate');
    if (prob >= 40) return t('hiringPredictor.levels.low');
    return t('hiringPredictor.levels.veryLow');
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'hsl(var(--chart-1))';
    if (score >= 50) return 'hsl(var(--chart-2))';
    return 'hsl(var(--destructive))';
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const radialData = prediction ? [
    { name: t('hiringPredictor.categories.resume'), value: prediction.resumeStrength, fill: 'hsl(var(--chart-1))' },
    { name: t('hiringPredictor.categories.skills'), value: prediction.skillMatchScore, fill: 'hsl(var(--chart-2))' },
    { name: t('hiringPredictor.categories.ats'), value: prediction.atsCompatibility, fill: 'hsl(var(--chart-3))' },
    { name: t('hiringPredictor.categories.softSkills'), value: prediction.softSkillScore, fill: 'hsl(var(--chart-4))' },
    { name: t('hiringPredictor.categories.interview'), value: prediction.interviewPerformance, fill: 'hsl(var(--chart-5))' },
  ] : [];

  const pieData = prediction?.breakdown.map(b => ({
    name: b.category,
    value: b.contribution
  })) || [];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="gradient-orb gradient-orb-1" />
            <div className="gradient-orb gradient-orb-2" />
          </div>
          
          <div className="container relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t('hiringPredictor.title')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t('hiringPredictor.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {!prediction ? (
            /* Initial State */
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card text-center">
                <CardContent className="py-12">
                  <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{t('hiringPredictor.readyToPredict')}</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {t('hiringPredictor.description')}
                  </p>

                  {!hasData && (
                    <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">{t('hiringPredictor.noDataTitle')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('hiringPredictor.noDataDesc')}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={calculatePrediction} 
                    className="btn-glow"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('hiringPredictor.calculating')}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        {t('hiringPredictor.calculate')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                {[
                  { icon: FileText, title: t('hiringPredictor.basedOn.resume'), desc: t('hiringPredictor.basedOn.resumeDesc') },
                  { icon: Target, title: t('hiringPredictor.basedOn.ats'), desc: t('hiringPredictor.basedOn.atsDesc') },
                  { icon: Brain, title: t('hiringPredictor.basedOn.skills'), desc: t('hiringPredictor.basedOn.skillsDesc') },
                ].map((item, i) => (
                  <Card key={i} className="glass-card">
                    <CardContent className="p-4">
                      <item.icon className="h-8 w-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Results */
            <div className="space-y-8">
              {/* Main Probability Card */}
              <Card className={`glass-card border-2 ${prediction.hiringProbability >= 75 ? 'border-emerald-500/30' : prediction.hiringProbability >= 50 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                      <Badge className={`mb-4 ${
                        prediction.hiringProbability >= 75 ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                        prediction.hiringProbability >= 50 ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                        'bg-red-500/20 text-red-500 border-red-500/30'
                      }`}>
                        {getProbabilityLabel(prediction.hiringProbability)}
                      </Badge>
                      <h2 className="text-2xl font-bold mb-2">{t('hiringPredictor.yourProbability')}</h2>
                      <p className="text-muted-foreground mb-6">
                        {t('hiringPredictor.probabilityDesc')}
                      </p>
                      <div className="flex items-center gap-4 justify-center md:justify-start">
                        <Button onClick={calculatePrediction} variant="outline" className="glass" disabled={isLoading}>
                          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                          {t('hiringPredictor.recalculate')}
                        </Button>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getProbabilityBg(prediction.hiringProbability)} rounded-3xl blur-3xl`} />
                      <div className="relative">
                        <svg className="w-56 h-56">
                          <circle
                            cx="112"
                            cy="112"
                            r="100"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="16"
                          />
                          <circle
                            cx="112"
                            cy="112"
                            r="100"
                            fill="none"
                            stroke={prediction.hiringProbability >= 75 ? 'hsl(142 76% 36%)' : prediction.hiringProbability >= 50 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 50%)'}
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 100}
                            strokeDashoffset={2 * Math.PI * 100 * (1 - prediction.hiringProbability / 100)}
                            transform="rotate(-90 112 112)"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-6xl font-bold ${getProbabilityColor(prediction.hiringProbability)}`}>
                            {prediction.hiringProbability}%
                          </span>
                          <span className="text-sm text-muted-foreground">{t('hiringPredictor.probability')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <div className="grid md:grid-cols-5 gap-4">
                {prediction.breakdown.map((item, i) => (
                  <Card key={i} className="glass-card">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold mb-1" style={{ color: getScoreColor(item.score) }}>
                        {item.score}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{item.category}</div>
                      <Progress value={item.score} className="h-1.5" />
                      <div className="text-xs text-muted-foreground mt-2">
                        {t('hiringPredictor.weight')}: {item.weight}%
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>{t('hiringPredictor.contributionBreakdown')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>{t('hiringPredictor.scoreComparison')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={prediction.breakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis type="category" dataKey="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                          {prediction.breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Factors */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-500">
                      <TrendingUp className="h-5 w-5" />
                      {t('hiringPredictor.positiveFactors')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {prediction.positiveFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5">
                          <ChevronUp className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-foreground">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card border-red-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <TrendingDown className="h-5 w-5" />
                      {t('hiringPredictor.negativeFactors')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {prediction.negativeFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                          <ChevronDown className="h-5 w-5 text-red-500 flex-shrink-0" />
                          <span className="text-foreground">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {prediction.recommendations.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {t('hiringPredictor.recommendations.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('hiringPredictor.recommendations.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {prediction.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={() => navigate('/mock-interview')} variant="outline" className="glass">
                  {t('hiringPredictor.practiceInterview')}
                </Button>
                <Button onClick={() => navigate('/resume-improvements')} variant="outline" className="glass">
                  {t('hiringPredictor.improveResume')}
                </Button>
                <Button onClick={() => navigate('/ats-simulator')} className="btn-glow">
                  {t('hiringPredictor.checkAts')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
