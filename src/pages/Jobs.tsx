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
  ExternalLink,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  X
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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('all');
    setSelectedLocation('all');
    setSelectedExperience('all');
  };

  const hasActiveFilters = searchQuery || selectedDomain !== 'all' || selectedLocation !== 'all' || selectedExperience !== 'all';

  const domains = [...new Set(jobs.map((job) => job.domain))];
  const locations = [...new Set(jobs.map((job) => job.location.split(',')[0].trim()))];

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'mid': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'senior': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getJobTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'bg-primary/20 text-primary border-primary/30';
      case 'part-time': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'remote': return 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Career Opportunities</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('jobs.title')}
            </h1>
            <p className="text-xl text-muted-foreground">{t('jobs.subtitle')}</p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-8 relative z-20">
          <Card className="manuscript-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="manuscript-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{domains.length}</p>
                <p className="text-xs text-muted-foreground">Domains</p>
              </div>
            </CardContent>
          </Card>
          <Card className="manuscript-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{locations.length}</p>
                <p className="text-xs text-muted-foreground">Locations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="manuscript-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{new Set(jobs.map(j => j.company)).size}</p>
                <p className="text-xs text-muted-foreground">Companies</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="manuscript-card mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder={t('jobs.searchPlaceholder')} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-12 h-12 bg-muted/50 border-border/50"
                />
              </div>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="h-12 bg-muted/50 border-border/50">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobs.allDomains')}</SelectItem>
                  {domains.map((domain) => (<SelectItem key={domain} value={domain}>{domain}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12 bg-muted/50 border-border/50">
                  <SelectValue placeholder={t('jobs.filters.location')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobs.allLocations')}</SelectItem>
                  {locations.map((location) => (<SelectItem key={location} value={location}>{location}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="h-12 bg-muted/50 border-border/50">
                  <SelectValue placeholder={t('jobs.filters.experience')} />
                </SelectTrigger>
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

        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">
              {t('common.showing')} <span className="font-semibold text-foreground">{filteredJobs.length}</span> {t('nav.jobs').toLowerCase()}
            </p>
            {hasActiveFilters && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" />
                Filtered
              </Badge>
            )}
          </div>
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              {t('common.clearFilters')}
            </Button>
          )}
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="manuscript-card">
            <CardContent className="py-20 text-center">
              <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('jobs.noJobs')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {jobs.length === 0 ? t('jobs.noJobsEmpty') : t('jobs.noJobsFilter')}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} className="mt-6">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job, index) => (
              <Card 
                key={job.id} 
                className="manuscript-card corner-ornament hover-lift group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Company Logo Placeholder */}
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    
                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-primary font-medium">{job.company}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getExperienceBadgeColor(job.experience_level)}>
                            {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} {t('jobs.level')}
                          </Badge>
                          <Badge className={getJobTypeBadgeColor(job.job_type)}>
                            {job.job_type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" />
                          {job.domain}
                        </span>
                        {job.salary_range && (
                          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                            <DollarSign className="h-4 w-4" />
                            {job.salary_range}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-muted/80">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 5 && (
                          <Badge variant="outline">
                            +{job.skills_required.length - 5} {t('jobs.moreSkills')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:items-end flex-shrink-0">
                      <Button className="btn-glow gap-2">
                        {t('jobs.apply')}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
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