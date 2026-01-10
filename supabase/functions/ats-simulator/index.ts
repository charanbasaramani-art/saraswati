import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const companyProfiles: Record<string, { keywords: string[]; priorities: string[]; formatting: string[] }> = {
  'Google': {
    keywords: ['algorithm', 'data structures', 'scalability', 'machine learning', 'distributed systems', 'cloud', 'python', 'java', 'go', 'kubernetes', 'innovation', 'impact', 'leadership'],
    priorities: ['technical depth', 'problem solving', 'innovation', 'scalability experience'],
    formatting: ['clean layout', 'quantified achievements', 'project descriptions']
  },
  'Amazon': {
    keywords: ['customer obsession', 'ownership', 'leadership principles', 'aws', 'microservices', 'java', 'python', 'data', 'scale', 'delivery', 'metrics', 'optimization'],
    priorities: ['leadership principles alignment', 'results driven', 'customer focus'],
    formatting: ['STAR format achievements', 'metrics-driven results', 'action verbs']
  },
  'Infosys': {
    keywords: ['agile', 'scrum', 'java', 'spring', 'sql', 'oracle', 'sap', 'consulting', 'client management', 'delivery', 'testing', 'documentation'],
    priorities: ['project delivery', 'client communication', 'technical skills'],
    formatting: ['structured format', 'project details', 'certifications']
  },
  'TCS': {
    keywords: ['tcs', 'digital', 'transformation', 'java', 'python', 'sql', 'agile', 'devops', 'cloud', 'automation', 'testing', 'mainframe'],
    priorities: ['learning ability', 'adaptability', 'team collaboration'],
    formatting: ['clear sections', 'education details', 'training certifications']
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId, userId, company, resumeContent, jobDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const companyProfile = companyProfiles[company] || companyProfiles['Google'];

    const prompt = `You are an ATS (Applicant Tracking System) simulator for ${company}. Analyze this resume against the company's typical requirements.

Resume Content:
${resumeContent}

${jobDescription ? `Job Description: ${jobDescription}` : ''}

Company Profile for ${company}:
- Key Keywords: ${companyProfile.keywords.join(', ')}
- Priorities: ${companyProfile.priorities.join(', ')}
- Formatting expectations: ${companyProfile.formatting.join(', ')}

Provide ATS analysis in this exact JSON format:
{
  "ats_score": <0-100>,
  "passed": <true if score >= 70, false otherwise>,
  "keyword_relevance_score": <0-100>,
  "formatting_score": <0-100>,
  "skill_matching_score": <0-100>,
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "found_keywords": ["keyword1", "keyword2"],
  "optimization_suggestions": [
    {"category": "Keywords", "suggestion": "specific suggestion", "priority": "high/medium/low"},
    {"category": "Formatting", "suggestion": "specific suggestion", "priority": "high/medium/low"},
    {"category": "Content", "suggestion": "specific suggestion", "priority": "high/medium/low"}
  ],
  "section_analysis": {
    "experience": {"score": <0-100>, "feedback": "feedback"},
    "skills": {"score": <0-100>, "feedback": "feedback"},
    "education": {"score": <0-100>, "feedback": "feedback"},
    "format": {"score": <0-100>, "feedback": "feedback"}
  }
}

Evaluate based on:
1. Keyword matching with company's key terms
2. Resume formatting and structure
3. Skill alignment with company requirements
4. Achievement quantification
5. ATS-friendly formatting (no tables, images, complex layouts)

Return ONLY valid JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an ATS system simulator. Analyze resumes and provide detailed compatibility scores. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to simulate ATS');
    }

    const data = await response.json();
    let analysisText = data.choices[0]?.message?.content || '';
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    let analysis;
    
    try {
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch {
      console.error('Failed to parse AI response:', analysisText);
      analysis = {
        ats_score: 65,
        passed: false,
        keyword_relevance_score: 60,
        formatting_score: 70,
        skill_matching_score: 65,
        missing_keywords: companyProfile.keywords.slice(0, 5),
        found_keywords: [],
        optimization_suggestions: [
          { category: "Keywords", suggestion: "Add more industry-specific keywords", priority: "high" },
          { category: "Formatting", suggestion: "Use a simpler layout for ATS compatibility", priority: "medium" },
          { category: "Content", suggestion: "Quantify achievements with metrics", priority: "high" }
        ],
        section_analysis: {
          experience: { score: 65, feedback: "Add more quantified achievements" },
          skills: { score: 60, feedback: "Include more relevant technical skills" },
          education: { score: 75, feedback: "Good education section" },
          format: { score: 70, feedback: "Generally ATS-friendly format" }
        }
      };
    }

    // Save to database
    const { data: savedResult, error: saveError } = await supabase
      .from('ats_results')
      .insert({
        user_id: userId,
        resume_id: resumeId || null,
        company: company,
        ats_score: analysis.ats_score,
        passed: analysis.passed,
        keyword_relevance_score: analysis.keyword_relevance_score,
        formatting_score: analysis.formatting_score,
        skill_matching_score: analysis.skill_matching_score,
        missing_keywords: analysis.missing_keywords,
        optimization_suggestions: analysis.optimization_suggestions
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
    }

    return new Response(
      JSON.stringify({ analysis, id: savedResult?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in ats-simulator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
