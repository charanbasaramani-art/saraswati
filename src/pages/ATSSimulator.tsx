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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileCheck, AlertTriangle, CheckCircle, XCircle, Zap, FileText, Building2, Target, Search } from 'lucide-react';
import { toast } from 'sonner';

interface ATSResult {
  id: string;
  company: string;
  ats_score: number;
  passed: boolean;
  keyword_relevance_score: number;
  formatting_score: number;
  skill_matching_score: number;
  missing_keywords: string[];
  optimization_suggestions: Array<{
    category: string;
    suggestion: string;
    priority: string;
  }>;
  created_at: string;
}

interface Resume {
  id: string;
  file_name: string;
  parsed_data: unknown;
}

const companies = [
  { id: 'Google', name: 'Google', logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', initials: 'G', color: 'from-blue-500 to-green-500' },
  { id: 'Amazon', name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png', initials: 'A', color: 'from-orange-500 to-yellow-500' },
  { id: 'Microsoft', name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png', initials: 'MS', color: 'from-blue-600 to-cyan-500' },
  { id: 'Meta', name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/200px-Meta_Platforms_Inc._logo.svg.png', initials: 'M', color: 'from-blue-500 to-indigo-600' },
  { id: 'Apple', name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/100px-Apple_logo_black.svg.png', initials: 'AP', color: 'from-gray-700 to-gray-500' },
  { id: 'Infosys', name: 'Infosys', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/200px-Infosys_logo.svg.png', initials: 'IN', color: 'from-blue-600 to-blue-400' },
  { id: 'TCS', name: 'TCS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/200px-Tata_Consultancy_Services_Logo.svg.png', initials: 'TCS', color: 'from-purple-600 to-pink-500' },
  { id: 'Wipro', name: 'Wipro', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/200px-Wipro_Primary_Logo_Color_RGB.svg.png', initials: 'W', color: 'from-green-600 to-teal-500' },
  { id: 'Accenture', name: 'Accenture', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/200px-Accenture.svg.png', initials: 'AC', color: 'from-purple-500 to-violet-600' },
  { id: 'IBM', name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/200px-IBM_logo.svg.png', initials: 'IBM', color: 'from-blue-700 to-blue-500' },
  { id: 'Cognizant', name: 'Cognizant', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Cognizant%27s_logo.svg/200px-Cognizant%27s_logo.svg.png', initials: 'CG', color: 'from-blue-500 to-cyan-400' },
  { id: 'Oracle', name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/200px-Oracle_logo.svg.png', initials: 'OR', color: 'from-red-600 to-red-400' },
  { id: 'HeteroLabs', name: 'Hetero Labs', logo: '', initials: 'HL', color: 'from-green-500 to-emerald-400' },
  { id: '247AI', name: '24/7 AI', logo: '', initials: '24', color: 'from-indigo-600 to-purple-500' },
  { id: 'Acmegrade', name: 'Acmegrade', logo: '', initials: 'AG', color: 'from-teal-500 to-cyan-400' },
  { id: 'WNS', name: 'WNS Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/WNS_Global_Services_Logo.svg/200px-WNS_Global_Services_Logo.svg.png', initials: 'WNS', color: 'from-blue-800 to-blue-600' },
  { id: 'Deloitte', name: 'Deloitte', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Deloitte.svg/200px-Deloitte.svg.png', initials: 'DL', color: 'from-green-700 to-green-500' },
  { id: 'Capgemini', name: 'Capgemini', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Capgemini_201x_logo.svg/200px-Capgemini_201x_logo.svg.png', initials: 'CG', color: 'from-blue-700 to-indigo-500' },
  { id: 'HCL', name: 'HCL Tech', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/HCL_Technologies_logo.svg/200px-HCL_Technologies_logo.svg.png', initials: 'HCL', color: 'from-blue-500 to-sky-400' },
  { id: 'TechMahindra', name: 'Tech Mahindra', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Tech_Mahindra_Logo.svg/200px-Tech_Mahindra_Logo.svg.png', initials: 'TM', color: 'from-red-600 to-pink-500' },
];

export default function ATSSimulator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('Google');
  const [result, setResult] = useState<ATSResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [previousResults, setPreviousResults] = useState<ATSResult[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchResumes();
      fetchPreviousResults();
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

  const fetchPreviousResults = async () => {
    const { data } = await supabase
      .from('ats_results')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      const typedData = data.map(item => ({
        ...item,
        missing_keywords: item.missing_keywords as string[],
        optimization_suggestions: item.optimization_suggestions as ATSResult['optimization_suggestions']
      }));
      setPreviousResults(typedData);
    }
  };

  const simulateATS = async () => {
    if (!selectedResume || !user) {
      toast.error('Please select a resume first');
      return;
    }

    setIsSimulating(true);
    try {
      const resume = resumes.find(r => r.id === selectedResume);
      
      // Check if resume has parsed data
      if (!resume?.parsed_data) {
        toast.error('Resume not yet analyzed. Please wait for the resume to be processed first.');
        setIsSimulating(false);
        return;
      }
      
      const resumeContent = typeof resume.parsed_data === 'string' 
        ? resume.parsed_data 
        : JSON.stringify(resume.parsed_data, null, 2);

      const { data, error } = await supabase.functions.invoke('ats-simulator', {
        body: {
          resumeId: selectedResume,
          userId: user.id,
          company: selectedCompany,
          resumeContent
        }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data.analysis);
      fetchPreviousResults();
      toast.success(`ATS simulation for ${selectedCompany} complete!`);
    } catch (error) {
      console.error('ATS simulation error:', error);
      toast.error('Failed to simulate ATS. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      default: return 'bg-muted';
    }
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
              <FileCheck className="h-8 w-8 text-primary" />
              {t('ats.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('ats.subtitle')}
            </p>
          </div>
        </div>

        {/* Company Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company.id)}
              className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedCompany === company.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`mb-2 h-12 w-12 rounded-lg ${company.logo ? 'bg-white' : `bg-gradient-to-br ${company.color}`} flex items-center justify-center overflow-hidden p-1.5`}>
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                ) : null}
                <span className={`${company.logo ? 'hidden' : ''} text-white font-bold text-sm`}>{company.initials}</span>
              </div>
              <p className="font-semibold">{company.name}</p>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedResume || ''}
            onChange={(e) => setSelectedResume(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-background flex-1 min-w-[200px]"
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
            onClick={simulateATS} 
            disabled={isSimulating || !selectedResume}
            size="lg"
            className="btn-glow"
          >
            {isSimulating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('ats.simulating')}
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                {t('ats.simulate')}
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Score Card */}
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selectedCompany} ATS Result
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="w-40 h-40">
                  <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="hsl(var(--muted))"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={result.passed ? 'hsl(var(--chart-1))' : 'hsl(var(--destructive))'}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(result.ats_score / 100) * 440} 440`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl font-bold">{result.ats_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Badge 
                  className={`text-lg px-6 py-2 ${
                    result.passed 
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  {result.passed ? (
                    <><CheckCircle className="mr-2 h-5 w-5" /> PASSED</>
                  ) : (
                    <><XCircle className="mr-2 h-5 w-5" /> FAILED</>
                  )}
                </Badge>
                
                <p className="text-sm text-muted-foreground text-center">
                  {result.passed 
                    ? 'Your resume meets the ATS requirements for this company!' 
                    : 'Your resume needs optimization to pass this company\'s ATS.'}
                </p>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Keyword Relevance</span>
                    <span className="text-sm font-medium">{result.keyword_relevance_score}%</span>
                  </div>
                  <Progress value={result.keyword_relevance_score} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Formatting</span>
                    <span className="text-sm font-medium">{result.formatting_score}%</span>
                  </div>
                  <Progress value={result.formatting_score} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Skill Matching</span>
                    <span className="text-sm font-medium">{result.skill_matching_score}%</span>
                  </div>
                  <Progress value={result.skill_matching_score} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Missing Keywords
                </CardTitle>
                <CardDescription>Add these keywords to improve your score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords?.slice(0, 10).map((keyword, i) => (
                    <Badge key={i} variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimization Suggestions */}
            <Card className="glass-card lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Optimization Suggestions
                </CardTitle>
                <CardDescription>Follow these recommendations to improve your ATS score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.optimization_suggestions?.map((suggestion, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{suggestion.category}</Badge>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm">{suggestion.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Previous Results / Empty State */}
        {!result && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 glass-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Simulate ATS Screening</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Select a company and your resume to see how your resume performs against their Applicant Tracking System.
                </p>
                <div className="flex gap-4">
                  {companies.map((company) => (
                    <div key={company.id} className={`h-10 w-10 rounded-lg ${company.logo ? 'bg-white' : `bg-gradient-to-br ${company.color}`} flex items-center justify-center overflow-hidden p-1`}>
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-white font-bold text-xs">{company.initials}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Previous Simulations</CardTitle>
              </CardHeader>
              <CardContent>
                {previousResults.length > 0 ? (
                  <div className="space-y-3">
                    {previousResults.slice(0, 5).map((prev) => (
                      <button
                        key={prev.id}
                        onClick={() => {
                          setResult({
                            ...prev,
                            missing_keywords: prev.missing_keywords as string[],
                            optimization_suggestions: prev.optimization_suggestions as ATSResult['optimization_suggestions']
                          });
                          setSelectedCompany(prev.company);
                        }}
                        className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{prev.company}</span>
                          <Badge className={prev.passed ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}>
                            {prev.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <Progress value={prev.ats_score} className="h-2 flex-1 mr-3" />
                          <span className="text-sm font-medium">{prev.ats_score}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No previous simulations yet
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
