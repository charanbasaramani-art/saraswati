import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, ScrollText, Flame, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractResumeText } from '@/lib/extractResumeText';

interface ResumeUploadProps {
  onUploadComplete: () => void;
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    if (!acceptedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(file);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const uploadResume = async () => {
    if (!file || !user) {
      if (!user) setError('Please sign in to upload your resume.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const text = await extractResumeText(file);
      const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: resumeData, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: fileName,
          file_type: file.type,
          parsed_data: text || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setIsAnalyzing(true);

      // Race the analysis call against a 90s timeout so the UI never hangs forever
      const analysisPromise = supabase.functions.invoke('analyze-resume', {
        body: { resumeId: resumeData.id }
      });
      const timeoutPromise = new Promise<{ error: Error }>((resolve) =>
        setTimeout(() => resolve({ error: new Error('Analysis is taking longer than expected') }), 90000)
      );

      const result: any = await Promise.race([analysisPromise, timeoutPromise]);
      const analysisError = result?.error;

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast({
          title: 'Resume Uploaded',
          description: 'Your resume is saved. Analysis is still running in the background — refresh in a moment.',
        });
      } else {
        toast({
          title: 'Analysis Complete',
          description: 'Your resume has been analyzed successfully!',
        });
      }

      setFile(null);
      onUploadComplete();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="manuscript-card corner-ornament">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-gold" />
          Upload Your Scroll
        </CardTitle>
        <CardDescription>
          Submit your resume manuscript in PDF or DOCX format for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer
              ${isDragging 
                ? 'border-gold bg-gold-muted/30 shadow-[0_0_30px_hsl(var(--gold)/0.2)]' 
                : 'border-gold/30 hover:border-gold/60 hover:bg-gold-muted/10'
              }
            `}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {/* Decorative scroll-style top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Flame className="h-6 w-6 text-gold/60 flame-flicker" />
            </div>
            
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <ScrollText className="h-14 w-14 mx-auto text-gold/60 mb-4" />
            <p className="text-foreground font-serif font-medium text-lg mb-1">
              Place your manuscript here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse your scrolls
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted scrolls: PDF, DOCX (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-gold/20 bg-gold-muted/20">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-gold" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={isUploading || isAnalyzing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {(isUploading || isAnalyzing) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isAnalyzing ? 'The sages are analyzing...' : 'Uploading scroll...'}
                  </span>
                  <span className="text-foreground font-medium">
                    {isAnalyzing ? '' : `${uploadProgress}%`}
                  </span>
                </div>
                {!isAnalyzing && <Progress value={uploadProgress} className="h-2" />}
                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Flame className="h-5 w-5 text-gold flame-flicker" />
                    <span className="text-sm text-muted-foreground font-serif">
                      AI wisdom is analyzing your resume...
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={uploadResume}
              disabled={isUploading || isAnalyzing}
              className="w-full btn-plaque"
            >
              {isUploading || isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isAnalyzing ? 'Analyzing...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
