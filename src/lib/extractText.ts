import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
// Vite serves the worker as a URL-imported asset so it works in dev + build.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text +=
        content.items
          .map((it) => ("str" in it ? (it as { str: string }).str : ""))
          .join(" ") + "\n";
    }
    return text;
  }

  if (name.endsWith(".docx")) {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }

  throw new Error("UNSUPPORTED_TYPE");
}
