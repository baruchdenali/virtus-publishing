// @ts-nocheck
/**
 * MODULE 3: AdGPT Production Router — Billing, Scraper, Encryption, Export
 * Isolated microservice middleware for internal staff only.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { virtusAiCampaigns, virtusClientLedgers } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { encryptPayload, decryptPayload, getCacheKey } from "./lib/crypto.js";

export const adgptRouter = createRouter({
  // -------------------------------------------------------------------
  // Campaign: generate a campaign asset bundle
  // -------------------------------------------------------------------
  generate: adminQuery
    .input(
      z.object({
        clientId: z.string().min(1),
        targetUrl: z.string().url(),
        bookTitle: z.string().min(1),
        bookAuthor: z.string().optional(),
        ugcScript: z.string().optional(),
        adHeadlines: z.string().optional(),
        platform: z.enum(["google", "meta", "tiktok", "mixed"]).default("mixed"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // 1. ATOMIC BILLING: debit one marketing credit
      const client = await db.select().from(virtusClientLedgers).where(eq(virtusClientLedgers.clientId, input.clientId)).limit(1);
      if (!client[0]) {
        // Auto-create ledger entry with credits based on tier
        const tierCredits: Record<string, number> = { creator: 3, professional: 10, publisher: 50, enterprise: 100 };
        const credits = tierCredits[input.clientId.split("_")[0] || "creator"] ?? 3;
        await db.insert(virtusClientLedgers).values({
          clientId: input.clientId,
          marketingCredits: credits,
          subscriptionTier: "creator",
          lastDebitTimestamp: new Date(),
        });
        return { error: "Ledger auto-created. Try again." };
      }

      // Check free/basic tier
      if (client[0].subscriptionTier === "free" || client[0].subscriptionTier === "basic") {
        return { error: "Client tier does not include marketing credits. Upgrade required." };
      }

      // Check credits
      if (client[0].marketingCredits <= 0) {
        return { error: "Insufficient marketing credits. Client has 0 credits remaining." };
      }

      // Atomic debit
      await db.update(virtusClientLedgers)
        .set({
          marketingCredits: sql`${virtusClientLedgers.marketingCredits} - 1`,
          lastDebitTimestamp: new Date(),
        })
        .where(eq(virtusClientLedgers.clientId, input.clientId));

      // 2. SCRAPE: parse target URL metadata
      let scrapedMeta = { title: input.bookTitle, description: "", author: input.bookAuthor || "", coverUrl: "" };
      try {
        const response = await fetch(input.targetUrl, { signal: AbortSignal.timeout(8000) });
        const html = await response.text();
        // Parse OG tags
        const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1];
        const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1];
        const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
        scrapedMeta = {
          title: ogTitle || input.bookTitle,
          description: ogDesc || "",
          author: input.bookAuthor || "",
          coverUrl: ogImage || "",
        };
      } catch (err) {
        console.log("[AdGPT] Scrape skipped:", (err as Error).message);
      }

      // 3. AI IMAGE: generate creative via DALL-E (if OPENAI_API_KEY)
      let generatedImageUrl = "";
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        try {
          const resp = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: `Professional book marketing creative: ${scrapedMeta.title} by ${scrapedMeta.author}. Elegant, eye-catching design with bold typography, warm colors, and a modern literary aesthetic. No text except the book title.`,
              size: "1024x1024",
              n: 1,
            }),
          });
          const data = await resp.json();
          generatedImageUrl = data.data?.[0]?.url || "";
        } catch (err) {
          console.log("[AdGPT] DALL-E skipped:", (err as Error).message);
        }
      }

      // 4. BUILD payload
      const campaignPayload = {
        clientId: input.clientId,
        targetUrl: input.targetUrl,
        bookTitle: scrapedMeta.title,
        bookAuthor: scrapedMeta.author,
        bookDescription: scrapedMeta.description,
        bookCoverUrl: scrapedMeta.coverUrl || generatedImageUrl,
        generatedImageUrl,
        ugcScript: input.ugcScript || "",
        adHeadlines: input.adHeadlines || "",
        platform: input.platform,
        keywords: generateKeywords(scrapedMeta.title, scrapedMeta.author),
        generatedAt: new Date().toISOString(),
        generatedBy: ctx.user.id,
      };

      // 5. ENCRYPT payload
      const { ciphertext, iv, authTag } = encryptPayload(campaignPayload);

      // 6. STORE
      const result = await db.insert(virtusAiCampaigns).values({
        associatedUrl: input.targetUrl,
        bookTitle: scrapedMeta.title,
        bookAuthor: scrapedMeta.author,
        bookCoverUrl: scrapedMeta.coverUrl || generatedImageUrl,
        encryptedPayload: ciphertext,
        iv,
        authTag,
        createdBy: ctx.user.id,
        campaignStatus: "draft",
      }).returning();

      return {
        success: true,
        campaignId: result[0].id,
        payload: campaignPayload,
        encrypted: { iv, authTag: authTag.slice(0, 8) + "..." },
        creditsRemaining: client[0].marketingCredits - 1,
      };
    }),

  // -------------------------------------------------------------------
  // Analytics: decrypt and return campaign by ID
  // -------------------------------------------------------------------
  analytics: adminQuery
    .input(z.object({ recordId: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(virtusAiCampaigns).where(eq(virtusAiCampaigns.id, input.recordId)).limit(1);
      if (!rows[0]) return { error: "Campaign not found" };
      const row = rows[0];
      const decrypted = decryptPayload({
        ciphertext: row.encryptedPayload,
        iv: row.iv,
        authTag: row.authTag,
      });
      return {
        campaignId: row.id,
        bookTitle: row.bookTitle,
        bookAuthor: row.bookAuthor,
        bookCoverUrl: row.bookCoverUrl,
        associatedUrl: row.associatedUrl,
        campaignStatus: row.campaignStatus,
        generatedAt: row.generatedAt,
        decryptedPayload: decrypted,
      };
    }),

  // -------------------------------------------------------------------
  // List all campaigns
  // -------------------------------------------------------------------
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: virtusAiCampaigns.id,
      bookTitle: virtusAiCampaigns.bookTitle,
      bookAuthor: virtusAiCampaigns.bookAuthor,
      bookCoverUrl: virtusAiCampaigns.bookCoverUrl,
      associatedUrl: virtusAiCampaigns.associatedUrl,
      campaignStatus: virtusAiCampaigns.campaignStatus,
      generatedAt: virtusAiCampaigns.generatedAt,
      createdBy: virtusAiCampaigns.createdBy,
    }).from(virtusAiCampaigns).orderBy(desc(virtusAiCampaigns.generatedAt));
  }),

  // -------------------------------------------------------------------
  // Client ledger: credits info
  // -------------------------------------------------------------------
  ledger: adminQuery
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(virtusClientLedgers).where(eq(virtusClientLedgers.clientId, input.clientId)).limit(1);
      if (!rows[0]) return { credits: 0, tier: "none", lastDebit: null };
      return { credits: rows[0].marketingCredits, tier: rows[0].subscriptionTier, lastDebit: rows[0].lastDebitTimestamp };
    }),

  // -------------------------------------------------------------------
  // PDF Export: generate a white-label marketing brief
  // -------------------------------------------------------------------
  exportPdf: adminQuery
    .input(z.object({ recordId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(virtusAiCampaigns).where(eq(virtusAiCampaigns.id, input.recordId)).limit(1);
      if (!rows[0]) return { error: "Campaign not found" };
      const row = rows[0];
      const decrypted = decryptPayload({ ciphertext: row.encryptedPayload, iv: row.iv, authTag: row.authTag }) as any;

      // Build PDF using pdf-lib (pure JS, no native deps)
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // US Letter
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = 720;
      const margin = 50;
      const lineHeight = 14;
      const pageWidth = 612;

      const drawText = (text: string, opts: { x?: number; y?: number; size?: number; color?: [number, number, number]; font?: any } = {}) => {
        const { x = margin, size = 11, color = [0.1, 0.1, 0.12], font: f = font } = opts;
        const lines = text.split("\n");
        lines.forEach((line) => {
          page.drawText(line, { x, y: opts.y ?? y, size, font: f, color: rgb(color[0], color[1], color[2]) });
          y -= size + 2;
        });
      };

      const drawSection = (title: string, body: string) => {
        y -= 10;
        drawText(title, { size: 14, color: [0.78, 0.65, 0.36], font: fontBold });
        y -= 4;
        drawText(body, { size: 10, color: [0.1, 0.1, 0.12] });
        y -= 6;
      };

      // Header
      drawText("VIRTUS MARKETING BRIEF", { size: 22, color: [0.1, 0.1, 0.12], font: fontBold });
      drawText(`Generated: ${new Date(row.generatedAt).toLocaleString()}`, { size: 9, color: [0.61, 0.58, 0.54] });
      y -= 16;

      // Book Info
      drawSection("Book Information", `Title: ${row.bookTitle}\nAuthor: ${row.bookAuthor || "N/A"}\nTarget URL: ${row.associatedUrl}`);

      // Keywords
      if (decrypted.keywords) {
        drawSection("Target Keywords", (decrypted.keywords as string[]).slice(0, 20).join("\n"));
      }

      // UGC Script
      if (decrypted.ugcScript) {
        drawSection("UGC Video Script", decrypted.ugcScript as string);
      }

      // Ad Headlines
      if (decrypted.adHeadlines) {
        drawSection("Ad Headlines", decrypted.adHeadlines as string);
      }

      // Platform
      drawSection("Platform Targeting", `Primary Platform: ${decrypted.platform || "mixed"}`);

      // Footer
      y = 60;
      drawText("Powered by Virtus Publishing AdGPT Engine — CONFIDENTIAL", { size: 8, color: [0.61, 0.58, 0.54], y: 60 });

      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

      return {
        success: true,
        pdfBase64,
        filename: `virtus-brief-${row.bookTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}.pdf`,
      };
    }),
});

// Helper: generate keyword matrix
function generateKeywords(title: string, author: string): string[] {
  const words = title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
  const base = [...words, author.toLowerCase(), "ebook", "book", "kindle", "bestseller"];
  const exact = base.map((w: string) => `"${w}"`);
  const phrase = base.map((w: string) => `[${w}]`);
  const broad = base;
  return [...new Set([...exact, ...phrase, ...broad])];
}
