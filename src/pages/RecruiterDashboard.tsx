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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Users, FileText, TrendingUp, Search, Filter, Eye, Star, ArrowUpDown, Building2, Award, Brain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  user_id: string;
  file_name: string;
  created_at: string;
  [key: string]: unknown;
  parsed_data: unknown;
  profile?: {
    full_name: string;
    email: string;
  };
  analysis?: {
    overall_score: number;
    skill_analysis: Record<string, unknown> | null;
  };
  soft_skills?: {
    communication_score: number;
    leadership_score: number;
    teamwork_score: number;
    problem_solving_score: number;
    confidence_score: number;
    adaptability_score: number;
  };
  ats_result?: {
    ats_score: number;
    passed: boolean;
    company: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
  domain: string;
}

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function RecruiterDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Candidate[]>([]);
  const [stats, setStats] = useState({ totalCandidates: 0, avgScore: 0, passRate: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      checkRecruiterRole();
    }
  }, [user, authLoading, navigate]);

  const checkRecruiterRole = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user!.id)
      .in('role', ['recruiter', 'admin']);
    
    if (data && data.length > 0) {
      setIsRecruiter(true);
      fetchData();
    } else {
      toast.error('Access denied. Recruiter role required.');
      navigate('/dashboard');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all resumes with profiles
      const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      // Fetch all analyses
      const { data: analyses } = await supabase
        .from('resume_analyses')
        .select('resume_id, overall_score, skill_analysis');

      // Fetch soft skill analyses
      const { data: softSkills } = await supabase
        .from('soft_skill_analyses')
        .select('*');

      // Fetch ATS results
      const { data: atsResults } = await supabase
        .from('ats_results')
        .select('*');

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, company, domain')
        .eq('is_active', true);

      if (jobsData) setJobs(jobsData);

      // Combine data
      const combinedCandidates: Candidate[] = (resumes || []).map(resume => {
        const profile = profiles?.find(p => p.user_id === resume.user_id);
        const analysis = analyses?.find(a => a.resume_id === resume.id);
        const softSkill = softSkills?.find(s => s.resume_id === resume.id);
        const ats = atsResults?.find(a => a.resume_id === resume.id);

        return {
          ...resume,
          profile: profile ? { full_name: profile.full_name || 'Unknown', email: profile.email || '' } : undefined,
          analysis: analysis ? { overall_score: analysis.overall_score, skill_analysis: analysis.skill_analysis as Record<string, unknown> | null } : undefined,
          soft_skills: softSkill ? {
            communication_score: softSkill.communication_score,
            leadership_score: softSkill.leadership_score,
            teamwork_score: softSkill.teamwork_score,
            problem_solving_score: softSkill.problem_solving_score,
            confidence_score: softSkill.confidence_score,
            adaptability_score: softSkill.adaptability_score
          } : undefined,
          ats_result: ats ? { ats_score: ats.ats_score, passed: ats.passed, company: ats.company } : undefined
        };
      });

      setCandidates(combinedCandidates);

      // Calculate stats
      const totalCandidates = combinedCandidates.length;
      const analyzedCandidates = combinedCandidates.filter(c => c.analysis);
      const avgScore = analyzedCandidates.length > 0
        ? Math.round(analyzedCandidates.reduce((sum, c) => sum + (c.analysis?.overall_score || 0), 0) / analyzedCandidates.length)
        : 0;
      const atsPassedCandidates = combinedCandidates.filter(c => c.ats_result?.passed);
      const passRate = combinedCandidates.filter(c => c.ats_result).length > 0
        ? Math.round((atsPassedCandidates.length / combinedCandidates.filter(c => c.ats_result).length) * 100)
        : 0;

      setStats({ totalCandidates, avgScore, passRate });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load candidate data');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredCandidates = () => {
    let filtered = [...candidates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.profile?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return (b.analysis?.overall_score || 0) - (a.analysis?.overall_score || 0);
      } else if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (a.profile?.full_name || '').localeCompare(b.profile?.full_name || '');
      }
    });

    return filtered;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreDistribution = () => {
    const distribution = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];

    candidates.forEach(c => {
      const score = c.analysis?.overall_score || 0;
      if (score <= 20) distribution[0].count++;
      else if (score <= 40) distribution[1].count++;
      else if (score <= 60) distribution[2].count++;
      else if (score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  };

  const toggleCompare = (candidate: Candidate) => {
    if (compareList.find(c => c.id === candidate.id)) {
      setCompareList(compareList.filter(c => c.id !== candidate.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, candidate]);
    } else {
      toast.error('Maximum 3 candidates can be compared');
    }
  };

  const getCompareData = () => {
    if (compareList.length === 0) return [];
    
    return [
      { skill: 'Resume Score', ...Object.fromEntries(compareList.map((c, i) => [`candidate${i + 1}`, c.analysis?.overall_score || 0])) },
      { skill: 'Communication', ...Object.fromEntries(compareList.map((c, i) => [`candidate${i + 1}`, c.soft_skills?.communication_score || 0])) },
      { skill: 'Leadership', ...Object.fromEntries(compareList.map((c, i) => [`candidate${i + 1}`, c.soft_skills?.leadership_score || 0])) },
      { skill: 'Teamwork', ...Object.fromEntries(compareList.map((c, i) => [`candidate${i + 1}`, c.soft_skills?.teamwork_score || 0])) },
      { skill: 'Problem Solving', ...Object.fromEntries(compareList.map((c, i) => [`candidate${i + 1}`, c.soft_skills?.problem_solving_score || 0])) },
      { skill: 'ATS Score', ...Object.fromEntries(compareList.map((c, i) => [`candidate${i + 1}`, c.ats_result?.ats_score || 0])) },
    ];
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isRecruiter) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Recruiter Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and evaluate candidate profiles
            </p>
          </div>
          <Button 
            variant={compareMode ? 'default' : 'outline'}
            onClick={() => {
              setCompareMode(!compareMode);
              if (compareMode) setCompareList([]);
            }}
          >
            {compareMode ? `Comparing (${compareList.length}/3)` : 'Compare Candidates'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}/100</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ATS Pass Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.passRate}%</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compare" disabled={compareList.length < 2}>Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={sortBy} onValueChange={(v: 'score' | 'date' | 'name') => setSortBy(v)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score (High to Low)</SelectItem>
                  <SelectItem value="date">Date (Newest)</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Candidates Table */}
            <Card className="glass-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {compareMode && <TableHead className="w-12">Select</TableHead>}
                      <TableHead>Candidate</TableHead>
                      <TableHead>Resume Score</TableHead>
                      <TableHead>Soft Skills</TableHead>
                      <TableHead>ATS Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredCandidates().map((candidate) => (
                      <TableRow key={candidate.id}>
                        {compareMode && (
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={!!compareList.find(c => c.id === candidate.id)}
                              onChange={() => toggleCompare(candidate)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <p className="font-medium">{candidate.profile?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{candidate.profile?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {candidate.analysis ? (
                            <div className="flex items-center gap-2">
                              <Progress value={candidate.analysis.overall_score} className="w-20 h-2" />
                              <span className={`font-medium ${getScoreColor(candidate.analysis.overall_score)}`}>
                                {candidate.analysis.overall_score}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline">Not analyzed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {candidate.soft_skills ? (
                            <Badge variant="secondary">
                              Avg: {Math.round((
                                candidate.soft_skills.communication_score +
                                candidate.soft_skills.leadership_score +
                                candidate.soft_skills.teamwork_score +
                                candidate.soft_skills.problem_solving_score +
                                candidate.soft_skills.confidence_score +
                                candidate.soft_skills.adaptability_score
                              ) / 6)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">—</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {candidate.ats_result ? (
                            <Badge className={candidate.ats_result.passed ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}>
                              {candidate.ats_result.company}: {candidate.ats_result.ats_score}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">—</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(candidate.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(candidate)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{candidate.profile?.full_name || 'Candidate Profile'}</DialogTitle>
                                <DialogDescription>{candidate.profile?.email}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Resume Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-3xl font-bold">{candidate.analysis?.overall_score || 'N/A'}</p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">ATS Result</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {candidate.ats_result ? (
                                        <>
                                          <p className="text-3xl font-bold">{candidate.ats_result.ats_score}%</p>
                                          <Badge className={candidate.ats_result.passed ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}>
                                            {candidate.ats_result.company}
                                          </Badge>
                                        </>
                                      ) : (
                                        <p className="text-muted-foreground">Not tested</p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                                
                                {candidate.soft_skills && (
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Soft Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      {Object.entries(candidate.soft_skills).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2">
                                          <span className="text-sm capitalize w-32">{key.replace('_score', '').replace('_', ' ')}</span>
                                          <Progress value={value} className="flex-1 h-2" />
                                          <span className="text-sm w-8">{value}</span>
                                        </div>
                                      ))}
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getScoreDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="range" tick={{ fill: 'hsl(var(--foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFilteredCandidates().slice(0, 5).map((candidate, i) => (
                      <div key={candidate.id} className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                          i === 1 ? 'bg-slate-400/20 text-slate-500' :
                          i === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{candidate.profile?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{candidate.file_name}</p>
                        </div>
                        <Badge className={getScoreColor(candidate.analysis?.overall_score || 0)}>
                          {candidate.analysis?.overall_score || 'N/A'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            {compareList.length >= 2 && (
              <div className="grid gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Candidate Comparison</CardTitle>
                    <CardDescription>Comparing {compareList.length} candidates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      {compareList.map((c, i) => (
                        <Badge key={c.id} style={{ backgroundColor: CHART_COLORS[i] }} className="text-white">
                          {c.profile?.full_name || `Candidate ${i + 1}`}
                        </Badge>
                      ))}
                    </div>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getCompareData()}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          {compareList.map((_, i) => (
                            <Radar
                              key={i}
                              name={compareList[i].profile?.full_name || `Candidate ${i + 1}`}
                              dataKey={`candidate${i + 1}`}
                              stroke={CHART_COLORS[i]}
                              fill={CHART_COLORS[i]}
                              fillOpacity={0.2}
                            />
                          ))}
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                  {compareList.map((candidate, i) => (
                    <Card key={candidate.id} className="glass-card" style={{ borderColor: CHART_COLORS[i] }}>
                      <CardHeader>
                        <CardTitle className="text-lg">{candidate.profile?.full_name || 'Unknown'}</CardTitle>
                        <CardDescription>{candidate.profile?.email}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Resume Score</span>
                          <span className="font-bold">{candidate.analysis?.overall_score || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ATS Score</span>
                          <span className="font-bold">{candidate.ats_result?.ats_score || 'N/A'}%</span>
                        </div>
                        {candidate.soft_skills && (
                          <div className="flex justify-between">
                            <span>Avg Soft Skills</span>
                            <span className="font-bold">
                              {Math.round((
                                candidate.soft_skills.communication_score +
                                candidate.soft_skills.leadership_score +
                                candidate.soft_skills.teamwork_score +
                                candidate.soft_skills.problem_solving_score +
                                candidate.soft_skills.confidence_score +
                                candidate.soft_skills.adaptability_score
                              ) / 6)}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
