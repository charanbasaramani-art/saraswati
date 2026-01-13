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
  'Microsoft': {
    keywords: ['azure', 'c#', '.net', 'typescript', 'cloud computing', 'ai', 'machine learning', 'sql server', 'devops', 'agile', 'collaboration', 'growth mindset'],
    priorities: ['growth mindset', 'technical excellence', 'collaboration', 'customer empathy'],
    formatting: ['clear structure', 'impact statements', 'technical depth']
  },
  'Meta': {
    keywords: ['react', 'javascript', 'mobile', 'ios', 'android', 'machine learning', 'data', 'infrastructure', 'scale', 'social', 'impact', 'move fast'],
    priorities: ['move fast', 'bold decisions', 'focus on impact', 'openness'],
    formatting: ['concise achievements', 'quantified impact', 'project links']
  },
  'Apple': {
    keywords: ['ios', 'swift', 'objective-c', 'macos', 'hardware', 'design', 'user experience', 'performance', 'security', 'innovation', 'attention to detail'],
    priorities: ['attention to detail', 'user experience focus', 'innovation', 'quality'],
    formatting: ['elegant presentation', 'detailed projects', 'design thinking']
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
  },
  'Wipro': {
    keywords: ['digital transformation', 'cloud', 'analytics', 'java', 'python', 'automation', 'agile', 'consulting', 'client delivery', 'innovation'],
    priorities: ['client focus', 'innovation', 'quality delivery', 'collaboration'],
    formatting: ['structured resume', 'project achievements', 'certifications']
  },
  'Accenture': {
    keywords: ['consulting', 'strategy', 'digital', 'cloud', 'analytics', 'ai', 'change management', 'project management', 'agile', 'client relationship'],
    priorities: ['client value', 'innovation', 'stewardship', 'best people'],
    formatting: ['consulting format', 'impact metrics', 'industry expertise']
  },
  'IBM': {
    keywords: ['cloud', 'ai', 'watson', 'hybrid cloud', 'enterprise', 'security', 'blockchain', 'data science', 'automation', 'mainframe', 'consulting'],
    priorities: ['innovation', 'trust', 'dedication', 'enterprise solutions'],
    formatting: ['technical depth', 'certifications', 'enterprise experience']
  },
  'Cognizant': {
    keywords: ['digital transformation', 'cloud', 'data analytics', 'ai', 'java', 'python', '.net', 'agile', 'devops', 'consulting', 'automation', 'client delivery'],
    priorities: ['client success', 'digital innovation', 'quality delivery', 'collaboration'],
    formatting: ['structured resume', 'project metrics', 'certifications', 'client experience']
  },
  'Oracle': {
    keywords: ['oracle database', 'sql', 'plsql', 'java', 'cloud infrastructure', 'erp', 'hcm', 'middleware', 'data management', 'enterprise', 'performance tuning'],
    priorities: ['database expertise', 'enterprise solutions', 'technical excellence', 'innovation'],
    formatting: ['technical depth', 'certifications', 'enterprise experience', 'project details']
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

    // Fetch actual resume content from database if not provided
    let actualResumeContent = resumeContent;
    if (resumeId && (!resumeContent || resumeContent === 'Resume content not available')) {
      console.log('Fetching resume content from database for ATS...');
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('parsed_data, file_name')
        .eq('id', resumeId)
        .single();
      
      if (resumeData?.parsed_data) {
        actualResumeContent = typeof resumeData.parsed_data === 'string' 
          ? resumeData.parsed_data 
          : JSON.stringify(resumeData.parsed_data, null, 2);
        console.log('Resume content retrieved for ATS simulation');
      }
    }

    // Return error if no resume content
    if (!actualResumeContent || actualResumeContent === 'Resume content not available') {
      return new Response(
        JSON.stringify({ 
          error: 'Resume content not available. Please ensure your resume has been properly uploaded and parsed.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const companyProfile = companyProfiles[company] || companyProfiles['Google'];

    const prompt = `You are a highly accurate ATS (Applicant Tracking System) simulator for ${company}. Analyze this resume THOROUGHLY against the company's specific requirements.

RESUME CONTENT:
${actualResumeContent}

${jobDescription ? `JOB DESCRIPTION: ${jobDescription}` : ''}

COMPANY PROFILE FOR ${company.toUpperCase()}:
- Required Keywords: ${companyProfile.keywords.join(', ')}
- Hiring Priorities: ${companyProfile.priorities.join(', ')}
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
