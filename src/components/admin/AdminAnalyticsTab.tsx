import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

interface SkillCount {
  skill: string;
  count: number;
}

interface DomainCount {
  domain: string;
  count: number;
}

export function AdminAnalyticsTab() {
  const [skillData, setSkillData] = useState<SkillCount[]>([]);
  const [domainData, setDomainData] = useState<DomainCount[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<{ range: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch jobs for domain analytics
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('domain, skills_required');

      // Fetch analyses for score distribution
      const { data: analysesData } = await supabase
        .from('resume_analyses')
        .select('overall_score, skill_analysis');

      // Process skill data from jobs
      const skillCounts: Record<string, number> = {};
      jobsData?.forEach(job => {
        job.skills_required?.forEach((skill: string) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      });
      const topSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }));
      setSkillData(topSkills);

      // Process domain data
      const domainCounts: Record<string, number> = {};
      jobsData?.forEach(job => {
        domainCounts[job.domain] = (domainCounts[job.domain] || 0) + 1;
      });
      const domains = Object.entries(domainCounts)
        .map(([domain, count]) => ({ domain, count }));
      setDomainData(domains);

      // Process score distribution
      const ranges = [
        { range: '0-40', min: 0, max: 40, count: 0 },
        { range: '41-60', min: 41, max: 60, count: 0 },
        { range: '61-80', min: 61, max: 80, count: 0 },
        { range: '81-100', min: 81, max: 100, count: 0 },
      ];
      analysesData?.forEach(analysis => {
        const score = analysis.overall_score;
        const range = ranges.find(r => score >= r.min && score <= r.max);
        if (range) range.count++;
      });
      setScoreDistribution(ranges.map(r => ({ range: r.range, count: r.count })));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const chartConfig = {
    count: {
      label: 'Count',
      color: 'hsl(var(--primary))',
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Popular Skills */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Popular Skills in Demand</CardTitle>
          <CardDescription>Most requested skills across job listings</CardDescription>
        </CardHeader>
        <CardContent>
          {skillData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No skill data available yet
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="skill" width={80} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Job Domains */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Jobs by Domain</CardTitle>
          <CardDescription>Distribution of jobs across domains</CardDescription>
        </CardHeader>
        <CardContent>
          {domainData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No domain data available yet
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={domainData}
                    dataKey="count"
                    nameKey="domain"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ domain, percent }) => `${domain} ${(percent * 100).toFixed(0)}%`}
                  >
                    {domainData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card className="border-border md:col-span-2">
        <CardHeader>
          <CardTitle>Resume Score Distribution</CardTitle>
          <CardDescription>Distribution of resume analysis scores</CardDescription>
        </CardHeader>
        <CardContent>
          {scoreDistribution.every(d => d.count === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              No resume analyses available yet
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
