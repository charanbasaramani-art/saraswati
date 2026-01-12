import mammoth from "mammoth";

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
        return extractedText.trim();
      }
      
      // Fallback: return filename info
      return `PDF Resume: ${file.name}`;
    }

    // DOCX - mammoth works well
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result.value || "").trim();
  } catch (e) {
    console.error("extractResumeText failed", e);
    return "";
  }
}
