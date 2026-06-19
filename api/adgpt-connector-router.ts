// @ts-nocheck
/**
 * MODULE 4: AdGPT Platform Connectors — Google Ads, Meta, TikTok
 * Staff-only microservice for ad platform API integration.
 * All credentials encrypted at rest with AES-256-GCM.
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { virtusStaffIntegrations, virtusAiCampaigns } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { encryptPayload, decryptPayload } from "./lib/crypto.js";

export const adgptConnectorRouter = createRouter({
  // -------------------------------------------------------------------
  // Save encrypted platform credentials
  // -------------------------------------------------------------------
  linkCredentials: adminQuery
    .input(
      z.object({
        staffId: z.string().min(1),
        platform: z.enum(["google_ads", "meta", "tiktok"]),
        credentials: z.record(z.string()), // { accessToken, refreshToken, accountId, etc }
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const encrypted = encryptPayload(input.credentials);

      // Upsert: delete existing then insert
      await db.delete(virtusStaffIntegrations)
        .where(and(
          eq(virtusStaffIntegrations.staffId, input.staffId),
          eq(virtusStaffIntegrations.platform, input.platform)
        ));

      await db.insert(virtusStaffIntegrations).values({
        staffId: input.staffId,
        platform: input.platform,
        encryptedCredentials: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        linkedAt: new Date(),
      });

      return { success: true, platform: input.platform, linkedAt: new Date().toISOString() };
    }),

  // -------------------------------------------------------------------
  // Retrieve decrypted credentials (for server-side use only)
  // -------------------------------------------------------------------
  getCredentials: adminQuery
    .input(z.object({ staffId: z.string(), platform: z.enum(["google_ads", "meta", "tiktok"]) }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(virtusStaffIntegrations)
        .where(and(
          eq(virtusStaffIntegrations.staffId, input.staffId),
          eq(virtusStaffIntegrations.platform, input.platform)
        )).limit(1);
      if (!rows[0]) return { linked: false };

      const decrypted = decryptPayload({
        ciphertext: rows[0].encryptedCredentials,
        iv: rows[0].iv,
        authTag: rows[0].authTag,
      });
      return { linked: true, credentials: decrypted, linkedAt: rows[0].linkedAt };
    }),

  // -------------------------------------------------------------------
  // List all linked integrations for a staff member
  // -------------------------------------------------------------------
  listIntegrations: adminQuery
    .input(z.object({ staffId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(virtusStaffIntegrations)
        .where(eq(virtusStaffIntegrations.staffId, input.staffId));
      return rows.map((r) => ({
        platform: r.platform,
        linkedAt: r.linkedAt,
        // Never expose encrypted data — just confirm linkage
        linked: true,
      }));
    }),

  // -------------------------------------------------------------------
  // Disconnect a platform
  // -------------------------------------------------------------------
  disconnect: adminQuery
    .input(z.object({ staffId: z.string(), platform: z.enum(["google_ads", "meta", "tiktok"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(virtusStaffIntegrations)
        .where(and(
          eq(virtusStaffIntegrations.staffId, input.staffId),
          eq(virtusStaffIntegrations.platform, input.platform)
        ));
      return { success: true };
    }),

  // -------------------------------------------------------------------
  // Push campaign to Google Ads (server-to-server)
  // -------------------------------------------------------------------
  pushGoogleAds: adminQuery
    .input(z.object({
      staffId: z.string(),
      campaignId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // 1. Get credentials
      const credRows = await db.select().from(virtusStaffIntegrations)
        .where(and(
          eq(virtusStaffIntegrations.staffId, input.staffId),
          eq(virtusStaffIntegrations.platform, "google_ads")
        )).limit(1);
      if (!credRows[0]) return { error: "Google Ads credentials not linked." };

      const creds = decryptPayload({
        ciphertext: credRows[0].encryptedCredentials,
        iv: credRows[0].iv,
        authTag: credRows[0].authTag,
      }) as any;

      // 2. Get campaign
      const campRows = await db.select().from(virtusAiCampaigns)
        .where(eq(virtusAiCampaigns.id, input.campaignId)).limit(1);
      if (!campRows[0]) return { error: "Campaign not found." };
      const campaign = decryptPayload({
        ciphertext: campRows[0].encryptedPayload,
        iv: campRows[0].iv,
        authTag: campRows[0].authTag,
      }) as any;

      // 3. Call Google Ads API (REST v16)
      try {
        const customerId = creds.customerId || creds.accountId;
        const developerToken = creds.developerToken || process.env.GOOGLE_ADS_DEV_TOKEN;

        // Build campaign resource
        const campaignResource = {
          name: `Virtus: ${campaign.bookTitle} — ${Date.now()}`,
          advertisingChannelType: "SEARCH",
          status: "ENABLED",
          campaignBudget: `customers/${customerId}/campaignBudgets/-1`,
          startDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          endDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10).replace(/-/g, ""),
          manualCpc: { enhancedCpcEnabled: true },
        };

        const resp = await fetch(
          `https://googleads.googleapis.com/v16/customers/${customerId}/campaigns:mutate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${creds.accessToken}`,
              "developer-token": developerToken,
            },
            body: JSON.stringify({
              operations: [{ create: campaignResource }],
              partialFailure: true,
            }),
          }
        );
        const data = await resp.json();

        // Update local status
        await db.update(virtusAiCampaigns)
          .set({ campaignStatus: "scheduled" })
          .where(eq(virtusAiCampaigns.id, input.campaignId));

        return {
          success: !data.error,
          platformResponse: data,
          campaignStatus: "scheduled",
        };
      } catch (err) {
        console.error("[AdGPT] Google Ads push failed:", err);
        return { error: (err as Error).message, platform: "google_ads" };
      }
    }),

  // -------------------------------------------------------------------
  // Push campaign to Meta Marketing API
  // -------------------------------------------------------------------
  pushMeta: adminQuery
    .input(z.object({
      staffId: z.string(),
      campaignId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const credRows = await db.select().from(virtusStaffIntegrations)
        .where(and(
          eq(virtusStaffIntegrations.staffId, input.staffId),
          eq(virtusStaffIntegrations.platform, "meta")
        )).limit(1);
      if (!credRows[0]) return { error: "Meta credentials not linked." };

      const creds = decryptPayload({
        ciphertext: credRows[0].encryptedCredentials,
        iv: credRows[0].iv,
        authTag: credRows[0].authTag,
      }) as any;

      const campRows = await db.select().from(virtusAiCampaigns)
        .where(eq(virtusAiCampaigns.id, input.campaignId)).limit(1);
      if (!campRows[0]) return { error: "Campaign not found." };
      const campaign = decryptPayload({
        ciphertext: campRows[0].encryptedPayload,
        iv: campRows[0].iv,
        authTag: campRows[0].authTag,
      }) as any;

      try {
        // Create Meta Ads campaign
        const resp = await fetch(
          `https://graph.facebook.com/v22.0/act_${creds.adAccountId}/campaigns`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              name: `Virtus: ${campaign.bookTitle} — ${Date.now()}`,
              objective: "CONVERSIONS",
              status: "PAUSED",
              access_token: creds.accessToken,
              special_ad_categories: "[]",
            }),
          }
        );
        const data = await resp.json();

        await db.update(virtusAiCampaigns)
          .set({ campaignStatus: "scheduled" })
          .where(eq(virtusAiCampaigns.id, input.campaignId));

        return { success: !data.error, platformResponse: data, campaignStatus: "scheduled" };
      } catch (err) {
        console.error("[AdGPT] Meta push failed:", err);
        return { error: (err as Error).message, platform: "meta" };
      }
    }),

  // -------------------------------------------------------------------
  // Push campaign to TikTok Ads API
  // -------------------------------------------------------------------
  pushTikTok: adminQuery
    .input(z.object({
      staffId: z.string(),
      campaignId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const credRows = await db.select().from(virtusStaffIntegrations)
        .where(and(
          eq(virtusStaffIntegrations.staffId, input.staffId),
          eq(virtusStaffIntegrations.platform, "tiktok")
        )).limit(1);
      if (!credRows[0]) return { error: "TikTok credentials not linked." };

      const creds = decryptPayload({
        ciphertext: credRows[0].encryptedCredentials,
        iv: credRows[0].iv,
        authTag: credRows[0].authTag,
      }) as any;

      const campRows = await db.select().from(virtusAiCampaigns)
        .where(eq(virtusAiCampaigns.id, input.campaignId)).limit(1);
      if (!campRows[0]) return { error: "Campaign not found." };

      try {
        // TikTok Business API v1.3
        const resp = await fetch(
          "https://business-api.tiktok.com/open_api/v1.3/campaign/create/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Token": creds.accessToken,
            },
            body: JSON.stringify({
              advertiser_id: creds.advertiserId,
              campaign_name: `Virtus: Book Campaign ${Date.now()}`,
              objective_type: "TRAFFIC",
              budget_mode: "BUDGET_MODE_DAY",
              budget: "50.00",
              campaign_type: "REGULAR",
            }),
          }
        );
        const data = await resp.json();

        await db.update(virtusAiCampaigns)
          .set({ campaignStatus: "scheduled" })
          .where(eq(virtusAiCampaigns.id, input.campaignId));

        return { success: data.code === 0, platformResponse: data, campaignStatus: "scheduled" };
      } catch (err) {
        console.error("[AdGPT] TikTok push failed:", err);
        return { error: (err as Error).message, platform: "tiktok" };
      }
    }),

  // -------------------------------------------------------------------
  // Platform health check — verify credentials are valid
  // -------------------------------------------------------------------
  healthCheck: adminQuery
    .input(z.object({
      staffId: z.string(),
      platform: z.enum(["google_ads", "meta", "tiktok"]),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(virtusStaffIntegrations)
        .where(and(
          eq(virtusStaffIntegrations.staffId, input.staffId),
          eq(virtusStaffIntegrations.platform, input.platform)
        )).limit(1);

      if (!rows[0]) return { healthy: false, reason: "not_linked" };

      const creds = decryptPayload({
        ciphertext: rows[0].encryptedCredentials,
        iv: rows[0].iv,
        authTag: rows[0].authTag,
      }) as any;

      // Quick token validation per platform
      try {
        if (input.platform === "google_ads") {
          const resp = await fetch("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + creds.accessToken);
          return { healthy: resp.ok, reason: resp.ok ? "ok" : "invalid_token" };
        }
        if (input.platform === "meta") {
          const resp = await fetch(`https://graph.facebook.com/v22.0/me?access_token=${creds.accessToken}`);
          return { healthy: resp.ok, reason: resp.ok ? "ok" : "invalid_token" };
        }
        if (input.platform === "tiktok") {
          const resp = await fetch(
            `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${creds.advertiserId}"]`,
            { headers: { "Access-Token": creds.accessToken } }
          );
          return { healthy: resp.ok, reason: resp.ok ? "ok" : "invalid_token" };
        }
      } catch {
        return { healthy: false, reason: "network_error" };
      }
      return { healthy: false, reason: "unknown" };
    }),
});
