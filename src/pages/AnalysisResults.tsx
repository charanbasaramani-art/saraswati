import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { OrnamentalDivider } from '@/components/OrnamentalDivider';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  Lightbulb,
  FileText,
  Briefcase,
  Loader2,
  Flame,
  Award,
  Sparkles,
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
  const { user, isLoading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnalysis();
    }
  }, [user, id]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('resume_analyses')
        .select('*')
        .eq('id', id);
      if (user?.id) query = query.eq('user_id', user.id);
      const { data, error } = await query.maybeSingle();

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
      <div className="min-h-screen flex items-center justify-center bg-background parchment-bg">
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
            <Button className="btn-plaque">
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
    if (score >= 60) return 'text-gold';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-gold';
    return 'bg-destructive';
  };

  return (
    <Layout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-primary diya-glow float-bob" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif">Resume Analysis</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            A structured breakdown of your resume — score, strengths, gaps, improvements, and ATS keywords.
          </p>
        </div>

        <OrnamentalDivider />

        {/* === SECTION 1: SCORE === */}
        <Section pill="01 · Score" title="Overall Performance" icon={<Award className="h-5 w-5" />}>
          <div className="grid gap-5 md:grid-cols-3">
            <ScoreTile label="Overall Score" value={analysis.overall_score} sub="out of 100" colorClass={getScoreColor(analysis.overall_score)} />
            <ScoreTile label="ATS Compatibility" value={analysis.ats_score || 0} sub="ATS friendly" colorClass={getScoreColor(analysis.ats_score || 0)} />
            <ScoreTile
              label="Skills Detected"
              value={analysis.skill_analysis?.detected_skills?.length || 0}
              sub={`${analysis.skill_analysis?.missing_skills?.length || 0} suggested to add`}
              colorClass="text-primary"
              maxValue={Math.max(20, (analysis.skill_analysis?.detected_skills?.length || 0))}
            />
          </div>
        </Section>

        {/* === SECTION 2: STRENGTHS === */}
        <Section pill="02 · Strengths" title="Detected Skills & Highlights" icon={<CheckCircle2 className="h-5 w-5" />} delay={0.05}>
          <div className="flex flex-wrap gap-2">
            {analysis.skill_analysis?.detected_skills?.length ? (
              analysis.skill_analysis.detected_skills.map((skill, index) => (
                <Badge
                  key={index}
                  className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors px-3 py-1"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No strengths detected yet.</p>
            )}
          </div>
        </Section>

        {/* === SECTION 3: SKILL GAPS === */}
        <Section pill="03 · Skill Gaps" title="Skills To Add" icon={<Target className="h-5 w-5" />} delay={0.1}>
          <div className="flex flex-wrap gap-2">
            {analysis.skill_analysis?.missing_skills?.length ? (
              analysis.skill_analysis.missing_skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-dashed border-primary/40 text-primary px-3 py-1"
                >
                  + {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skill gaps identified.</p>
            )}
          </div>
        </Section>

        {/* === SECTION 4: IMPROVEMENTS === */}
        <Section pill="04 · Improvements" title="AI Recommendations" icon={<Lightbulb className="h-5 w-5" />} delay={0.15}>
          <div className="grid gap-3 md:grid-cols-2">
            {analysis.improvement_suggestions?.suggestions?.length ? (
              analysis.improvement_suggestions.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4 md:col-span-2">
                No improvement suggestions available.
              </p>
            )}
          </div>
        </Section>

        {/* === SECTION 5: ATS KEYWORDS === */}
        <Section pill="05 · ATS Keywords" title="Applicant Tracking System Keywords" icon={<FileText className="h-5 w-5" />} delay={0.2}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Found in Resume
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keyword_optimization?.keywords_found?.length ? (
                  analysis.keyword_optimization.keywords_found.map((keyword, index) => (
                    <Badge key={index} className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/25">
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No keywords detected.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gold" /> Recommended To Add
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keyword_optimization?.keywords_missing?.length ? (
                  analysis.keyword_optimization.keywords_missing.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="border-dashed border-gold/50 text-foreground">
                      + {keyword}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recommendations.</p>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* === SECTION 6: JOB MATCHES === */}
        <Section pill="06 · Job Matches" title="Suggested Roles" icon={<Briefcase className="h-5 w-5" />} delay={0.25}>
          <div className="grid gap-3 md:grid-cols-2">
            {analysis.job_matches?.matches?.length ? (
              analysis.job_matches.matches.slice(0, 6).map((match, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                >
                  <div>
                    <p className="font-semibold text-foreground">{match.job_title}</p>
                    <p className="text-sm text-muted-foreground">{match.company}</p>
                  </div>
                  <Badge className={`${getScoreBg(match.match_percentage)} text-primary-foreground`}>
                    {match.match_percentage}%
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground md:col-span-2">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No job matches found</p>
                <Link to="/jobs" className="text-primary hover:underline text-sm">Browse all jobs</Link>
              </div>
            )}
          </div>
        </Section>

        {/* Actions */}
        <OrnamentalDivider className="my-10" />
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up">
          <Link to="/dashboard">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Upload New Resume
            </Button>
          </Link>
          <Link to="/jobs">
            <Button className="btn-plaque">
              <Briefcase className="mr-2 h-4 w-4" />
              View Job Recommendations
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function Section({
  pill,
  title,
  icon,
  children,
  delay = 0,
}: {
  pill: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="mt-8 tile-reveal"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="manuscript-card corner-ornament saffron-glow p-6 md:p-8 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              {icon}
            </div>
            <div>
              <span className="section-pill">{pill}</span>
              <h2 className="text-xl md:text-2xl font-bold font-serif text-foreground mt-1">{title}</h2>
            </div>
          </div>
        </div>
        <div className="saffron-rule mb-6" />
        {children}
      </div>
    </section>
  );
}

function ScoreTile({
  label,
  value,
  sub,
  colorClass,
  maxValue = 100,
}: {
  label: string;
  value: number;
  sub: string;
  colorClass: string;
  maxValue?: number;
}) {
  const pct = Math.min(100, Math.round((value / maxValue) * 100));
  return (
    <div className="relative p-5 rounded-xl bg-gradient-to-br from-primary/5 via-card to-gold/10 border border-primary/20 hover-lift">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex items-end gap-2 mt-3">
        <span className={`text-5xl font-bold font-serif ${colorClass}`}>{value || '--'}</span>
        <span className="text-sm text-muted-foreground mb-1">{maxValue === 100 ? '/100' : ''}</span>
      </div>
      <Progress value={pct} className="h-2 mt-4" />
      <p className="text-xs text-muted-foreground mt-2">{sub}</p>
    </div>
  );
}
