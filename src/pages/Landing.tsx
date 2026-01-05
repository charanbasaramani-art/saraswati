import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { 
  FileText, 
  Brain, 
  Target, 
  Briefcase, 
  Upload, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Shield,
  Users
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Upload your resume in PDF or DOCX format and let our AI do the rest.',
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'Get detailed skill analysis, resume score, and improvement suggestions powered by AI.',
    },
    {
      icon: Target,
      title: 'ATS Optimization',
      description: 'Optimize your resume for Applicant Tracking Systems with keyword recommendations.',
    },
    {
      icon: Briefcase,
      title: 'Job Matching',
      description: 'Receive personalized job recommendations based on your skills and experience.',
    },
    {
      icon: BarChart3,
      title: 'Skill Gap Analysis',
      description: 'Identify missing skills and get suggestions to improve your profile.',
    },
    {
      icon: CheckCircle2,
      title: 'Actionable Insights',
      description: 'Get clear, actionable steps to improve your resume and land your dream job.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Resumes Analyzed' },
    { value: '95%', label: 'User Satisfaction' },
    { value: '500+', label: 'Job Matches Daily' },
    { value: '50+', label: 'Partner Companies' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">AI-Powered Resume Analysis</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Transform Your Resume with{' '}
              <span className="text-primary">AI Intelligence</span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Upload your resume and get instant AI-driven analysis, skill gap identification, 
              ATS optimization tips, and personalized job recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our AI-powered platform provides comprehensive resume analysis and career guidance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Upload Resume', description: 'Upload your resume in PDF or DOCX format', icon: Upload },
              { step: '02', title: 'AI Analysis', description: 'Our AI analyzes your resume and extracts insights', icon: Brain },
              { step: '03', title: 'Get Recommendations', description: 'Receive job matches and improvement suggestions', icon: Target },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="mb-4 text-6xl font-bold text-primary/20">{item.step}</div>
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and never shared with third parties.' },
              { icon: Zap, title: 'Instant Results', description: 'Get your resume analysis in seconds, not hours.' },
              { icon: Users, title: 'Trusted by Thousands', description: 'Join thousands of job seekers who improved their careers.' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Boost Your Career?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Join thousands of job seekers who have already improved their resumes with AI.
            </p>
            <div className="mt-8">
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
