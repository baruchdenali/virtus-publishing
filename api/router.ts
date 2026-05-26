import { authRouter } from "./auth-router";
import { kindeRouter } from "./kinde-router";
import { ebookRouter } from "./ebook-router";
import { storeRouter } from "./store-router";
import { purchaseRouter } from "./purchase-router";
import { reviewRouter } from "./review-router";
import { aiRouter } from "./ai-router";
import { userRouter } from "./user-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  kinde: kindeRouter,
  ebook: ebookRouter,
  store: storeRouter,
  purchase: purchaseRouter,
  review: reviewRouter,
  ai: aiRouter,
  user: userRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
