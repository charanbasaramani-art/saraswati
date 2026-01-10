-- Create soft skill analysis table
CREATE TABLE public.soft_skill_analyses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    communication_score INTEGER NOT NULL DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 100),
    leadership_score INTEGER NOT NULL DEFAULT 0 CHECK (leadership_score >= 0 AND leadership_score <= 100),
    teamwork_score INTEGER NOT NULL DEFAULT 0 CHECK (teamwork_score >= 0 AND teamwork_score <= 100),
    problem_solving_score INTEGER NOT NULL DEFAULT 0 CHECK (problem_solving_score >= 0 AND problem_solving_score <= 100),
    confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    adaptability_score INTEGER NOT NULL DEFAULT 0 CHECK (adaptability_score >= 0 AND adaptability_score <= 100),
    personality_insights JSONB,
    hiring_suitability TEXT,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ATS compatibility results table
CREATE TABLE public.ats_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    ats_score INTEGER NOT NULL DEFAULT 0 CHECK (ats_score >= 0 AND ats_score <= 100),
    passed BOOLEAN NOT NULL DEFAULT false,
    keyword_relevance_score INTEGER NOT NULL DEFAULT 0,
    formatting_score INTEGER NOT NULL DEFAULT 0,
    skill_matching_score INTEGER NOT NULL DEFAULT 0,
    missing_keywords JSONB,
    optimization_suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.soft_skill_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for soft_skill_analyses
CREATE POLICY "Users can view their own soft skill analyses"
ON public.soft_skill_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own soft skill analyses"
ON public.soft_skill_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can view all soft skill analyses"
ON public.soft_skill_analyses
FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter') OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for ats_results
CREATE POLICY "Users can view their own ATS results"
ON public.ats_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ATS results"
ON public.ats_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can view all ATS results"
ON public.ats_results
FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter') OR public.has_role(auth.uid(), 'admin'));

-- RLS policy for recruiters to view resumes
CREATE POLICY "Recruiters can view all resumes"
ON public.resumes
FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter') OR public.has_role(auth.uid(), 'admin'));

-- RLS policy for recruiters to view resume analyses
CREATE POLICY "Recruiters can view all resume analyses"
ON public.resume_analyses
FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter') OR public.has_role(auth.uid(), 'admin'));

-- RLS policy for recruiters to view profiles
CREATE POLICY "Recruiters can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter') OR public.has_role(auth.uid(), 'admin'));