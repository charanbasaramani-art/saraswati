import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, AlertTriangle, RefreshCw, FileText, Wand2, CheckCircle2, ScanLine, FileQuestion } from 'lucide-react';

export interface ValidationResult {
  isResume: boolean;
  confidence: number;
  detectedType: string;
  missingSections: string[];
  detectedSections: string[];
  reasoning: string;
  insight: string;
  friendlyMessage: string;
  canConvert: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  contact: 'Contact Info',
  education: 'Education',
  experience: 'Work Experience',
  skills: 'Skills',
  projects: 'Projects / Certifications',
  name: 'Resume Header',
};

export function ScanningOverlay({ stage }: { stage: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-gold/5 p-8 backdrop-blur-sm animate-fade-in-up">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_1.6s_infinite]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-primary/40 animate-[scan_2.2s_ease-in-out_infinite]" style={{ boxShadow: '0 0 18px hsl(var(--primary) / 0.6)' }} />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <ScanLine className="h-10 w-10 text-primary animate-pulse" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-gold animate-pulse" />
        </div>
        <div>
          <p className="font-serif font-semibold text-lg text-foreground">Analyzing your file with AI…</p>
          <p className="text-sm text-muted-foreground">{stage}</p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  result: ValidationResult;
  onReupload: () => void;
  onUseSample?: () => void;
  onConvert?: () => void;
  onProceedAnyway?: () => void;
}

export function ValidationFeedback({ result, onReupload, onUseSample, onConvert, onProceedAnyway }: Props) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(result.confidence), 120);
    return () => clearTimeout(t);
  }, [result.confidence]);

  const isLow = result.confidence < 55;
  const tone = isLow ? 'destructive' : 'success';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-md p-6 animate-fade-in-up ${
        isLow
          ? 'border-destructive/40 bg-gradient-to-br from-destructive/10 via-background/60 to-gold/5'
          : 'border-primary/40 bg-gradient-to-br from-primary/10 via-background/60 to-gold/10'
      }`}
      style={{
        boxShadow: isLow
          ? '0 0 40px -10px hsl(var(--destructive) / 0.35), inset 0 1px 0 hsl(var(--border))'
          : '0 0 40px -10px hsl(var(--primary) / 0.35), inset 0 1px 0 hsl(var(--border))',
      }}
    >
      {/* Glow orbs */}
      <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl ${isLow ? 'bg-destructive/20' : 'bg-primary/20'} animate-pulse`} />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-3xl bg-gold/15 animate-pulse" />

      <div className="relative space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
              isLow ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-primary/40 bg-primary/10 text-primary'
            }`}
          >
            {isLow ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <p className="font-serif text-xl font-semibold text-foreground">{result.friendlyMessage}</p>
            <p className="mt-1 text-sm text-muted-foreground">{result.reasoning}</p>
          </div>
        </div>

        {/* Detected type pill */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
            <FileQuestion className="h-3.5 w-3.5" />
            Detected: {result.detectedType}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            isLow ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-primary/30 bg-primary/5 text-primary'
          }`}>
            <Sparkles className="h-3.5 w-3.5" />
            Resume confidence: {result.confidence}%
          </span>
        </div>

        {/* Confidence meter */}
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>AI classification confidence</span>
            <span className="font-semibold text-foreground">{result.confidence}%</span>
          </div>
          <Progress value={progress} className="h-2 transition-all duration-1000" />
        </div>

        {/* Sections grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const found = result.detectedSections.includes(key);
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                  found ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border/40 bg-muted/20 text-muted-foreground line-through'
                }`}
              >
                {found ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />}
                {label}
              </div>
            );
          })}
        </div>

        {/* AI insight */}
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
          <div className="flex gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-gold mt-0.5" />
            <p className="text-sm text-foreground/90">
              <span className="font-semibold text-gold">AI insight: </span>
              {result.insight}
            </p>
          </div>
        </div>

        {/* Recovery actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onReupload} variant="default" size="sm" className="btn-plaque">
            <RefreshCw className="h-4 w-4" />
            Re-upload File
          </Button>
          {result.canConvert && onConvert && (
            <Button onClick={onConvert} variant="outline" size="sm">
              <Wand2 className="h-4 w-4" />
              Create Resume with AI
            </Button>
          )}
          {onUseSample && (
            <Button onClick={onUseSample} variant="ghost" size="sm">
              <FileText className="h-4 w-4" />
              Upload Sample Resume
            </Button>
          )}
          {!isLow && onProceedAnyway && (
            <Button onClick={onProceedAnyway} variant="ghost" size="sm">
              Continue to analysis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}