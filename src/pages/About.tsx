import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Brain, Target, Users, GraduationCap, Code2, Database, Sparkles, Shield } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const technologies = [
    { icon: Code2, name: t('about.tech.react'), description: t('about.tech.reactDesc') },
    { icon: Database, name: t('about.tech.backend'), description: t('about.tech.backendDesc') },
    { icon: Brain, name: t('about.tech.ai'), description: t('about.tech.aiDesc') },
    { icon: Shield, name: t('about.tech.auth'), description: t('about.tech.authDesc') },
  ];

  const features = [
    { title: t('about.features.parsing'), description: t('about.features.parsingDesc') },
    { title: t('about.features.analysis'), description: t('about.features.analysisDesc') },
    { title: t('about.features.ats'), description: t('about.features.atsDesc') },
    { title: t('about.features.jobs'), description: t('about.features.jobsDesc') },
    { title: t('about.features.admin'), description: t('about.features.adminDesc') },
    { title: t('about.features.responsive'), description: t('about.features.responsiveDesc') },
  ];

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('about.title')} <span className="text-primary">ResumeAI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{t('about.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">{t('about.projectOverview')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('about.projectDesc1')}</p>
                <p>{t('about.projectDesc2')}</p>
                <p>{t('about.projectDesc3')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, label: t('about.forStudents'), value: t('about.forStudentsDesc') },
                { icon: Brain, label: t('about.aiPowered'), value: t('about.aiPoweredDesc') },
                { icon: Target, label: t('about.atsOptimized'), value: t('about.atsOptimizedDesc') },
                { icon: Users, label: t('about.userFriendly'), value: t('about.userFriendlyDesc') },
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

      <section className="py-16 bg-card/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t('about.keyFeatures')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
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

      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t('about.techStack')}</h2>
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

      <section className="py-16 bg-primary">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <GraduationCap className="h-12 w-12 text-primary-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">{t('about.academic.title')}</h2>
            <p className="text-primary-foreground/80">{t('about.academic.description')}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}