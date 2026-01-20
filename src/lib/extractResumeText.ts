import mammoth from "mammoth";

// Sanitize text to remove null bytes and invalid Unicode characters that Postgres can't handle
function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control chars except \t, \n, \r
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Extract readable text from PDF binary
function extractPdfText(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  
  const extractedParts: string[] = [];
  
  // Method 1: Extract text from parentheses (PDF text objects)
  const parenMatches = text.match(/\(([^)]+)\)/g) || [];
  for (const match of parenMatches) {
    const content = match.slice(1, -1);
    // Filter out PDF commands and keep readable text
    if (content.length > 1 && /[a-zA-Z]{2,}/.test(content) && !/^[A-Z]{1,2}\d/.test(content)) {
      extractedParts.push(content);
    }
  }
  
  // Method 2: Extract text between BT and ET markers (text blocks)
  const btEtMatches = text.match(/BT[\s\S]*?ET/g) || [];
  for (const block of btEtMatches) {
    const tjMatches = block.match(/\[([^\]]+)\]\s*TJ/g) || [];
    for (const tj of tjMatches) {
      const innerParen = tj.match(/\(([^)]+)\)/g) || [];
      for (const p of innerParen) {
        const content = p.slice(1, -1);
        if (content.length > 1 && /[a-zA-Z]/.test(content)) {
          extractedParts.push(content);
        }
      }
    }
  }
  
  // Method 3: Look for readable strings in the PDF
  const readableStrings = text.match(/[A-Za-z][A-Za-z0-9\s,.\-@:\/]{10,}/g) || [];
  for (const str of readableStrings) {
    if (!str.includes('/') || str.includes('@')) { // Keep email addresses
      extractedParts.push(str);
    }
  }
  
  // Deduplicate and join
  const uniqueParts = [...new Set(extractedParts)];
  return sanitizeText(uniqueParts.join(" "));
}

export async function extractResumeText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === "application/pdf") {
      const extractedText = extractPdfText(arrayBuffer);
      
      if (extractedText.length > 50) {
        return extractedText;
      }
      
      // Fallback: return filename info with note
      return `PDF Resume: ${file.name} (Text extraction limited - please upload DOCX for better analysis)`;
    }

    // DOCX - mammoth works well
    const result = await mammoth.extractRawText({ arrayBuffer });
    const docxText = sanitizeText(result.value || "");
    
    if (docxText.length > 50) {
      return docxText;
    }
    
    return `DOCX Resume: ${file.name}`;
  } catch (e) {
    console.error("extractResumeText failed", e);
    return `Resume: ${file.name} (extraction failed)`;
  }
}