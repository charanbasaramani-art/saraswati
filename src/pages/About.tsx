import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Target, 
  Users, 
  GraduationCap,
  Code2,
  Database,
  Sparkles,
  Shield
} from 'lucide-react';

export default function About() {
  const teamMembers = [
    { name: 'Project Team', role: 'BCA Final Year Students', description: 'Developed as part of the Bachelor of Computer Applications curriculum.' }
  ];

  const technologies = [
    { icon: Code2, name: 'React + TypeScript', description: 'Modern frontend framework' },
    { icon: Database, name: 'Lovable Cloud', description: 'Backend & Database' },
    { icon: Brain, name: 'AI/NLP', description: 'Resume parsing & analysis' },
    { icon: Shield, name: 'Secure Auth', description: 'Role-based access control' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              About <span className="text-primary">ResumeAI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              An AI-powered resume analysis and job recommendation system designed to help 
              students, fresh graduates, and job seekers land their dream careers.
            </p>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Project Overview</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ResumeAI is a comprehensive web application that leverages artificial intelligence 
                  to analyze resumes, identify skill gaps, and provide personalized job recommendations.
                </p>
                <p>
                  The platform is designed with a focus on helping students and fresh graduates 
                  navigate the competitive job market by providing actionable insights to improve 
                  their resumes and increase their chances of landing interviews.
                </p>
                <p>
                  This project was developed as part of the BCA Final Year curriculum, demonstrating 
                  the practical application of modern web technologies and AI/ML concepts.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, label: 'For Students', value: 'Fresh Graduates & Job Seekers' },
                { icon: Brain, label: 'AI-Powered', value: 'NLP Resume Analysis' },
                { icon: Target, label: 'ATS-Optimized', value: 'Keyword Optimization' },
                { icon: Users, label: 'User-Friendly', value: 'Intuitive Dashboard' },
              ].map((item, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="pt-6">
                    <item.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Resume Parsing',
                description: 'Automatically extracts name, email, skills, education, and experience from uploaded resumes.',
              },
              {
                title: 'AI Analysis',
                description: 'Generates resume strength score (0-100), skill gap analysis, and improvement suggestions.',
              },
              {
                title: 'ATS Optimization',
                description: 'Provides keyword optimization tips to make your resume ATS-friendly.',
              },
              {
                title: 'Job Recommendations',
                description: 'Matches your profile with relevant job listings based on skills and experience.',
              },
              {
                title: 'Admin Dashboard',
                description: 'Comprehensive dashboard for managing job listings and viewing analytics.',
              },
              {
                title: 'Responsive Design',
                description: 'Fully responsive interface that works seamlessly on desktop, tablet, and mobile.',
              },
            ].map((feature, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Technology Stack</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="border-border text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <tech.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Info */}
      <section className="py-16 bg-primary">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <GraduationCap className="h-12 w-12 text-primary-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              BCA Final Year Project
            </h2>
            <p className="text-primary-foreground/80">
              This project demonstrates the practical application of web development, 
              database management, and artificial intelligence concepts learned during 
              the Bachelor of Computer Applications program.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
