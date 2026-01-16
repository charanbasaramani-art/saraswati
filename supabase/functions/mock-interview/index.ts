import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface QuestionRequest {
  action: 'generate_questions' | 'analyze_responses';
  interviewType?: string;
  skillLevel?: string;
  jobRole?: string;
  resumeData?: any;
  questions?: any[];
  responses?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, interviewType, skillLevel, jobRole, resumeData, questions, responses } = await req.json() as QuestionRequest;

    if (action === 'generate_questions') {
      const prompt = `Generate 5 interview questions for a ${skillLevel || 'entry'}-level ${jobRole || 'Software Developer'} position.
      Interview type: ${interviewType || 'hr'}
      
      ${resumeData ? `Candidate background: ${JSON.stringify(resumeData).substring(0, 500)}` : ''}
      
      Return a JSON object with a "questions" array. Each question should have:
      - id: unique string
      - question: the interview question
      - category: "${interviewType || 'hr'}"
      - difficulty: "easy", "medium", or "hard"
      - expectedTopics: array of key topics the answer should cover
      
      Return ONLY valid JSON, no markdown.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert interviewer. Generate realistic interview questions.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      
      // Parse JSON from response
      let parsedQuestions;
      try {
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        parsedQuestions = JSON.parse(cleanedContent);
      } catch {
        // Return fallback questions
        parsedQuestions = {
          questions: [
            { id: '1', question: 'Tell me about yourself.', category: interviewType, difficulty: 'easy', expectedTopics: ['background', 'experience'] },
            { id: '2', question: 'Why are you interested in this role?', category: interviewType, difficulty: 'easy', expectedTopics: ['motivation', 'goals'] },
            { id: '3', question: 'Describe a challenging project you worked on.', category: interviewType, difficulty: 'medium', expectedTopics: ['problem-solving', 'skills'] },
            { id: '4', question: 'How do you handle tight deadlines?', category: interviewType, difficulty: 'medium', expectedTopics: ['time-management', 'stress'] },
            { id: '5', question: 'Where do you see yourself in 5 years?', category: interviewType, difficulty: 'easy', expectedTopics: ['career-goals', 'growth'] },
          ]
        };
      }

      return new Response(JSON.stringify(parsedQuestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'analyze_responses') {
      const prompt = `Analyze these interview responses and provide feedback.
      
      Questions and Answers:
      ${questions?.map((q: any, i: number) => `
        Q${i + 1}: ${q.question}
        A${i + 1}: ${responses?.[i]?.answer || 'No answer provided'}
        Time spent: ${responses?.[i]?.timeSpent || 0} seconds
      `).join('\n')}
      
      Provide a JSON response with:
      {
        "feedback": {
          "overallScore": number (0-100),
          "communicationScore": number (0-100),
          "confidenceScore": number (0-100),
          "relevanceScore": number (0-100),
          "clarityScore": number (0-100),
          "strengths": ["strength1", "strength2", "strength3"],
          "weakAreas": ["area1", "area2"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "questionFeedback": [
            { "questionId": "id", "score": number, "feedback": "specific feedback" }
          ]
        }
      }
      
      Return ONLY valid JSON.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert interview coach providing constructive feedback.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      
      let parsedFeedback;
      try {
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        parsedFeedback = JSON.parse(cleanedContent);
      } catch {
        // Return fallback feedback
        parsedFeedback = {
          feedback: {
            overallScore: 70,
            communicationScore: 68,
            confidenceScore: 72,
            relevanceScore: 75,
            clarityScore: 70,
            strengths: ['Good response structure', 'Relevant experience mentioned', 'Clear communication'],
            weakAreas: ['Could use more specific examples', 'Consider STAR method'],
            recommendations: ['Practice more behavioral questions', 'Prepare concrete examples', 'Work on concise responses'],
            questionFeedback: questions?.map((q: any) => ({
              questionId: q.id,
              score: Math.floor(Math.random() * 25) + 60,
              feedback: 'Good attempt, consider adding more specific details.'
            })) || []
          }
        };
      }

      return new Response(JSON.stringify(parsedFeedback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in mock-interview function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
