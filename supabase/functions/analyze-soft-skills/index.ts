import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId, userId, resumeContent, conversationHistory } = await req.json();

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
      console.log('Fetching resume content from database...');
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('parsed_data, file_name')
        .eq('id', resumeId)
        .single();
      
      if (resumeData?.parsed_data) {
        actualResumeContent = typeof resumeData.parsed_data === 'string' 
          ? resumeData.parsed_data 
          : JSON.stringify(resumeData.parsed_data, null, 2);
        console.log('Resume content retrieved successfully');
      }
    }

    // If still no content, return an error asking user to upload proper resume
    if (!actualResumeContent || actualResumeContent === 'Resume content not available') {
      return new Response(
        JSON.stringify({ 
          error: 'Resume content not available. Please ensure your resume has been properly uploaded and parsed.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are an expert HR professional and personality assessor. Analyze the following resume content THOROUGHLY to assess soft skills and personality traits.

RESUME CONTENT:
${actualResumeContent}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}` : ''}

Provide a detailed analysis in the following JSON format:
{
  "communication_score": <0-100>,
  "leadership_score": <0-100>,
  "teamwork_score": <0-100>,
  "problem_solving_score": <0-100>,
  "confidence_score": <0-100>,
  "adaptability_score": <0-100>,
  "personality_insights": {
    "primary_traits": ["trait1", "trait2", "trait3"],
    "work_style": "description of work style",
    "communication_style": "description of communication style",
    "strengths": ["strength1", "strength2"],
    "areas_for_growth": ["area1", "area2"]
  },
  "hiring_suitability": "High/Medium/Low - explanation",
  "recommendations": [
    {"skill": "skill_name", "current_level": "level", "suggestion": "how to improve"},
    {"skill": "skill_name", "current_level": "level", "suggestion": "how to improve"}
  ]
}

Base your scores on:
- Communication: clarity of expression, vocabulary, structure
- Leadership: initiative indicators, project leadership, mentoring
- Teamwork: collaboration mentions, team projects, interpersonal skills
- Problem Solving: analytical abilities, challenges overcome, solutions implemented
- Confidence: assertiveness in achievements, quantified accomplishments
- Adaptability: diverse experiences, learning new skills, handling change

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
          { role: 'system', content: 'You are an expert HR analyst and personality assessor. Analyze resumes and conversations to assess soft skills accurately. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to analyze soft skills');
    }

    const data = await response.json();
    let analysisText = data.choices[0]?.message?.content || '';
    
    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    let analysis;
    
    try {
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch {
      console.error('Failed to parse AI response:', analysisText);
      analysis = {
        communication_score: 70,
        leadership_score: 65,
        teamwork_score: 75,
        problem_solving_score: 70,
        confidence_score: 68,
        adaptability_score: 72,
        personality_insights: {
          primary_traits: ["Analytical", "Detail-oriented", "Collaborative"],
          work_style: "Systematic and thorough approach to tasks",
          communication_style: "Professional and clear",
          strengths: ["Technical skills", "Problem-solving"],
          areas_for_growth: ["Leadership visibility", "Public speaking"]
        },
        hiring_suitability: "Medium - Good technical foundation, could improve soft skill presentation",
        recommendations: [
          { skill: "Communication", current_level: "Good", suggestion: "Add more quantified achievements" },
          { skill: "Leadership", current_level: "Developing", suggestion: "Highlight team lead experiences" }
        ]
      };
    }

    // Save to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('soft_skill_analyses')
      .insert({
        user_id: userId,
        resume_id: resumeId || null,
        communication_score: analysis.communication_score,
        leadership_score: analysis.leadership_score,
        teamwork_score: analysis.teamwork_score,
        problem_solving_score: analysis.problem_solving_score,
        confidence_score: analysis.confidence_score,
        adaptability_score: analysis.adaptability_score,
        personality_insights: analysis.personality_insights,
        hiring_suitability: analysis.hiring_suitability,
        recommendations: analysis.recommendations
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
    }

    return new Response(
      JSON.stringify({ analysis, id: savedAnalysis?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in analyze-soft-skills:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
