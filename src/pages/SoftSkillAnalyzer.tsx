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
import { Brain, Lightbulb, Users, Target, Shield, Zap, Loader2, Sparkles, TrendingUp, Award } from 'lucide-react';
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

const skillIcons: Record<string, React.ReactNode> = {
  communication: <Users className="h-5 w-5" />,
  leadership: <Target className="h-5 w-5" />,
  teamwork: <Users className="h-5 w-5" />,
  problem_solving: <Lightbulb className="h-5 w-5" />,
  confidence: <Shield className="h-5 w-5" />,
  adaptability: <Zap className="h-5 w-5" />,
};

const skillColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))'];

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
      const resumeContent = resume?.parsed_data ? JSON.stringify(resume.parsed_data) : 'Resume content not available';

      const { data, error } = await supabase.functions.invoke('analyze-soft-skills', {
        body: {
          resumeId: selectedResume,
          userId: user.id,
          resumeContent,
          conversationHistory: ''
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      fetchPreviousAnalyses();
      toast.success('Soft skill analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze soft skills');
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
    if (analysis.hiring_suitability.toLowerCase().includes('high')) return 'bg-green-500/20 text-green-600 dark:text-green-400';
    if (analysis.hiring_suitability.toLowerCase().includes('medium')) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-600 dark:text-red-400';
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Soft Skill & Personality Analyzer
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered analysis of your soft skills and personality traits
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedResume || ''}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-background"
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
            <Button 
              onClick={analyzeSkills} 
              disabled={isAnalyzing || !selectedResume}
              className="btn-glow"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Skills
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {analysis ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Radar Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Skills Radar
                </CardTitle>
                <CardDescription>Visual representation of your soft skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarData()}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
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

            {/* Overall Score & Hiring Suitability */}
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Overall Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <p className="text-4xl font-bold text-primary">{getOverallScore()}/100</p>
                    </div>
                    <div className="h-24 w-24 rounded-full border-4 border-primary flex items-center justify-center bg-primary/10">
                      <span className="text-2xl font-bold">{getOverallScore()}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Hiring Suitability</p>
                    <Badge className={`${getSuitabilityColor()} px-4 py-2 text-sm`}>
                      {analysis.hiring_suitability}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Personality Insights */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Personality Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Primary Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.personality_insights?.primary_traits?.map((trait, i) => (
                        <Badge key={i} variant="secondary">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Work Style</p>
                    <p className="text-sm">{analysis.personality_insights?.work_style}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Communication Style</p>
                    <p className="text-sm">{analysis.personality_insights?.communication_style}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBarData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
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
                  <Lightbulb className="h-5 w-5 text-primary" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Personalized suggestions to improve your weak areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations?.map((rec, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{rec.skill}</span>
                        <Badge variant="outline">{rec.current_level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Growth Areas */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Strengths & Areas for Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Strengths
                    </h4>
                    <div className="space-y-2">
                      {analysis.personality_insights?.strengths?.map((strength, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <span className="text-green-600 dark:text-green-400">✓</span>
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Areas for Growth
                    </h4>
                    <div className="space-y-2">
                      {analysis.personality_insights?.areas_for_growth?.map((area, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <span className="text-amber-600 dark:text-amber-400">→</span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Empty State */}
            <Card className="lg:col-span-2 glass-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analyze Your Soft Skills</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Select a resume and click "Analyze Skills" to get a comprehensive assessment of your soft skills and personality traits.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {Object.entries(skillIcons).map(([skill, icon]) => (
                    <Badge key={skill} variant="outline" className="px-3 py-1 flex items-center gap-1">
                      {icon}
                      {skill.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Previous Analyses */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Previous Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                {previousAnalyses.length > 0 ? (
                  <div className="space-y-3">
                    {previousAnalyses.map((prev) => {
                      const avgScore = Math.round(
                        (prev.communication_score + prev.leadership_score + prev.teamwork_score +
                         prev.problem_solving_score + prev.confidence_score + prev.adaptability_score) / 6
                      );
                      return (
                        <button
                          key={prev.id}
                          onClick={() => {
                            const typedPrev: SoftSkillAnalysis = {
                              ...prev,
                              personality_insights: prev.personality_insights as SoftSkillAnalysis['personality_insights'],
                              recommendations: prev.recommendations as SoftSkillAnalysis['recommendations']
                            };
                            setAnalysis(typedPrev);
                          }}
                          className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Score: {avgScore}/100</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(prev.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          <Progress value={avgScore} className="h-2 mt-2" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No previous analyses yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
