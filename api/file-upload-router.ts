// @ts-nocheck
import { z } from "zod";
import { createRouter, authedQuery } from "./middleware.js";

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
        const text = buffer.toString("utf-8");

        // Clean up common artifacts from DOCX/PDF text extraction
        const cleaned = text
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
          .trim();

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
        };
      } catch (err) {
        console.error("[FileUpload] Parse error:", err);
        throw new Error("Failed to parse file. Please upload a valid text file.");
      }
    }),
});
