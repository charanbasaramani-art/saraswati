import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Clock,
  Filter,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  domain: string;
  description: string;
  requirements: string[];
  skills_required: string[];
  experience_level: string;
  salary_range: string | null;
  job_type: string;
  created_at: string;
}

export default function Jobs() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedDomain, selectedLocation, selectedExperience]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.skills_required.some((skill) => skill.toLowerCase().includes(query))
      );
    }
    if (selectedDomain !== 'all') filtered = filtered.filter((job) => job.domain === selectedDomain);
    if (selectedLocation !== 'all') filtered = filtered.filter((job) => job.location.includes(selectedLocation));
    if (selectedExperience !== 'all') filtered = filtered.filter((job) => job.experience_level === selectedExperience);
    setFilteredJobs(filtered);
  };

  const domains = [...new Set(jobs.map((job) => job.domain))];
  const locations = [...new Set(jobs.map((job) => job.location.split(',')[0].trim()))];

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('jobs.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('jobs.subtitle')}</p>
        </div>

        <Card className="border-border mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('jobs.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobs.allDomains')}</SelectItem>
                  {domains.map((domain) => (<SelectItem key={domain} value={domain}>{domain}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger><SelectValue placeholder={t('jobs.filters.location')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobs.allLocations')}</SelectItem>
                  {locations.map((location) => (<SelectItem key={location} value={location}>{location}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger><SelectValue placeholder={t('jobs.filters.experience')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobs.allLevels')}</SelectItem>
                  <SelectItem value="entry">{t('jobs.entryLevel')}</SelectItem>
                  <SelectItem value="mid">{t('jobs.midLevel')}</SelectItem>
                  <SelectItem value="senior">{t('jobs.seniorLevel')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">{t('common.showing')} <span className="font-medium text-foreground">{filteredJobs.length}</span> {t('nav.jobs').toLowerCase()}</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedDomain('all'); setSelectedLocation('all'); setSelectedExperience('all'); }}>
            <Filter className="mr-2 h-4 w-4" />{t('common.clearFilters')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredJobs.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('jobs.noJobs')}</h3>
              <p className="text-muted-foreground">{jobs.length === 0 ? t('jobs.noJobsEmpty') : t('jobs.noJobsFilter')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                        <Badge className={getExperienceBadgeColor(job.experience_level)}>
                          {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} {t('jobs.level')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.job_type}</span>
                        {job.salary_range && <span className="flex items-center gap-1 text-primary font-medium">{job.salary_range}</span>}
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.slice(0, 5).map((skill, index) => (<Badge key={index} variant="secondary">{skill}</Badge>))}
                        {job.skills_required.length > 5 && <Badge variant="outline">+{job.skills_required.length - 5} {t('jobs.moreSkills')}</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-end">
                      <Button>{t('jobs.apply')}<ExternalLink className="ml-2 h-4 w-4" /></Button>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}