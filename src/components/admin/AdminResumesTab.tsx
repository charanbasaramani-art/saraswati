import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Resume {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  user_id: string;
  parsed_data: unknown;
}

interface Analysis {
  resume_id: string;
  overall_score: number;
}

export function AdminResumesTab() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (resumeError) throw resumeError;

      const { data: analysisData } = await supabase
        .from('resume_analyses')
        .select('resume_id, overall_score');

      setResumes(resumeData || []);
      setAnalyses(analysisData || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalysisScore = (resumeId: string) => {
    const analysis = analyses.find(a => a.resume_id === resumeId);
    return analysis?.overall_score;
  };

  const getScoreBadgeColor = (score: number | undefined) => {
    if (!score) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Uploaded Resumes</CardTitle>
        <CardDescription>View all resumes uploaded by users</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No resumes uploaded yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Upload Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumes.map((resume) => {
                const score = getAnalysisScore(resume.id);
                return (
                  <TableRow key={resume.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">User</p>
                        <p className="text-xs text-muted-foreground">{resume.user_id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{resume.file_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {resume.file_type.includes('pdf') ? 'PDF' : 'DOCX'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreBadgeColor(score)}>
                        {score !== undefined ? `${score}/100` : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
