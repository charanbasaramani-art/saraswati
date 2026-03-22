import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  FileQuestion,
  BrainCircuit,
  Users,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: number;
  category: 'technical' | 'hr' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
  tip: string;
}

export default function InterviewPrep() {
  const { t, i18n } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

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
        const resume = resumes[0];
        const parsedData = resume.parsed_data as any;
        setResumeData({
          skills: parsedData?.skills || [],
          experience: parsedData?.experience || '',
          jobRole: parsedData?.jobRole || 'Software Developer'
        });
      }
    };

    fetchResumeData();
  }, [user]);

  const generateQuestions = async () => {
    if (!hasResume) {
      toast.error(t('interview.noResume'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { 
          resumeData,
          language: i18n.language
        }
      });

      if (error) throw error;
      
      if (data?.questions) {
        setQuestions(data.questions);
        toast.success('Questions generated successfully!');
      }
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (id: number) => {
    setExpandedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleTip = (id: number) => {
    setExpandedTips(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <BrainCircuit className="h-4 w-4" />;
      case 'hr': return <Users className="h-4 w-4" />;
      case 'behavioral': return <MessageSquare className="h-4 w-4" />;
      default: return <FileQuestion className="h-4 w-4" />;
    }
  };

  const filteredQuestions = questions.filter(q => {
    const categoryMatch = selectedCategory === 'all' || q.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

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
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 animate-fade-in-down">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">AI Interview Coach</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-animate">
            {t('interview.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('interview.subtitle')}
          </p>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Button
            size="lg"
            onClick={generateQuestions}
            disabled={loading || !hasResume}
            className="btn-glow gap-2 hover-scale animate-pulse-glow"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('interview.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {t('interview.generate')}
              </>
            )}
          </Button>
        </div>

        {!hasResume && (
          <Card className="manuscript-card max-w-md mx-auto mb-8 animate-fade-in-up">
            <CardContent className="pt-6 text-center">
              <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-bounce" />
              <p className="text-muted-foreground">{t('interview.noResume')}</p>
              <Button className="mt-4 hover-scale" onClick={() => navigate('/dashboard')}>
                {t('common.upload')} Resume
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {questions.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="glass">
                <TabsTrigger value="all">{t('interview.categories.all')}</TabsTrigger>
                <TabsTrigger value="technical">{t('interview.categories.technical')}</TabsTrigger>
                <TabsTrigger value="hr">{t('interview.categories.hr')}</TabsTrigger>
                <TabsTrigger value="behavioral">{t('interview.categories.behavioral')}</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <TabsList className="glass">
                <TabsTrigger value="all">{t('interview.difficulty.all')}</TabsTrigger>
                <TabsTrigger value="easy">{t('interview.difficulty.easy')}</TabsTrigger>
                <TabsTrigger value="medium">{t('interview.difficulty.medium')}</TabsTrigger>
                <TabsTrigger value="hard">{t('interview.difficulty.hard')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Questions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuestions.map((question, index) => (
            <Card key={question.id} className="manuscript-card corner-ornament hover-lift animate-fade-in-up group" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="flex items-center gap-1 capitalize group-hover:bg-primary/10 transition-colors">
                    {getCategoryIcon(question.category)}
                    {t(`interview.categories.${question.category}`)}
                  </Badge>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {t(`interview.difficulty.${question.difficulty}`)}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Answer Section */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAnswer(question.id)}
                    className="w-full justify-between text-primary hover:text-primary/80"
                  >
                    {expandedAnswers.has(question.id) ? t('common.hideAnswer') : t('common.showAnswer')}
                    {expandedAnswers.has(question.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedAnswers.has(question.id) && (
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm">
                      {question.answer}
                    </div>
                  )}
                </div>

                {/* Tip Section */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTip(question.id)}
                    className="w-full justify-between text-amber-500 hover:text-amber-400"
                  >
                    <span className="flex items-center gap-1">
                      <Lightbulb className="h-4 w-4" />
                      {expandedTips.has(question.id) ? t('common.hideTip') : t('common.showTip')}
                    </span>
                    {expandedTips.has(question.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedTips.has(question.id) && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                      {question.tip}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {questions.length === 0 && hasResume && !loading && (
          <div className="text-center text-muted-foreground py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Generate Questions" to get started</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
