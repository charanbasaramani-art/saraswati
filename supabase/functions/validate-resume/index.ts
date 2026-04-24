const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  isResume: boolean;
  confidence: number;
  detectedType: string;
  missingSections: string[];
  detectedSections: string[];
  reasoning: string;
  insight: string;
  canConvert: boolean;
  friendlyMessage: string;
}

function heuristicCheck(text: string) {
  const lower = text.toLowerCase();
  const sections = [
    { key: 'contact', patterns: [/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/, /\+?\d[\d\s().-]{7,}/, /linkedin\.com\//] },
    { key: 'education', patterns: [/\beducation\b/, /\bbachelor\b/, /\bmaster\b/, /\bb\.?tech\b/, /\bm\.?tech\b/, /\buniversity\b/, /\bdegree\b/, /\bgpa\b/, /\bcgpa\b/] },
    { key: 'experience', patterns: [/\b(work\s+)?experience\b/, /\bemployment\b/, /\bintern(ship)?\b/, /\bworked\s+at\b/, /\b\d{4}\s*[-–]\s*(\d{4}|present)\b/i] },
    { key: 'skills', patterns: [/\bskills?\b/, /\btechnologies\b/, /\bproficient\s+in\b/, /\b(java|python|javascript|react|node|sql|c\+\+)\b/] },
    { key: 'projects', patterns: [/\bprojects?\b/, /\bcertifications?\b/, /\bachievements?\b/] },
    { key: 'name', patterns: [/\bresume\b/, /\bcurriculum\s+vitae\b/, /\bcv\b/] },
  ];
  const detected: string[] = [];
  const missing: string[] = [];
  for (const s of sections) {
    if (s.patterns.some((p) => p.test(lower))) detected.push(s.key);
    else missing.push(s.key);
  }
  return { detected, missing };
}

function detectFileType(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(account\s+number|balance|transaction|debit|credit|statement\s+date|ifsc)\b/.test(lower)) return 'Bank / Financial Statement';
  if (/\b(invoice|bill\s+to|tax|gst|amount\s+due)\b/.test(lower)) return 'Invoice / Receipt';
  if (/\b(dear\s+\w+|sincerely|yours\s+truly|to\s+whom)\b/.test(lower)) return 'Letter / Cover Letter';
  if (/\b(abstract|introduction|references|conclusion|methodology)\b/.test(lower) && lower.length > 2000) return 'Research Paper / Article';
  if (/\b(chapter|once\s+upon|the\s+end)\b/.test(lower)) return 'Story / Book Excerpt';
  if (text.trim().length < 100) return 'Empty or Image-based Document';
  if (!/[.!?]/.test(text)) return 'Notes / Unstructured Text';
  return 'General Document';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, fileName } = await req.json();
    const cleanText = (text || '').toString().trim();

    // Empty / unreadable
    if (cleanText.length < 30) {
      const result: ValidationResult = {
        isResume: false,
        confidence: 0,
        detectedType: cleanText.length === 0 ? 'Empty File' : 'Unreadable / Image-only',
        missingSections: ['contact', 'education', 'experience', 'skills', 'projects'],
        detectedSections: [],
        reasoning: 'No readable text could be extracted from this file.',
        insight: 'The file may be a scanned image, corrupted, or password-protected. Try a text-based PDF or DOCX.',
        canConvert: false,
        friendlyMessage: "I couldn't read any meaningful content from this file.",
      };
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { detected, missing } = heuristicCheck(cleanText);
    const heuristicScore = Math.round((detected.length / 6) * 100);
    const detectedType = detectFileType(cleanText);

    // Ask AI for nuanced verdict
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    let aiVerdict: Partial<ValidationResult> = {};

    if (apiKey) {
      try {
        const prompt = `You are an intelligent resume classifier. Analyze the text and respond ONLY with strict JSON.

Text (first 4000 chars):
"""${cleanText.slice(0, 4000)}"""

Heuristic detected sections: ${detected.join(', ') || 'none'}
Heuristic missing sections: ${missing.join(', ') || 'none'}

Return JSON with this exact shape:
{
  "isResume": boolean,
  "confidence": number 0-100,
  "detectedType": "short label like 'Resume', 'Bank Statement', 'Notes', 'Cover Letter', 'Image Content', etc.",
  "reasoning": "1-2 sentence explanation of what you see in the document",
  "insight": "1 sentence on why it does/doesn't qualify as a resume",
  "friendlyMessage": "warm conversational opening line for the user",
  "canConvert": boolean (true if the text contains personal info that could be turned into a resume)
}`;

        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You output strict JSON only. No markdown, no prose.' },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (aiRes.ok) {
          const data = await aiRes.json();
          const content = data.choices?.[0]?.message?.content || '{}';
          aiVerdict = JSON.parse(content);
        } else {
          console.error('AI gateway error', aiRes.status, await aiRes.text());
        }
      } catch (e) {
        console.error('AI verdict failed', e);
      }
    }

    const confidence = Math.round(
      typeof aiVerdict.confidence === 'number' ? aiVerdict.confidence * 0.7 + heuristicScore * 0.3 : heuristicScore,
    );
    const isResume = aiVerdict.isResume ?? confidence >= 55;

    const result: ValidationResult = {
      isResume,
      confidence,
      detectedType: aiVerdict.detectedType || (isResume ? 'Resume' : detectedType),
      missingSections: missing,
      detectedSections: detected,
      reasoning: aiVerdict.reasoning || `Detected ${detected.length} of 6 typical resume sections.`,
      insight: aiVerdict.insight || (isResume ? 'Looks like a valid resume.' : 'Key resume sections are missing or this content matches a different document type.'),
      friendlyMessage:
        aiVerdict.friendlyMessage ||
        (isResume ? 'Great — this looks like a resume!' : "This file doesn't appear to be a resume."),
      canConvert: aiVerdict.canConvert ?? cleanText.length > 200,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('validate-resume error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});