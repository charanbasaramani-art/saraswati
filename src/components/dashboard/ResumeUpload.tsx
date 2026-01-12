import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
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
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to storage + extract text in parallel
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const uploadPromise = supabase.storage
        .from('resumes')
        .upload(fileName, file);

      const extractPromise = extractResumeText(file);

      const [{ error: uploadError }, extractedText] = await Promise.all([
        uploadPromise,
        extractPromise,
      ]);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Create resume record with file path + extracted text
      const { data: resumeData, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: fileName, // Store path; bucket is private
          file_type: file.type,
          parsed_data: extractedText || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Start AI analysis
      setIsAnalyzing(true);
      
      const { error: analysisError } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeId: resumeData.id }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast({
          title: 'Upload Successful',
          description: 'Resume uploaded. Analysis will be available shortly.',
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
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Resume
        </CardTitle>
        <CardDescription>
          Upload your resume in PDF or DOCX format for AI analysis
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
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-1">
              Drag and drop your resume here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOCX (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
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
                    {isAnalyzing ? 'Analyzing with AI...' : 'Uploading...'}
                  </span>
                  <span className="text-foreground font-medium">
                    {isAnalyzing ? '' : `${uploadProgress}%`}
                  </span>
                </div>
                {!isAnalyzing && <Progress value={uploadProgress} className="h-2" />}
                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      AI is analyzing your resume...
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={uploadResume}
              disabled={isUploading || isAnalyzing}
              className="w-full"
            >
              {isUploading || isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isAnalyzing ? 'Analyzing...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
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
