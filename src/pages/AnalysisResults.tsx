import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Lightbulb,
  FileText,
  Briefcase,
  Loader2
} from 'lucide-react';

interface AnalysisData {
  id: string;
  resume_id: string;
  overall_score: number;
  ats_score: number | null;
  skill_analysis: {
    detected_skills?: string[];
    missing_skills?: string[];
    skill_categories?: Record<string, string[]>;
  } | null;
  improvement_suggestions: {
    suggestions?: string[];
    priority_improvements?: string[];
  } | null;
  keyword_optimization: {
    keywords_found?: string[];
    keywords_missing?: string[];
    optimization_tips?: string[];
  } | null;
  job_matches: {
    matches?: Array<{
      job_title: string;
      company: string;
      match_percentage: number;
    }>;
  } | null;
  created_at: string;
}

export default function AnalysisResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchAnalysis();
    }
  }, [user, id]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setAnalysis(data as unknown as AnalysisData);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Analysis Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The analysis you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Layout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Resume Analysis Results</h1>
          <p className="text-muted-foreground mt-1">
            Detailed AI analysis of your resume
          </p>
        </div>

        {/* Score Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={analysis.overall_score} 
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">ATS Compatibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${getScoreColor(analysis.ats_score || 0)}`}>
                  {analysis.ats_score || '--'}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={analysis.ats_score || 0} 
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">ATS friendly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Skills Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-primary">
                  {analysis.skill_analysis?.detected_skills?.length || 0}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Skills Found</p>
                  <p className="text-xs text-muted-foreground">
                    {analysis.skill_analysis?.missing_skills?.length || 0} suggested to add
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Skills Analysis */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skills Analysis
              </CardTitle>
              <CardDescription>Skills identified in your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Detected Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skill_analysis?.detected_skills?.length ? (
                    analysis.skill_analysis.detected_skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills detected</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Suggested Skills to Add
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skill_analysis?.missing_skills?.length ? (
                    analysis.skill_analysis.missing_skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No suggestions</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Improvement Suggestions */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Improvement Suggestions
              </CardTitle>
              <CardDescription>AI-powered recommendations to improve your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.improvement_suggestions?.suggestions?.length ? (
                  analysis.improvement_suggestions.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{suggestion}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No improvement suggestions available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keyword Optimization */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                ATS Keyword Optimization
              </CardTitle>
              <CardDescription>Keywords for better ATS compatibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Keywords Found</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyword_optimization?.keywords_found?.length ? (
                    analysis.keyword_optimization.keywords_found.map((keyword, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No keywords found</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Recommended Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyword_optimization?.keywords_missing?.length ? (
                    analysis.keyword_optimization.keywords_missing.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="border-primary text-primary">
                        + {keyword}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recommendations</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Matches Preview */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Job Matches
                  </CardTitle>
                  <CardDescription>Jobs matching your profile</CardDescription>
                </div>
                <Link to="/jobs">
                  <Button variant="outline" size="sm">View All Jobs</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.job_matches?.matches?.length ? (
                  analysis.job_matches.matches.slice(0, 4).map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">{match.job_title}</p>
                        <p className="text-sm text-muted-foreground">{match.company}</p>
                      </div>
                      <Badge className={getScoreBg(match.match_percentage)}>
                        {match.match_percentage}% Match
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No job matches found</p>
                    <Link to="/jobs" className="text-primary hover:underline text-sm">
                      Browse all jobs
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Upload New Resume
            </Button>
          </Link>
          <Link to="/jobs">
            <Button>
              <Briefcase className="mr-2 h-4 w-4" />
              View Job Recommendations
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
