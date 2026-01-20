import mammoth from "mammoth";

// Sanitize text to remove null bytes and invalid Unicode characters that Postgres can't handle
function sanitizeText(text: string): string {
  // Remove null bytes (\u0000) and other control characters that break Postgres
  return text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control chars except \t, \n, \r
    .trim();
}

export async function extractResumeText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === "application/pdf") {
      // For PDFs, we'll read as text - many PDFs contain extractable text
      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      const text = textDecoder.decode(arrayBuffer);
      
      // Extract text between stream markers (common in PDFs)
      const textMatches = text.match(/\(([^)]+)\)/g) || [];
      const extractedText = textMatches
        .map(match => match.slice(1, -1))
        .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
        .join(" ");
      
      if (extractedText.length > 100) {
        return sanitizeText(extractedText);
      }
      
      // Fallback: return filename info
      return `PDF Resume: ${file.name}`;
    }

    // DOCX - mammoth works well
    const result = await mammoth.extractRawText({ arrayBuffer });
    return sanitizeText(result.value || "");
  } catch (e) {
    console.error("extractResumeText failed", e);
    return "";
  }
}
