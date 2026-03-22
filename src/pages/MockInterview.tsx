import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useVoice } from '@/hooks/useVoice';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  SkipForward, 
  Clock, 
  MessageSquare,
  Volume2,
  VolumeX,
  Brain,
  Target,
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Loader2,
  Video,
  Send,
  RefreshCw
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'hr' | 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedTopics: string[];
}

interface InterviewResponse {
  questionId: string;
  answer: string;
  timeSpent: number;
  isVoice: boolean;
}

interface InterviewFeedback {
  overallScore: number;
  communicationScore: number;
  confidenceScore: number;
  relevanceScore: number;
  clarityScore: number;
  strengths: string[];
  weakAreas: string[];
  recommendations: string[];
  questionFeedback: {
    questionId: string;
    score: number;
    feedback: string;
  }[];
}

const INTERVIEW_TYPES = ['hr', 'technical', 'behavioral'] as const;
const SKILL_LEVELS = ['entry', 'mid', 'senior'] as const;

export default function MockInterview() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Interview state
  const [interviewType, setInterviewType] = useState<typeof INTERVIEW_TYPES[number]>('hr');
  const [skillLevel, setSkillLevel] = useState<typeof SKILL_LEVELS[number]>('entry');
  const [jobRole, setJobRole] = useState('');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  
  // Voice state
  const [useVoiceInput, setUseVoiceInput] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSubmitAnswerRef = useRef<() => void>(() => {});
  
  const { isListening, isSpeaking, isSupported, startListening, stopListening, speak, stopSpeaking } = useVoice({
    onResult: (transcript) => {
      setCurrentAnswer(prev => prev + ' ' + transcript);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchResumeData();
    }
  }, [user]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      handleSubmitAnswerRef.current();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, timeRemaining]);

  const fetchResumeData = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data && !error) {
        setResumeData(data.parsed_data);
      }
    } catch (err) {
      console.error('Error fetching resume:', err);
    }
  };

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mock-interview', {
        body: {
          action: 'generate_questions',
          interviewType,
          skillLevel,
          jobRole: jobRole || 'Software Developer',
          resumeData
        }
      });

      if (error) throw error;
      
      setQuestions(data.questions || generateFallbackQuestions());
      setIsInterviewStarted(true);
      setTimeRemaining(120);
      setIsTimerRunning(true);
      
      // Speak first question
      if (isSupported && data.questions?.[0]) {
        speak(data.questions[0].question);
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      // Use fallback questions
      setQuestions(generateFallbackQuestions());
      setIsInterviewStarted(true);
      setTimeRemaining(120);
      setIsTimerRunning(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackQuestions = (): InterviewQuestion[] => {
    const hrQuestions = [
      { id: '1', question: 'Tell me about yourself and your background.', category: 'hr' as const, difficulty: 'easy' as const, expectedTopics: ['experience', 'skills', 'goals'] },
      { id: '2', question: 'Why are you interested in this position?', category: 'hr' as const, difficulty: 'easy' as const, expectedTopics: ['motivation', 'company knowledge', 'career goals'] },
      { id: '3', question: 'Where do you see yourself in 5 years?', category: 'hr' as const, difficulty: 'medium' as const, expectedTopics: ['career growth', 'ambition', 'learning'] },
    ];
    
    const technicalQuestions = [
      { id: '4', question: 'Explain a challenging technical problem you solved recently.', category: 'technical' as const, difficulty: 'medium' as const, expectedTopics: ['problem-solving', 'technical skills', 'methodology'] },
      { id: '5', question: 'How do you approach debugging complex issues?', category: 'technical' as const, difficulty: 'medium' as const, expectedTopics: ['debugging', 'tools', 'systematic approach'] },
      { id: '6', question: 'Describe your experience with team collaboration tools.', category: 'technical' as const, difficulty: 'easy' as const, expectedTopics: ['tools', 'collaboration', 'communication'] },
    ];
    
    const behavioralQuestions = [
      { id: '7', question: 'Describe a time when you had to work under pressure.', category: 'behavioral' as const, difficulty: 'medium' as const, expectedTopics: ['stress management', 'prioritization', 'outcome'] },
      { id: '8', question: 'Tell me about a conflict you had with a colleague and how you resolved it.', category: 'behavioral' as const, difficulty: 'hard' as const, expectedTopics: ['conflict resolution', 'communication', 'empathy'] },
      { id: '9', question: 'Give an example of when you showed leadership.', category: 'behavioral' as const, difficulty: 'medium' as const, expectedTopics: ['leadership', 'initiative', 'results'] },
    ];

    switch (interviewType) {
      case 'hr': return hrQuestions;
      case 'technical': return technicalQuestions;
      case 'behavioral': return behavioralQuestions;
      default: return [...hrQuestions.slice(0, 2), ...technicalQuestions.slice(0, 2), ...behavioralQuestions.slice(0, 1)];
    }
  };

  const handleSubmitAnswer = useCallback(() => {
    if (!currentAnswer.trim()) {
      toast({
        title: t('mockInterview.pleaseProvideAnswer'),
        variant: 'destructive'
      });
      return;
    }

    const response: InterviewResponse = {
      questionId: questions[currentQuestionIndex].id,
      answer: currentAnswer,
      timeSpent: 120 - timeRemaining,
      isVoice: useVoiceInput
    };

    setResponses(prev => [...prev, response]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setTimeRemaining(120);
      
      // Speak next question
      if (isSupported) {
        speak(questions[currentQuestionIndex + 1].question);
      }
    } else {
      completeInterview([...responses, response]);
    }
  }, [currentAnswer, questions, currentQuestionIndex, timeRemaining, useVoiceInput, isSupported, speak, responses, t, toast]);

  // Update ref for timer effect
  handleSubmitAnswerRef.current = handleSubmitAnswer;

  const completeInterview = async (allResponses: InterviewResponse[]) => {
    setIsTimerRunning(false);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('mock-interview', {
        body: {
          action: 'analyze_responses',
          questions,
          responses: allResponses,
          interviewType,
          skillLevel
        }
      });

      if (error) throw error;
      
      setFeedback(data.feedback || generateFallbackFeedback(allResponses));
    } catch (err) {
      console.error('Error analyzing responses:', err);
      setFeedback(generateFallbackFeedback(allResponses));
    } finally {
      setIsLoading(false);
      setIsInterviewCompleted(true);
    }
  };

  const generateFallbackFeedback = (allResponses: InterviewResponse[]): InterviewFeedback => {
    const avgLength = allResponses.reduce((acc, r) => acc + r.answer.length, 0) / allResponses.length;
    const avgTime = allResponses.reduce((acc, r) => acc + r.timeSpent, 0) / allResponses.length;
    
    const overallScore = Math.min(85, Math.max(45, 50 + (avgLength / 20) + (avgTime / 10)));
    
    return {
      overallScore: Math.round(overallScore),
      communicationScore: Math.round(overallScore * 0.9),
      confidenceScore: Math.round(overallScore * 0.85),
      relevanceScore: Math.round(overallScore * 0.95),
      clarityScore: Math.round(overallScore * 0.88),
      strengths: [
        'Good response structure',
        'Demonstrates relevant experience',
        'Clear communication style'
      ],
      weakAreas: [
        'Could provide more specific examples',
        'Consider using STAR method for behavioral questions'
      ],
      recommendations: [
        'Practice with more technical scenarios',
        'Prepare specific examples from past experience',
        'Work on concise but comprehensive answers'
      ],
      questionFeedback: allResponses.map((r, i) => ({
        questionId: r.questionId,
        score: Math.round(Math.random() * 30 + 60),
        feedback: 'Good attempt. Consider elaborating more on specific outcomes.'
      }))
    };
  };

  const resetInterview = () => {
    setIsInterviewStarted(false);
    setIsInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setResponses([]);
    setCurrentAnswer('');
    setFeedback(null);
    setTimeRemaining(120);
    setIsTimerRunning(false);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
    setUseVoiceInput(!useVoiceInput);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hr': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'technical': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'behavioral': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
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

  const radarData = feedback ? [
    { skill: t('mockInterview.feedback.communication'), value: feedback.communicationScore, fullMark: 100 },
    { skill: t('mockInterview.feedback.confidence'), value: feedback.confidenceScore, fullMark: 100 },
    { skill: t('mockInterview.feedback.relevance'), value: feedback.relevanceScore, fullMark: 100 },
    { skill: t('mockInterview.feedback.clarity'), value: feedback.clarityScore, fullMark: 100 },
  ] : [];

  const barData = feedback?.questionFeedback.map((qf, i) => ({
    name: `Q${i + 1}`,
    score: qf.score,
    fill: qf.score >= 80 ? 'hsl(var(--chart-1))' : qf.score >= 60 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'
  })) || [];

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
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t('mockInterview.title')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t('mockInterview.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {/* Setup Phase */}
          {!isInterviewStarted && !isInterviewCompleted && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Configuration */}
              <Card className="manuscript-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {t('mockInterview.configure')}
                  </CardTitle>
                  <CardDescription>
                    {t('mockInterview.configureDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('mockInterview.interviewType')}</label>
                    <Select value={interviewType} onValueChange={(v) => setInterviewType(v as any)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">{t('mockInterview.types.hr')}</SelectItem>
                        <SelectItem value="technical">{t('mockInterview.types.technical')}</SelectItem>
                        <SelectItem value="behavioral">{t('mockInterview.types.behavioral')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('mockInterview.skillLevel')}</label>
                    <Select value={skillLevel} onValueChange={(v) => setSkillLevel(v as any)}>
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">{t('mockInterview.levels.entry')}</SelectItem>
                        <SelectItem value="mid">{t('mockInterview.levels.mid')}</SelectItem>
                        <SelectItem value="senior">{t('mockInterview.levels.senior')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('mockInterview.jobRole')}</label>
                    <input
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder={t('mockInterview.jobRolePlaceholder')}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <Button 
                    onClick={startInterview} 
                    className="w-full btn-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('mockInterview.preparing')}
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {t('mockInterview.startInterview')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="manuscript-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {t('mockInterview.tips.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[
                      t('mockInterview.tips.tip1'),
                      t('mockInterview.tips.tip2'),
                      t('mockInterview.tips.tip3'),
                      t('mockInterview.tips.tip4'),
                      t('mockInterview.tips.tip5'),
                    ].map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Interview Phase */}
          {isInterviewStarted && !isInterviewCompleted && questions.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Progress */}
              <Card className="manuscript-card">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {t('mockInterview.question')} {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 ${timeRemaining <= 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        <Clock className="h-4 w-4" />
                        <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                      </div>
                      <Badge className={getCategoryColor(questions[currentQuestionIndex].category)}>
                        {t(`mockInterview.types.${questions[currentQuestionIndex].category}`)}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
                </CardContent>
              </Card>

              {/* Question Card */}
              <Card className="manuscript-card border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium ${getDifficultyColor(questions[currentQuestionIndex].difficulty)}`}>
                          {t(`mockInterview.difficulty.${questions[currentQuestionIndex].difficulty}`)}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {questions[currentQuestionIndex].question}
                      </h2>
                    </div>
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">{t('mockInterview.yourAnswer')}</label>
                      <div className="flex items-center gap-2">
                        {isSupported && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleVoiceInput}
                            className={isListening ? 'border-primary bg-primary/10' : ''}
                          >
                            {isListening ? (
                              <>
                                <MicOff className="mr-1 h-4 w-4" />
                                {t('mockInterview.stopRecording')}
                              </>
                            ) : (
                              <>
                                <Mic className="mr-1 h-4 w-4" />
                                {t('mockInterview.useVoice')}
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => isSpeaking ? stopSpeaking() : speak(questions[currentQuestionIndex].question)}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={t('mockInterview.answerPlaceholder')}
                      className="min-h-[200px] glass"
                    />

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSubmitAnswer}
                        className="flex-1 btn-glow"
                        disabled={!currentAnswer.trim()}
                      >
                        {currentQuestionIndex < questions.length - 1 ? (
                          <>
                            <SkipForward className="mr-2 h-4 w-4" />
                            {t('mockInterview.nextQuestion')}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {t('mockInterview.finishInterview')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Phase */}
          {isInterviewCompleted && feedback && (
            <div className="space-y-8">
              {/* Overall Score */}
              <Card className="manuscript-card border-primary/20">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4">{t('mockInterview.feedback.title')}</h2>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-40 h-40">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 70}
                          strokeDashoffset={2 * Math.PI * 70 * (1 - feedback.overallScore / 100)}
                          transform="rotate(-90 80 80)"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-primary">{feedback.overallScore}</span>
                        <span className="text-sm text-muted-foreground">{t('mockInterview.feedback.outOf100')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: t('mockInterview.feedback.communication'), value: feedback.communicationScore, icon: MessageSquare },
                      { label: t('mockInterview.feedback.confidence'), value: feedback.confidenceScore, icon: TrendingUp },
                      { label: t('mockInterview.feedback.relevance'), value: feedback.relevanceScore, icon: Target },
                      { label: t('mockInterview.feedback.clarity'), value: feedback.clarityScore, icon: Sparkles },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-4 rounded-xl bg-card/50 border border-border">
                        <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold text-foreground">{item.value}%</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="manuscript-card">
                  <CardHeader>
                    <CardTitle>{t('mockInterview.feedback.skillsRadar')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="manuscript-card">
                  <CardHeader>
                    <CardTitle>{t('mockInterview.feedback.questionScores')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="manuscript-card border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle2 className="h-5 w-5" />
                      {t('mockInterview.feedback.strengths')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedback.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="manuscript-card border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-500">
                      <XCircle className="h-5 w-5" />
                      {t('mockInterview.feedback.weakAreas')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedback.weakAreas.map((area, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <XCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="manuscript-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {t('mockInterview.feedback.recommendations')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {feedback.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button onClick={resetInterview} variant="outline" className="glass">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('mockInterview.tryAgain')}
                </Button>
                <Button onClick={() => navigate('/hiring-predictor')} className="btn-glow">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t('mockInterview.checkHiringChance')}
                </Button>
              </div>
            </div>
          )}

          {/* Loading State for Analysis */}
          {isLoading && isInterviewStarted && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">{t('mockInterview.analyzing')}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
