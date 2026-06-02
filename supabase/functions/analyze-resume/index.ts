import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// DETERMINISTIC RESUME SCORING ENGINE
// Weighted categories totaling 100%:
//   Resume Structure    : 15%
//   Contact Information : 10%
//   Skills Coverage     : 20%
//   Experience Quality  : 20%
//   Education Section   : 10%
//   Keyword Optimization: 15%
//   Readability/Format  : 10%
// ============================================================================

const COMMON_SKILLS = [
  // Programming
  'javascript','typescript','python','java','c++','c#','go','rust','ruby','php','swift','kotlin','scala','r','matlab','sql','bash','shell',
  // Web/Frontend
  'react','angular','vue','next.js','nextjs','svelte','html','css','tailwind','sass','redux','jquery','bootstrap','webpack','vite',
  // Backend
  'node','nodejs','express','django','flask','fastapi','spring','spring boot','rails','laravel','asp.net','graphql','rest','rest api','microservices',
  // Data / AI
  'machine learning','deep learning','tensorflow','pytorch','pandas','numpy','scikit-learn','nlp','computer vision','data science','data analysis','tableau','power bi','excel','statistics',
  // Cloud / DevOps
  'aws','azure','gcp','google cloud','docker','kubernetes','terraform','jenkins','ci/cd','github actions','linux','nginx','ansible',
  // Databases
  'mysql','postgresql','postgres','mongodb','redis','elasticsearch','dynamodb','firebase','supabase','oracle','sqlite',
  // Mobile
  'android','ios','react native','flutter','xamarin',
  // Tools / Methodology
  'git','github','gitlab','jira','agile','scrum','kanban','tdd','unit testing','jest','cypress','selenium',
  // Soft
  'leadership','communication','teamwork','problem solving','project management','collaboration','mentoring','presentation','analytical',
];

const ATS_KEYWORDS = [
  'experience','responsible','managed','developed','led','built','designed','implemented','improved',
  'optimized','collaborated','delivered','achieved','increased','reduced','launched','created',
  'analyzed','engineered','architected','automated','mentored','owned','shipped',
];

const CONTACT_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  phone: /(\+?\d[\d\s\-().]{7,}\d)/,
  linkedin: /linkedin\.com\/[A-Za-z0-9\-_/]+/i,
  github: /github\.com\/[A-Za-z0-9\-_/]+/i,
  location: /\b(remote|bangalore|mumbai|delhi|hyderabad|pune|chennai|kolkata|noida|gurgaon|india|usa|uk|new york|san francisco|london|berlin)\b/i,
};

const SECTION_HEADERS = [
  'summary','objective','profile','about',
  'experience','employment','work history','professional experience',
  'education','academic','qualifications',
  'skills','technical skills','core competencies',
  'projects','project','portfolio',
  'certifications','certification','licenses',
  'achievements','awards','honors',
];

function scoreStructure(text: string): { score: number; foundSections: string[] } {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const h of SECTION_HEADERS) {
    if (lower.includes(h)) found.add(h);
  }
  // We expect at least: summary, experience, education, skills, projects/certs
  const buckets = {
    summary: ['summary','objective','profile','about'],
    experience: ['experience','employment','work history','professional experience'],
    education: ['education','academic','qualifications'],
    skills: ['skills','technical skills','core competencies'],
    extras: ['projects','project','portfolio','certifications','certification','licenses','achievements','awards','honors'],
  };
  let bucketsHit = 0;
  for (const bucket of Object.values(buckets)) {
    if (bucket.some((h) => found.has(h))) bucketsHit++;
  }
  const score = Math.round((bucketsHit / 5) * 100);
  return { score, foundSections: [...found] };
}

function scoreContact(text: string): { score: number; found: Record<string, boolean> } {
  const found: Record<string, boolean> = {};
  let hit = 0;
  const total = Object.keys(CONTACT_PATTERNS).length;
  for (const [k, pattern] of Object.entries(CONTACT_PATTERNS)) {
    const m = pattern.test(text);
    found[k] = m;
    if (m) hit++;
  }
  return { score: Math.round((hit / total) * 100), found };
}

function scoreSkills(text: string): { score: number; detected: string[] } {
  const lower = text.toLowerCase();
  const detected: string[] = [];
  for (const skill of COMMON_SKILLS) {
    const pattern = new RegExp(`(^|[^a-z0-9+#.])${skill.replace(/[.+]/g, '\\$&')}([^a-z0-9+#.]|$)`, 'i');
    if (pattern.test(lower)) detected.push(skill);
  }
  // 12+ skills => 100, 0 => 0, linear in between
  const score = Math.min(100, Math.round((detected.length / 12) * 100));
  return { score, detected };
}

function scoreExperience(text: string): { score: number } {
  const lower = text.toLowerCase();
  let score = 0;

  // Year patterns (e.g. "2018 - 2022", "Jan 2020", "2019 to Present")
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || [];
  if (yearMatches.length >= 6) score += 30;
  else if (yearMatches.length >= 3) score += 20;
  else if (yearMatches.length >= 1) score += 10;

  // Action verbs presence
  const actionVerbs = ['developed','built','designed','led','managed','implemented','improved','optimized','launched','created','engineered','architected','delivered','reduced','increased','automated','mentored','owned'];
  const verbsFound = actionVerbs.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(lower));
  score += Math.min(30, verbsFound.length * 4);

  // Quantified achievements (numbers + %, $, k, M)
  const quantMatches = (text.match(/\b\d+(?:[.,]\d+)?\s*(%|percent|users|customers|hours|days|weeks|months|years|x|times|k|m|million|billion|\$|rs|inr|usd)/gi) || []).length;
  score += Math.min(25, quantMatches * 5);

  // Job titles
  const titles = ['engineer','developer','manager','analyst','designer','consultant','intern','lead','architect','specialist','scientist','officer','executive','director'];
  if (titles.some((t) => lower.includes(t))) score += 15;

  return { score: Math.min(100, score) };
}

function scoreEducation(text: string): { score: number } {
  const lower = text.toLowerCase();
  let score = 0;
  if (/\b(education|academic|qualifications)\b/.test(lower)) score += 30;
  const degrees = ['b.tech','btech','b.e','bachelor','m.tech','mtech','master','mba','phd','b.sc','bsc','m.sc','msc','bca','mca','diploma','high school','intermediate'];
  if (degrees.some((d) => lower.includes(d))) score += 35;
  const fields = ['computer science','engineering','information technology','data science','business','management','mathematics','physics','electronics','mechanical','civil'];
  if (fields.some((f) => lower.includes(f))) score += 20;
  // University/college mention
  if (/\b(university|college|institute|school)\b/.test(lower)) score += 15;
  return { score: Math.min(100, score) };
}

function scoreKeywords(text: string, jobKeywords: string[]): { score: number; found: string[]; missing: string[] } {
  const lower = text.toLowerCase();
  const allKeywords = [...new Set([...ATS_KEYWORDS, ...jobKeywords.map((k) => k.toLowerCase())])];
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of allKeywords) {
    if (lower.includes(kw)) found.push(kw); else missing.push(kw);
  }
  // Density-based scoring: at least 40% of keywords present => 100
  const ratio = found.length / Math.max(1, allKeywords.length);
  const score = Math.min(100, Math.round((ratio / 0.4) * 100));
  return { score, found: found.slice(0, 25), missing: missing.slice(0, 20) };
}

function scoreReadability(text: string): { score: number } {
  let score = 0;
  const len = text.length;

  // Length sweet spot: 1500-6000 chars
  if (len >= 1500 && len <= 6000) score += 40;
  else if (len >= 800 && len < 1500) score += 25;
  else if (len > 6000 && len <= 10000) score += 30;
  else if (len >= 300) score += 15;

  // Bullet-like structures (• - *)
  const bullets = (text.match(/(^|\n)\s*[•\-*]\s+/g) || []).length;
  if (bullets >= 10) score += 25;
  else if (bullets >= 4) score += 15;
  else if (bullets >= 1) score += 8;

  // Reasonable word/sentence ratio (avoid wall of text)
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const avg = words / sentences;
  if (avg >= 8 && avg <= 25) score += 20;
  else if (avg > 0) score += 10;

  // No excessive ALL-CAPS
  const capsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
  if (capsWords < 20) score += 15;
  else if (capsWords < 50) score += 8;

  return { score: Math.min(100, score) };
}

function computeAtsScore(parts: {
  structure: number;
  contact: number;
  skills: number;
  experience: number;
  education: number;
  keywords: number;
  readability: number;
}): number {
  const weighted =
    parts.structure * 0.15 +
    parts.contact * 0.10 +
    parts.skills * 0.20 +
    parts.experience * 0.20 +
    parts.education * 0.10 +
    parts.keywords * 0.15 +
    parts.readability * 0.10;
  return Math.max(0, Math.min(100, Math.round(weighted)));
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

interface ResumeAnalysis {
  overall_score: number;
  ats_score: number;
  skill_analysis: {
    detected_skills: string[];
    missing_skills: string[];
    skill_categories: Record<string, string[]>;
  };
  improvement_suggestions: {
    suggestions: string[];
    priority_improvements: string[];
  };
  keyword_optimization: {
    keywords_found: string[];
    keywords_missing: string[];
    optimization_tips: string[];
  };
  job_matches: {
    matches: Array<{
      job_title: string;
      company: string;
      match_percentage: number;
    }>;
  };
  score_breakdown?: Record<string, number>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId } = await req.json();

    if (!resumeId) {
      return new Response(
        JSON.stringify({ error: 'Resume ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting analysis for resume:', resumeId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      console.error('Resume not found:', resumeError);
      return new Response(
        JSON.stringify({ error: 'Resume not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: jobs } = await supabase
      .from('jobs')
      .select('title, company, skills_required, experience_level, domain')
      .eq('is_active', true)
      .limit(20);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const parsed = resume.parsed_data;
    const resumeText =
      typeof parsed === 'string'
        ? parsed
        : JSON.stringify(parsed || {}, null, 2);

    console.log('========== RESUME SCORING ==========');
    console.log('Resume ID:', resumeId);
    console.log('File name:', resume.file_name);
    console.log('Extracted text length:', resumeText.length);
    console.log('Resume text preview:', resumeText.substring(0, 300));

    if (!resumeText || resumeText.length < 80) {
      console.warn('Extraction too short — text length is', resumeText.length);
    }

    // ============================================================
    // DETERMINISTIC SCORING (independent of AI)
    // ============================================================
    const jobKeywords: string[] = [];
    for (const j of (jobs || [])) {
      jobKeywords.push(...(j.skills_required || []));
    }

    const structure = scoreStructure(resumeText);
    const contact = scoreContact(resumeText);
    const skills = scoreSkills(resumeText);
    const experience = scoreExperience(resumeText);
    const education = scoreEducation(resumeText);
    const keywords = scoreKeywords(resumeText, jobKeywords);
    const readability = scoreReadability(resumeText);

    const breakdown = {
      structure: structure.score,
      contact: contact.score,
      skills: skills.score,
      experience: experience.score,
      education: education.score,
      keywords: keywords.score,
      readability: readability.score,
    };

    const atsScore = computeAtsScore(breakdown);
    // Overall is the same weighted composite — deterministic, reproducible.
    const overallScore = atsScore;

    console.log('--- DETERMINISTIC SCORE BREAKDOWN ---');
    console.log('Structure   (15%):', breakdown.structure);
    console.log('Contact     (10%):', breakdown.contact);
    console.log('Skills      (20%):', breakdown.skills);
    console.log('Experience  (20%):', breakdown.experience);
    console.log('Education   (10%):', breakdown.education);
    console.log('Keywords    (15%):', breakdown.keywords);
    console.log('Readability (10%):', breakdown.readability);
    console.log('=> ATS / OVERALL:', atsScore);
    console.log('Detected skills count:', skills.detected.length);

    const systemPrompt = `You are an expert resume analyzer, career advisor, and ATS (Applicant Tracking System) specialist with 15+ years of experience in HR and recruitment. Your analysis should be thorough, actionable, and based on current industry standards.

SCORING GUIDELINES:
- Overall Score (0-100): Based on content quality, structure, achievements, and marketability
  - 90-100: Exceptional resume with quantified achievements, clear progression, strong keywords
  - 75-89: Strong resume with good content but minor improvements needed
  - 60-74: Average resume with notable gaps or missing elements
  - 40-59: Below average, needs significant improvements
  - Below 40: Major issues, requires complete restructuring

- ATS Score (0-100): Based on keyword optimization, formatting, and machine readability
  - Consider: proper section headers, keyword density, standard formatting, no tables/graphics issues

ANALYSIS REQUIREMENTS:
1. Identify ALL technical and soft skills mentioned
2. Compare against industry standards for the candidate's field
3. Provide specific, actionable improvement suggestions
4. Match against available jobs based on skill overlap
5. Be honest but constructive - don't inflate scores

Always respond with valid JSON only.`;

    const aiResumeText = resumeText.length > 12000 ? resumeText.slice(0, 12000) : resumeText;

    const analysisPrompt = `Analyze this resume thoroughly:

FILE: ${resume.file_name}
TYPE: ${resume.file_type}

RESUME CONTENT:
"""
${aiResumeText}
"""

AVAILABLE JOBS FOR MATCHING:
${JSON.stringify(jobs || [], null, 2)}

Provide analysis in this exact JSON structure:
{
  "overall_score": <realistic score 0-100 based on actual content quality>,
  "ats_score": <realistic score 0-100 based on ATS compatibility>,
  "skill_analysis": {
    "detected_skills": [<list ALL skills found in resume>],
    "missing_skills": [<important skills NOT in resume but relevant to their field>],
    "skill_categories": {
      "Technical Skills": [<programming, tools, technologies>],
      "Soft Skills": [<communication, leadership, etc.>],
      "Domain Knowledge": [<industry-specific knowledge>],
      "Certifications": [<any certifications mentioned>]
    }
  },
  "improvement_suggestions": {
    "suggestions": [<5-7 specific, actionable suggestions>],
    "priority_improvements": [<top 3 most impactful changes needed>]
  },
  "keyword_optimization": {
    "keywords_found": [<industry keywords present>],
    "keywords_missing": [<important keywords to add>],
    "optimization_tips": [<specific tips for better keyword usage>]
  },
  "job_matches": {
    "matches": [
      {"job_title": "...", "company": "...", "match_percentage": <based on actual skill overlap>}
    ]
  }
}

IMPORTANT:
- If resume content is limited or unclear, reflect this in lower scores
- Be specific about what's missing or needs improvement
- Match percentages should reflect actual skill overlap with job requirements
- Don't fabricate skills that aren't in the resume`;

    console.log('Calling Lovable AI for qualitative analysis (suggestions only)...');

    const aiResponse = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent, factual responses
      }),
    }, 20000);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI Response received, length:', aiContent.length);

    let aiParsed: Partial<ResumeAnalysis> = {};
    try {
      let cleanedContent = aiContent.trim();
      cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '');
      cleanedContent = cleanedContent.replace(/\s*```$/i, '');
      cleanedContent = cleanedContent.trim();
      aiParsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      aiParsed = {};
    }

    // ============================================================
    // MERGE: Deterministic scores + AI qualitative feedback
    // ============================================================
    const aiSkillCats = aiParsed.skill_analysis?.skill_categories || {
      'Technical Skills': skills.detected.filter((s) =>
        !['leadership','communication','teamwork','problem solving','project management','collaboration','mentoring','presentation','analytical'].includes(s)
      ),
      'Soft Skills': skills.detected.filter((s) =>
        ['leadership','communication','teamwork','problem solving','project management','collaboration','mentoring','presentation','analytical'].includes(s)
      ),
      'Domain Knowledge': [],
      'Certifications': [],
    };

    // Job matching by skill overlap
    const detectedSet = new Set(skills.detected.map((s) => s.toLowerCase()));
    const jobMatches = (jobs || [])
      .map((j: any) => {
        const req: string[] = (j.skills_required || []).map((s: string) => s.toLowerCase());
        if (req.length === 0) return { job_title: j.title, company: j.company, match_percentage: 0 };
        const hits = req.filter((r) => detectedSet.has(r) || resumeText.toLowerCase().includes(r)).length;
        return {
          job_title: j.title,
          company: j.company,
          match_percentage: Math.round((hits / req.length) * 100),
        };
      })
      .sort((a: any, b: any) => b.match_percentage - a.match_percentage)
      .slice(0, 6);

    // Build improvement suggestions deterministically when categories are weak
    const autoSuggestions: string[] = [];
    if (breakdown.contact < 70) autoSuggestions.push('Add complete contact info: email, phone, LinkedIn, and location.');
    if (breakdown.structure < 70) autoSuggestions.push('Use clear section headers: Summary, Experience, Education, Skills, Projects.');
    if (breakdown.skills < 60) autoSuggestions.push('List more relevant technical skills explicitly (frameworks, tools, languages).');
    if (breakdown.experience < 60) autoSuggestions.push('Quantify achievements with metrics (%, $, time saved, users impacted).');
    if (breakdown.education < 60) autoSuggestions.push('Include your degree, institution, and graduation year.');
    if (breakdown.keywords < 60) autoSuggestions.push('Add industry keywords and strong action verbs (led, built, optimized, delivered).');
    if (breakdown.readability < 60) autoSuggestions.push('Use concise bullet points; aim for 1–2 pages of well-structured content.');

    const aiSuggestions = aiParsed.improvement_suggestions?.suggestions || [];
    const mergedSuggestions = [...new Set([...autoSuggestions, ...aiSuggestions])].slice(0, 8);

    const analysis: ResumeAnalysis = {
      overall_score: overallScore,
      ats_score: atsScore,
      skill_analysis: {
        detected_skills: [...new Set([...skills.detected, ...(aiParsed.skill_analysis?.detected_skills || [])])].slice(0, 30),
        missing_skills: (aiParsed.skill_analysis?.missing_skills || []).slice(0, 12),
        skill_categories: aiSkillCats,
      },
      improvement_suggestions: {
        suggestions: mergedSuggestions,
        priority_improvements: aiParsed.improvement_suggestions?.priority_improvements?.slice(0, 3) || autoSuggestions.slice(0, 3),
      },
      keyword_optimization: {
        keywords_found: keywords.found,
        keywords_missing: keywords.missing,
        optimization_tips: aiParsed.keyword_optimization?.optimization_tips || [
          'Mirror job-description keywords verbatim where truthful.',
          'Lead bullets with measurable action verbs.',
          'Avoid tables, images, and unusual fonts for ATS parsing.',
        ],
      },
      job_matches: { matches: jobMatches },
      score_breakdown: breakdown,
    };

    console.log('Final scores -> overall:', analysis.overall_score, 'ats:', analysis.ats_score);

    console.log('Saving analysis to database...');

    const { data: savedAnalysis, error: saveError } = await supabase
      .from('resume_analyses')
      .insert({
        resume_id: resumeId,
        user_id: resume.user_id,
        overall_score: analysis.overall_score,
        ats_score: analysis.ats_score,
        skill_analysis: analysis.skill_analysis,
        improvement_suggestions: analysis.improvement_suggestions,
        keyword_optimization: analysis.keyword_optimization,
        job_matches: analysis.job_matches,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      throw saveError;
    }

    console.log('Analysis saved successfully:', savedAnalysis.id);

    return new Response(
      JSON.stringify({ success: true, analysisId: savedAnalysis.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-resume function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});