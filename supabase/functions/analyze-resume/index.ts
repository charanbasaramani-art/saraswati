import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Resume text length:', resumeText.length);
    console.log('Resume text preview:', resumeText.substring(0, 500));

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

    const analysisPrompt = `Analyze this resume thoroughly:

FILE: ${resume.file_name}
TYPE: ${resume.file_type}

RESUME CONTENT:
"""
${resumeText}
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

    console.log('Calling Lovable AI for analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
    });

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

    let analysis: ResumeAnalysis;
    try {
      let cleanedContent = aiContent.trim();
      // Remove markdown code blocks
      cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '');
      cleanedContent = cleanedContent.replace(/\s*```$/i, '');
      cleanedContent = cleanedContent.trim();
      
      analysis = JSON.parse(cleanedContent);
      
      // Validate and clamp scores
      analysis.overall_score = Math.max(0, Math.min(100, Math.round(analysis.overall_score || 0)));
      analysis.ats_score = Math.max(0, Math.min(100, Math.round(analysis.ats_score || 0)));
      
      console.log('Parsed scores - Overall:', analysis.overall_score, 'ATS:', analysis.ats_score);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI content:', aiContent.substring(0, 1000));
      
      // Provide honest fallback for failed parsing
      const hasLimitedContent = resumeText.length < 200;
      analysis = {
        overall_score: hasLimitedContent ? 35 : 55,
        ats_score: hasLimitedContent ? 30 : 50,
        skill_analysis: {
          detected_skills: [],
          missing_skills: ['Unable to fully analyze - please re-upload resume'],
          skill_categories: {
            'Technical Skills': [],
            'Soft Skills': [],
            'Domain Knowledge': [],
            'Certifications': [],
          },
        },
        improvement_suggestions: {
          suggestions: [
            'Upload a DOCX file for more accurate text extraction',
            'Ensure your resume contains clear section headers',
            'Include specific skills and technologies used',
            'Add quantifiable achievements with metrics',
            'List relevant certifications and education',
          ],
          priority_improvements: [
            'Re-upload resume in DOCX format for better analysis',
            'Ensure resume text is selectable (not scanned image)',
          ],
        },
        keyword_optimization: {
          keywords_found: [],
          keywords_missing: [],
          optimization_tips: [
            'Analysis was limited - please try uploading a DOCX file',
          ],
        },
        job_matches: {
          matches: [],
        },
      };
    }

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