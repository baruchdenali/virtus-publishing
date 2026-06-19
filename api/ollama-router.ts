// @ts-nocheck
import { createRouter, publicQuery, operationsQuery } from "./middleware.js";
import { checkOllamaHealth, generateWithOllama } from "./lib/ollama.js";
import { getVramConfig, VRAM_TIERS, detectVramTier } from "./lib/vram-config.js";
import { z } from "zod";

export const ollamaRouter = createRouter({
  health: publicQuery.query(async () => {
    const health = await checkOllamaHealth();
    const config = getVramConfig();
    return {
      ...health,
      vramTier: detectVramTier(),
      vramLabel: config.label,
      maxGpuLayers: config.maxGpuLayers,
      batchSize: config.batchSize,
      threads: config.threads,
      recommendedModels: config.models.map(m => ({
        name: m.name,
        size: m.parameterSize,
        description: m.description,
      })),
    };
  }),

  config: publicQuery.query(() => {
    const tier = detectVramTier();
    const config = getVramConfig();
    return {
      currentTier: tier,
      label: config.label,
      maxVramGB: config.maxVramGB,
      allTiers: Object.entries(VRAM_TIERS).map(([key, t]) => ({
        key,
        label: t.label,
        maxVramGB: t.maxVramGB,
        models: t.models.map(m => ({ name: m.name, size: m.parameterSize })),
      })),
    };
  }),

  // Direct chat endpoint for testing
  chat: operationsQuery
    .input(z.object({ prompt: z.string(), model: z.string().optional() }))
    .mutation(async ({ input }) => {
      const result = await generateWithOllama({
        prompt: input.prompt,
        model: input.model,
      });
      return result;
    }),
});
