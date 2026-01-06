import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context: {
    hasResume: boolean;
    resumeScore?: number;
    userName?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context }: ChatRequest = await req.json();

    const systemPrompt = `You are ResumeAI Assistant, a helpful and professional AI assistant for the ResumeAI platform - an AI-powered resume analysis tool.

Your role is to:
- Help users understand how to upload and analyze their resumes
- Explain resume scores and what they mean
- Provide guidance on skill gaps and improvements
- Give job recommendation guidance
- Help with platform navigation

Context about the current user:
- Has uploaded resume: ${context.hasResume ? 'Yes' : 'No'}
${context.resumeScore ? `- Latest resume score: ${context.resumeScore}/100` : ''}
${context.userName ? `- User name: ${context.userName}` : ''}

Guidelines:
- Be concise but helpful (2-3 sentences typically)
- Use a professional, friendly tone
- If user hasn't uploaded a resume yet, guide them to do so
- Provide actionable advice
- Don't make up specific scores or data you don't have
- For navigation questions, reference: Dashboard, Jobs, Analysis Results pages`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      
      // Fallback to rule-based responses
      const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
      let fallbackResponse = "I'm here to help! You can ask me about uploading resumes, understanding your scores, or finding job recommendations.";
      
      if (lastMessage.includes('upload') || lastMessage.includes('resume')) {
        fallbackResponse = context.hasResume 
          ? "Great! I see you've uploaded a resume. You can view your analysis results in the Dashboard or upload a new one to get updated insights."
          : "To upload your resume, go to the Dashboard and use the Resume Upload section. We support PDF and DOCX formats. Once uploaded, our AI will analyze it automatically!";
      } else if (lastMessage.includes('score') || lastMessage.includes('analysis')) {
        fallbackResponse = context.resumeScore 
          ? `Your resume scored ${context.resumeScore}/100. This score reflects content quality, formatting, and keyword optimization. Check the Analysis Results page for detailed insights!`
          : "Once you upload a resume, you'll receive a comprehensive score covering content quality, ATS compatibility, and skill alignment. Upload now to get started!";
      } else if (lastMessage.includes('job') || lastMessage.includes('recommend')) {
        fallbackResponse = "Visit the Jobs page to see positions matching your skills. Our AI matches your resume keywords with job requirements for personalized recommendations!";
      } else if (lastMessage.includes('skill') || lastMessage.includes('gap') || lastMessage.includes('improve')) {
        fallbackResponse = "Your Analysis Results page shows skill gaps based on your target roles. Focus on adding relevant keywords and quantifiable achievements to improve your score!";
      } else if (lastMessage.includes('help') || lastMessage.includes('how')) {
        fallbackResponse = "I can help with: 1) Uploading resumes, 2) Understanding scores, 3) Finding skill gaps, 4) Job recommendations, 5) Platform navigation. What would you like to know?";
      }

      return new Response(
        JSON.stringify({ message: fallbackResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || "I'm sorry, I couldn't process that. How can I help you?";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        message: "I'm here to help! You can ask me about uploading resumes, understanding your scores, or finding job recommendations." 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
