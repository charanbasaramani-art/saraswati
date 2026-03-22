import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';

interface WeakSection {
  section: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
}

interface BulletImprovement {
  original: string;
  improved: string;
  explanation: string;
}

interface GrammarIssue {
  text: string;
  correction: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'formatting';
}

interface Recommendation {
  category: 'content' | 'formatting' | 'keywords' | 'structure';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface ImprovementData {
  weakSections: WeakSection[];
  bulletPointImprovements: BulletImprovement[];
  grammarIssues: GrammarIssue[];
  recommendations: Recommendation[];
  overallScore: number;
  summary: string;
}

export default function ResumeImprovements() {
  const { t, i18n } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [improvements, setImprovements] = useState<ImprovementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeContent, setResumeContent] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!user) return;
      
      const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (resumes && resumes.length > 0) {
        setHasResume(true);
        const parsedData = resumes[0].parsed_data as any;
        // Create resume content string from parsed data
        const content = JSON.stringify(parsedData, null, 2);
        setResumeContent(content);
      }
    };

    fetchResumeData();
  }, [user]);

  const analyzeResume = async () => {
    if (!hasResume) {
      toast.error(t('improvements.noResume'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('improve-resume', {
        body: { 
          resumeContent,
          language: i18n.language
        }
      });

      if (error) throw error;
      
      setImprovements(data);
      toast.success('Analysis complete!');
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast.error(error.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      default: return null;
    }
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('improvements.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('improvements.subtitle')}
          </p>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            onClick={analyzeResume}
            disabled={loading || !hasResume}
            className="btn-plaque gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('improvements.analyzing')}
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                {t('improvements.analyze')}
              </>
            )}
          </Button>
        </div>

        {!hasResume && (
          <Card className="glass-card max-w-md mx-auto mb-8">
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('improvements.noResume')}</p>
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                {t('common.upload')} Resume
              </Button>
            </CardContent>
          </Card>
        )}

        {improvements && (
          <div className="space-y-8">
            {/* Overall Score Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t('improvements.overallScore')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <Progress value={improvements.overallScore} className="h-4" />
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {improvements.overallScore}/100
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">{improvements.summary}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="weak" className="w-full">
              <TabsList className="glass w-full justify-start overflow-x-auto">
                <TabsTrigger value="weak">{t('improvements.weakSections')}</TabsTrigger>
                <TabsTrigger value="bullets">{t('improvements.bulletPoints')}</TabsTrigger>
                <TabsTrigger value="grammar">{t('improvements.grammarIssues')}</TabsTrigger>
                <TabsTrigger value="recommendations">{t('improvements.recommendations')}</TabsTrigger>
              </TabsList>

              {/* Weak Sections */}
              <TabsContent value="weak" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {improvements.weakSections.map((section, index) => (
                    <Card key={index} className="manuscript-card corner-ornament hover-lift">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{section.section}</CardTitle>
                          <Badge className={getSeverityColor(section.severity)}>
                            {t(`improvements.severity.${section.severity}`)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{section.issue}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Bullet Point Improvements */}
              <TabsContent value="bullets" className="mt-6">
                <div className="space-y-4">
                  {improvements.bulletPointImprovements.map((item, index) => (
                    <Card key={index} className="manuscript-card corner-ornament hover-lift">
                      <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="text-sm font-medium text-red-400 mb-2">
                              {t('improvements.before')}
                            </div>
                            <p className="text-sm">{item.original}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="text-sm font-medium text-green-400 mb-2">
                              {t('improvements.after')}
                            </div>
                            <p className="text-sm">{item.improved}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                          <Lightbulb className="h-4 w-4 mt-0.5 text-amber-400" />
                          {item.explanation}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Grammar Issues */}
              <TabsContent value="grammar" className="mt-6">
                <div className="space-y-4">
                  {improvements.grammarIssues.length > 0 ? (
                    improvements.grammarIssues.map((issue, index) => (
                      <Card key={index} className="manuscript-card corner-ornament hover-lift">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="capitalize">
                              {issue.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <span className="line-through text-red-400">{issue.text}</span>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <span className="text-green-400">{issue.correction}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="glass-card">
                      <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                        <p className="text-muted-foreground">No grammar issues detected!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Recommendations */}
              <TabsContent value="recommendations" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {improvements.recommendations.map((rec, index) => (
                    <Card key={index} className="manuscript-card corner-ornament hover-lift">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(rec.priority)}
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {rec.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{rec.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!improvements && hasResume && !loading && (
          <div className="text-center text-muted-foreground py-12">
            <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Analyze Resume" to get improvement suggestions</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
