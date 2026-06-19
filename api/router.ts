// @ts-nocheck
import { authRouter } from "./auth-router.js";
import { localAuthRouter } from "./local-auth-router.js";
import { ebookRouter } from "./ebook-router.js";
import { storeRouter } from "./store-router.js";
import { purchaseRouter } from "./purchase-router.js";
import { reviewRouter } from "./review-router.js";
import { aiRouter } from "./ai-router.js";
import { userRouter } from "./user-router.js";
import { adminRouter } from "./admin-router.js";
import { blogRouter } from "./blog-router.js";
import { podcastRouter } from "./podcast-router.js";
import { paymentRouter } from "./payment-router.js";
import { campaignRouter } from "./campaign-router.js";
import { salesLeadRouter } from "./sales-lead-router.js";
import { teamRouter } from "./team-router.js";
import { fileUploadRouter } from "./file-upload-router.js";
import { ollamaRouter } from "./ollama-router.js";
import { kbRouter } from "./kb-router.js";
import { adgptRouter } from "./adgpt-router.js";
import { adgptConnectorRouter } from "./adgpt-connector-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  ebook: ebookRouter,
  store: storeRouter,
  purchase: purchaseRouter,
  review: reviewRouter,
  ai: aiRouter,
  user: userRouter,
  admin: adminRouter,
  blog: blogRouter,
  podcast: podcastRouter,
  payment: paymentRouter,
  campaign: campaignRouter,
  salesLead: salesLeadRouter,
  team: teamRouter,
  fileUpload: fileUploadRouter,
  ollama: ollamaRouter,
  kb: kbRouter,
  adgpt: adgptRouter,
  adgptConnector: adgptConnectorRouter,
});

export type AppRouter = typeof appRouter;
