import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionRequest {
  resumeData: {
    skills: string[];
    experience: string;
    jobRole: string;
  };
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, language = 'en' }: QuestionRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const languageInstruction = language === 'hi' 
      ? 'Respond in Hindi (Devanagari script).' 
      : language === 'te' 
      ? 'Respond in Telugu script.' 
      : 'Respond in English.';

    const prompt = `You are an expert interview coach. Based on the following resume information, generate interview questions.

Resume Information:
- Skills: ${resumeData.skills?.join(', ') || 'Not specified'}
- Experience: ${resumeData.experience || 'Not specified'}
- Target Job Role: ${resumeData.jobRole || 'Software Developer'}

${languageInstruction}

Generate exactly 15 interview questions in the following JSON format:
{
  "questions": [
    {
      "id": 1,
      "category": "technical" | "hr" | "behavioral",
      "difficulty": "easy" | "medium" | "hard",
      "question": "The question text",
      "answer": "A comprehensive sample answer",
      "tip": "A helpful tip for answering this question"
    }
  ]
}

Include:
- 5 Technical questions (related to the skills mentioned)
- 5 HR questions (about career goals, salary expectations, company fit)
- 5 Behavioral questions (STAR method scenarios)

Distribute difficulty evenly across easy, medium, and hard.
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
    
    // Parse the JSON response
    let questions;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback questions
      questions = {
        questions: [
          { id: 1, category: 'technical', difficulty: 'easy', question: 'Explain your technical skills.', answer: 'Describe your core competencies and how you apply them.', tip: 'Be specific with examples.' },
          { id: 2, category: 'hr', difficulty: 'easy', question: 'Tell me about yourself.', answer: 'Give a brief professional summary.', tip: 'Keep it under 2 minutes.' },
          { id: 3, category: 'behavioral', difficulty: 'medium', question: 'Describe a challenging project.', answer: 'Use the STAR method to explain.', tip: 'Focus on your contribution and results.' },
        ]
      };
    }

    return new Response(
      JSON.stringify(questions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-interview-questions:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to generate questions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
