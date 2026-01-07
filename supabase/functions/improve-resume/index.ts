import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImproveRequest {
  resumeContent: string;
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, language = 'en' }: ImproveRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const languageInstruction = language === 'hi' 
      ? 'Respond in Hindi (Devanagari script).' 
      : language === 'te' 
      ? 'Respond in Telugu script.' 
      : 'Respond in English.';

    const prompt = `You are an expert resume coach and ATS optimization specialist. Analyze the following resume content and provide detailed improvement suggestions.

Resume Content:
${resumeContent || 'No specific content provided - provide general resume improvement advice'}

${languageInstruction}

Provide analysis in the following JSON format:
{
  "weakSections": [
    {
      "section": "Section name (e.g., Summary, Experience, Skills)",
      "issue": "Description of the problem",
      "severity": "high" | "medium" | "low"
    }
  ],
  "bulletPointImprovements": [
    {
      "original": "Original bullet point or description",
      "improved": "Improved version with action verbs and metrics",
      "explanation": "Why this improvement helps"
    }
  ],
  "grammarIssues": [
    {
      "text": "Text with issue",
      "correction": "Corrected text",
      "type": "grammar" | "spelling" | "punctuation" | "formatting"
    }
  ],
  "recommendations": [
    {
      "category": "content" | "formatting" | "keywords" | "structure",
      "title": "Recommendation title",
      "description": "Detailed actionable recommendation",
      "priority": "high" | "medium" | "low"
    }
  ],
  "overallScore": 75,
  "summary": "Brief overall assessment of the resume"
}

Provide at least:
- 3 weak sections identified
- 5 bullet point improvements
- 3 grammar/formatting issues
- 5 actionable recommendations

Return ONLY valid JSON, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    let improvements;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        improvements = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback improvements
      improvements = {
        weakSections: [
          { section: 'Summary', issue: 'Could be more impactful', severity: 'medium' }
        ],
        bulletPointImprovements: [
          { original: 'Worked on projects', improved: 'Led 5+ cross-functional projects resulting in 20% efficiency gains', explanation: 'Added metrics and action verbs' }
        ],
        grammarIssues: [],
        recommendations: [
          { category: 'content', title: 'Add Metrics', description: 'Quantify achievements with numbers and percentages', priority: 'high' }
        ],
        overallScore: 70,
        summary: 'Resume has potential but needs optimization for ATS systems.'
      };
    }

    return new Response(
      JSON.stringify(improvements),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in improve-resume:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to analyze resume' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
