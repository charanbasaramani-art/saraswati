import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Brain, Lightbulb, Users, Target, Shield, Zap, Loader2, Sparkles, TrendingUp, Award, MessageSquare, Heart, Rocket, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface SoftSkillAnalysis {
  id: string;
  communication_score: number;
  leadership_score: number;
  teamwork_score: number;
  problem_solving_score: number;
  confidence_score: number;
  adaptability_score: number;
  personality_insights: {
    primary_traits: string[];
    work_style: string;
    communication_style: string;
    strengths: string[];
    areas_for_growth: string[];
  };
  hiring_suitability: string;
  recommendations: Array<{
    skill: string;
    current_level: string;
    suggestion: string;
  }>;
  created_at: string;
}

interface Resume {
  id: string;
  file_name: string;
  parsed_data: unknown;
}

const skillColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))'];

const skillInfo = [
  { key: 'communication', icon: MessageSquare, label: 'Communication', color: 'from-blue-500 to-cyan-500' },
  { key: 'leadership', icon: Target, label: 'Leadership', color: 'from-purple-500 to-pink-500' },
  { key: 'teamwork', icon: Users, label: 'Teamwork', color: 'from-green-500 to-emerald-500' },
  { key: 'problem_solving', icon: Lightbulb, label: 'Problem Solving', color: 'from-orange-500 to-amber-500' },
  { key: 'confidence', icon: Shield, label: 'Confidence', color: 'from-red-500 to-rose-500' },
  { key: 'adaptability', icon: Zap, label: 'Adaptability', color: 'from-indigo-500 to-violet-500' },
];

export default function SoftSkillAnalyzer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SoftSkillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previousAnalyses, setPreviousAnalyses] = useState<SoftSkillAnalysis[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchResumes();
      fetchPreviousAnalyses();
    }
  }, [user]);

  const fetchResumes = async () => {
    const { data } = await supabase
      .from('resumes')
      .select('id, file_name, parsed_data')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (data) setResumes(data);
    if (data && data.length > 0) setSelectedResume(data[0].id);
  };

  const fetchPreviousAnalyses = async () => {
    const { data } = await supabase
      .from('soft_skill_analyses')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) {
      const typedData = data.map(item => ({
        ...item,
        personality_insights: item.personality_insights as SoftSkillAnalysis['personality_insights'],
        recommendations: item.recommendations as SoftSkillAnalysis['recommendations']
      }));
      setPreviousAnalyses(typedData);
    }
  };

  const analyzeSkills = async () => {
    if (!selectedResume || !user) {
      toast.error('Please select a resume first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const resume = resumes.find(r => r.id === selectedResume);
      
      if (!resume?.parsed_data) {
        toast.error('Resume not yet analyzed. Please wait for the resume to be processed first.');
        setIsAnalyzing(false);
        return;
      }
      
      const resumeContent = typeof resume.parsed_data === 'string' 
        ? resume.parsed_data 
        : JSON.stringify(resume.parsed_data, null, 2);

      const { data, error } = await supabase.functions.invoke('analyze-soft-skills', {
        body: {
          resumeId: selectedResume,
          userId: user.id,
          resumeContent,
          conversationHistory: ''
        }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAnalysis(data.analysis);
      fetchPreviousAnalyses();
      toast.success('Soft skill analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze soft skills. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRadarData = () => {
    if (!analysis) return [];
    return [
      { skill: 'Communication', value: analysis.communication_score, fullMark: 100 },
      { skill: 'Leadership', value: analysis.leadership_score, fullMark: 100 },
      { skill: 'Teamwork', value: analysis.teamwork_score, fullMark: 100 },
      { skill: 'Problem Solving', value: analysis.problem_solving_score, fullMark: 100 },
      { skill: 'Confidence', value: analysis.confidence_score, fullMark: 100 },
      { skill: 'Adaptability', value: analysis.adaptability_score, fullMark: 100 },
    ];
  };

  const getBarData = () => {
    if (!analysis) return [];
    return [
      { name: 'Communication', score: analysis.communication_score },
      { name: 'Leadership', score: analysis.leadership_score },
      { name: 'Teamwork', score: analysis.teamwork_score },
      { name: 'Problem Solving', score: analysis.problem_solving_score },
      { name: 'Confidence', score: analysis.confidence_score },
      { name: 'Adaptability', score: analysis.adaptability_score },
    ];
  };

  const getOverallScore = () => {
    if (!analysis) return 0;
    return Math.round(
      (analysis.communication_score + analysis.leadership_score + analysis.teamwork_score +
       analysis.problem_solving_score + analysis.confidence_score + analysis.adaptability_score) / 6
    );
  };

  const getSuitabilityColor = () => {
    if (!analysis?.hiring_suitability) return 'bg-muted';
    if (analysis.hiring_suitability.toLowerCase().includes('high')) return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
    if (analysis.hiring_suitability.toLowerCase().includes('medium')) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered Analysis</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                {t('softSkills.title')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                {t('softSkills.subtitle')}
              </p>
            </div>
            
            <Card className="glass-card w-full lg:w-auto lg:min-w-[400px]">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Resume</label>
                    <select
                      value={selectedResume || ''}
                      onChange={(e) => setSelectedResume(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/50 focus:border-primary transition-colors"
                    >
                      {resumes.length === 0 ? (
                        <option value="">No resumes uploaded</option>
                      ) : (
                        resumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.file_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  <Button 
                    onClick={analyzeSkills} 
                    disabled={isAnalyzing || !selectedResume}
                    className="w-full h-12 text-base font-semibold btn-glow"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('softSkills.analyzing')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        {t('softSkills.analyze')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Main Content */}
        {analysis ? (
          <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
            {/* Overall Score Card */}
            <Card className="glass-card lg:col-span-2">
              <CardContent className="pt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full border-8 border-primary/20 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <div className="text-center">
                          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                            {getOverallScore()}
                          </span>
                          <span className="text-lg text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Overall Soft Skills Score</h2>
                      <Badge className={`${getSuitabilityColor()} px-4 py-2 text-sm`}>
                        {analysis.hiring_suitability}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {skillInfo.slice(0, 3).map((skill, i) => {
                      const score = analysis[`${skill.key}_score` as keyof SoftSkillAnalysis] as number;
                      return (
                        <div key={i} className="text-center">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${skill.color} p-0.5 mx-auto mb-2`}>
                            <div className="h-full w-full rounded-xl bg-card flex items-center justify-center">
                              <skill.icon className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <p className="text-lg font-bold text-foreground">{score}%</p>
                          <p className="text-xs text-muted-foreground">{skill.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  Skills Radar
                </CardTitle>
                <CardDescription>Visual representation of your soft skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarData()}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Personality Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-purple-500" />
                  </div>
                  Personality Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Primary Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.personality_insights?.primary_traits?.map((trait, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1.5 bg-primary/10 text-primary border-0">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Work Style</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.personality_insights?.work_style}</p>
                </div>
                
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Communication Style</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.personality_insights?.communication_style}</p>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBarData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px'
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                        {getBarData().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={skillColors[index % skillColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                  </div>
                  AI Recommendations
                </CardTitle>
                <CardDescription>Personalized suggestions to improve your weak areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations?.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{rec.skill}</span>
                        <Badge variant="outline" className="bg-muted/50">{rec.current_level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Growth Areas */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  Strengths & Areas for Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Your Strengths
                    </h4>
                    <div className="space-y-3">
                      {analysis.personality_insights?.strengths?.map((strength, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                          <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                          </div>
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Areas for Growth
                    </h4>
                    <div className="space-y-3">
                      {analysis.personality_insights?.areas_for_growth?.map((area, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">→</span>
                          </div>
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Empty State */
          <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
            {skillInfo.map((skill, index) => (
              <Card key={index} className="glass-card hover-lift">
                <CardContent className="pt-8 text-center">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${skill.color} p-0.5 mx-auto mb-4`}>
                    <div className="h-full w-full rounded-2xl bg-card flex items-center justify-center">
                      <skill.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{skill.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze your resume to see your {skill.label.toLowerCase()} score
                  </p>
                </CardContent>
              </Card>
            ))}

            <Card className="glass-card lg:col-span-3 mt-4">
              <CardContent className="py-16 text-center">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Discover Your Soft Skills?</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Select a resume above and click "Analyze Skills" to get detailed insights about your soft skills profile.
                </p>
                <Button 
                  onClick={analyzeSkills} 
                  disabled={isAnalyzing || !selectedResume}
                  size="lg"
                  className="btn-glow"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Previous Analyses */}
        {previousAnalyses.length > 0 && (
          <Card className="glass-card mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Previous Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {previousAnalyses.map((prev, i) => {
                  const avgScore = Math.round(
                    (prev.communication_score + prev.leadership_score + prev.teamwork_score +
                     prev.problem_solving_score + prev.confidence_score + prev.adaptability_score) / 6
                  );
                  return (
                    <div
                      key={prev.id}
                      onClick={() => setAnalysis(prev)}
                      className="p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <Badge className="bg-primary/20 text-primary border-0">{avgScore}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(prev.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}