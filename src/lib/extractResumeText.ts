import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractResumeText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === "application/pdf") {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => (typeof item?.str === "string" ? item.str : ""))
          .filter(Boolean)
          .join(" ");
        pages.push(pageText);
      }

      return pages.join("\n\n").trim();
    }

    // DOCX
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result.value || "").trim();
  } catch (e) {
    console.error("extractResumeText failed", e);
    return "";
  }
}
