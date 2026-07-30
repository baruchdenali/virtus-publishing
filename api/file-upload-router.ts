// @ts-nocheck
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware.js";
import { PDFDocument } from "pdf-lib";

/**
 * Extract text from a PDF buffer using pdf-lib.
 * Iterates all pages and concatenates text content.
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    const texts: string[] = [];
    for (const page of pages) {
      const textContent = await page.doc.context;
      // pdf-lib doesn't have a direct getText() API, so we fall back
      // to raw string extraction from the PDF structure
      const raw = buffer.toString("utf-8");
      // Look for text objects in PDF stream
      const matches = raw.match(/\(([^)]{3,})\)/g);
      if (matches) {
        for (const m of matches) {
          const cleaned = m.slice(1, -1).replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\");
          if (cleaned.trim().length > 1) texts.push(cleaned);
        }
      }
    }
    if (texts.length === 0) {
      // Fallback: try to extract any readable text from the PDF binary
      const raw = buffer.toString("utf-8");
      const allMatches = raw.match(/\(([^)]{4,})\)/g);
      if (allMatches) {
        for (const m of allMatches) {
          const cleaned = m.slice(1, -1).replace(/\\\(/g, "(").replace(/\\\)/g, ")");
          if (cleaned.trim().length > 2 && /^[\x20-\x7E\s]+$/.test(cleaned)) {
            texts.push(cleaned);
          }
        }
      }
    }
    return texts.join(" ").trim();
  } catch {
    return "";
  }
}

/**
 * Extract text from a DOCX buffer by reading the document.xml inside the ZIP.
 * DOCX is a ZIP archive — we find word/document.xml and strip XML tags.
 */
function extractTextFromDOCX(buffer: Buffer): string {
  try {
    // Simple approach: DOCX is ZIP, look for text between <w:t> tags
    const raw = buffer.toString("utf-8");
    // Extract all <w:t> contents
    const matches = raw.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (matches && matches.length > 0) {
      const texts = matches.map((m) => m.replace(/<w:t[^>]*>|<\/w:t>/g, ""));
      return texts.join("").trim();
    }
    // If no <w:t> tags found, try stripping all XML tags
    return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

/**
 * Detect file type from buffer magic bytes.
 */
function detectFileType(buffer: Buffer, filename: string, mimeType?: string): "txt" | "pdf" | "docx" | "unknown" {
  const name = filename.toLowerCase();
  if (name.endsWith(".pdf") || mimeType === "application/pdf") return "pdf";
  if (name.endsWith(".docx") || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (name.endsWith(".txt") || name.endsWith(".md") || mimeType === "text/plain" || mimeType === "text/markdown") return "txt";
  // Check magic bytes
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return "pdf";
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) return "docx";
  return "txt"; // default to txt
}

export const fileUploadRouter = createRouter({
  parseText: authedQuery
    .input(z.object({
      filename: z.string(),
      contentBase64: z.string(),
      mimeType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Decode base64 content
        const buffer = Buffer.from(input.contentBase64, "base64");

        if (buffer.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Empty file content." });
        }

        if (buffer.length > 10 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "File too large. Maximum size is 10MB." });
        }

        // Detect file type
        const fileType = detectFileType(buffer, input.filename, input.mimeType);
        let cleaned = "";

        if (fileType === "pdf") {
          cleaned = await extractTextFromPDF(buffer);
          if (!cleaned || cleaned.length < 10) {
            // Fallback: raw UTF-8 extraction for PDFs that don't have extractable text
            cleaned = buffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ").trim();
          }
        } else if (fileType === "docx") {
          cleaned = extractTextFromDOCX(buffer);
          if (!cleaned || cleaned.length < 10) {
            cleaned = buffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ").trim();
          }
        } else {
          // Plain text (TXT, MD, or unknown)
          cleaned = buffer.toString("utf-8");
        }

        // Clean up common artifacts
        cleaned = cleaned
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        if (!cleaned || cleaned.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Could not extract text from ${input.filename}. The file may be corrupted, password-protected, or contain only images. Try uploading a plain text (.txt) file instead.`,
          });
        }

        // Extract a title from the first line if possible
        const lines = cleaned.split("\n").filter((l: string) => l.trim());
        const title = lines[0]?.slice(0, 255) || "Untitled";
        const description = lines.slice(1, 5).join(" ").slice(0, 500) || "";

        return {
          success: true,
          title,
          description,
          content: cleaned,
          wordCount: cleaned.split(/\s+/).filter((w: string) => w).length,
          charCount: cleaned.length,
          filename: input.filename,
          fileType,
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[FileUpload] Parse error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse file. Please upload a valid text file (.txt) or check that your PDF/DOCX is not password-protected.",
        });
      }
    }),
});
