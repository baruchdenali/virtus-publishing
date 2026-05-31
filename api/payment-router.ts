import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2025-03-31.basil" }) : null;

const PRODUCT_TIERS = {
  starter: {
    name: "Virtus Starter",
    description: "Perfect for new authors. Create and publish up to 3 eBooks.",
    price: 999, // $9.99
    features: ["3 eBooks", "AI Writing Assistant", "Basic Analytics", "Community Access"],
  },
  professional: {
    name: "Virtus Professional",
    description: "For serious authors. Unlimited eBooks, premium features.",
    price: 2999, // $29.99
    features: ["Unlimited eBooks", "Advanced AI", "Full Analytics", "Priority Support", "Marketing Tools"],
  },
  enterprise: {
    name: "Virtus Enterprise",
    description: "For institutions and publishers. Everything plus dedicated support.",
    price: 9999, // $99.99
    features: ["Everything in Pro", "Custom Branding", "API Access", "Dedicated Account Manager", "Team Collaboration"],
  },
};

export const paymentRouter = createRouter({
  // Get pricing tiers
  getTiers: publicQuery.query(() => {
    return PRODUCT_TIERS;
  }),

  // Create Stripe Checkout Session
  createCheckout: authedQuery
    .input(
      z.object({
        tier: z.enum(["starter", "professional", "enterprise"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!stripe) {
        throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.");
      }

      const user = ctx.user!;
      const tier = PRODUCT_TIERS[input.tier];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: tier.name,
                description: tier.description,
              },
              unit_amount: tier.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL || "https://virtuspublishing.us"}/dashboard?payment=success`,
        cancel_url: `${process.env.APP_URL || "https://virtuspublishing.us"}/settings?payment=cancelled`,
        customer_email: user.email || undefined,
        metadata: {
          userId: String(user.id),
          tier: input.tier,
        },
      });

      return { sessionId: session.id, url: session.url };
    }),

  // Get user's payment history
  getHistory: authedQuery.query(async ({ ctx }) => {
    if (!stripe) return [];
    const user = ctx.user!;

    try {
      const sessions = await stripe.checkout.sessions.list({
        limit: 50,
      });

      return sessions.data
        .filter((s) => s.metadata?.userId === String(user.id))
        .map((s) => ({
          id: s.id,
          amount: s.amount_total,
          status: s.payment_status,
          tier: s.metadata?.tier || "unknown",
          created: s.created,
        }));
    } catch {
      return [];
    }
  }),

  // Admin: Get all transactions
  getAllTransactions: adminQuery.query(async () => {
    if (!stripe) return [];
    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      return sessions.data.map((s) => ({
        id: s.id,
        customer: s.customer_details?.email || "unknown",
        amount: s.amount_total,
        status: s.payment_status,
        tier: s.metadata?.tier || "unknown",
        created: s.created,
      }));
    } catch {
      return [];
    }
  }),

  // Admin: Get revenue stats
  getRevenueStats: adminQuery.query(async () => {
    if (!stripe) return { totalRevenue: 0, transactionCount: 0, avgTransaction: 0 };
    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      const paid = sessions.data.filter((s) => s.payment_status === "paid");
      const total = paid.reduce((sum, s) => sum + (s.amount_total || 0), 0);
      return {
        totalRevenue: total,
        transactionCount: paid.length,
        avgTransaction: paid.length > 0 ? Math.round(total / paid.length) : 0,
      };
    } catch {
      return { totalRevenue: 0, transactionCount: 0, avgTransaction: 0 };
    }
  }),
});

export { stripe, PRODUCT_TIERS };
