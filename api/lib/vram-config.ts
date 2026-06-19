// @ts-nocheck
/**
 * Hard-coded VRAM ceiling configurations to prevent token thrashing.
 * Each tier maps to specific model parameters for optimal output.
 * These are INTENTIONALLY hard-coded to prevent runtime misconfiguration.
 */

export interface VramTier {
  label: string;
  maxVramGB: number;
  models: ModelConfig[];
  defaultContextWindow: number;
  maxGpuLayers: number;
  batchSize: number;
  threads: number;
}

export interface ModelConfig {
  name: string;
  parameterSize: string;
  quantization: string;
  contextWindow: number;
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
  maxTokens: number;
  description: string;
}

// Hard-coded VRAM tiers — DO NOT modify at runtime
export const VRAM_TIERS: Record<string, VramTier> = {
  "4gb": {
    label: "4 GB",
    maxVramGB: 4,
    defaultContextWindow: 2048,
    maxGpuLayers: 16,
    batchSize: 256,
    threads: 2,
    models: [
      {
        name: "phi3:mini",
        parameterSize: "3.8B",
        quantization: "Q4_0",
        contextWindow: 2048,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1,
        maxTokens: 1024,
        description: "Microsoft Phi-3 Mini — best quality for 4GB VRAM",
      },
      {
        name: "tinyllama",
        parameterSize: "1.1B",
        quantization: "Q4_0",
        contextWindow: 2048,
        temperature: 0.8,
        topP: 0.92,
        topK: 50,
        repeatPenalty: 1.15,
        maxTokens: 1024,
        description: "TinyLlama — fastest inference for 4GB VRAM",
      },
    ],
  },
  "8gb": {
    label: "8 GB",
    maxVramGB: 8,
    defaultContextWindow: 4096,
    maxGpuLayers: 32,
    batchSize: 512,
    threads: 4,
    models: [
      {
        name: "llama3.1:8b",
        parameterSize: "8B",
        quantization: "Q4_0",
        contextWindow: 4096,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1,
        maxTokens: 2048,
        description: "Llama 3.1 8B — Meta's best open model for 8GB VRAM",
      },
      {
        name: "mistral:7b",
        parameterSize: "7B",
        quantization: "Q4_0",
        contextWindow: 4096,
        temperature: 0.75,
        topP: 0.92,
        topK: 45,
        repeatPenalty: 1.12,
        maxTokens: 2048,
        description: "Mistral 7B — excellent reasoning for 8GB VRAM",
      },
    ],
  },
  "12gb": {
    label: "12 GB",
    maxVramGB: 12,
    defaultContextWindow: 8192,
    maxGpuLayers: 40,
    batchSize: 1024,
    threads: 6,
    models: [
      {
        name: "llama3.1:8b",
        parameterSize: "8B",
        quantization: "Q5_0",
        contextWindow: 8192,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1,
        maxTokens: 4096,
        description: "Llama 3.1 8B at higher precision — 12GB sweet spot",
      },
      {
        name: "qwen2.5:7b",
        parameterSize: "7B",
        quantization: "Q5_0",
        contextWindow: 8192,
        temperature: 0.65,
        topP: 0.88,
        topK: 35,
        repeatPenalty: 1.08,
        maxTokens: 4096,
        description: "Qwen 2.5 — superior multilingual support",
      },
    ],
  },
  "16gb": {
    label: "16 GB",
    maxVramGB: 16,
    defaultContextWindow: 16384,
    maxGpuLayers: 48,
    batchSize: 2048,
    threads: 8,
    models: [
      {
        name: "llama3.1:8b",
        parameterSize: "8B",
        quantization: "Q8_0",
        contextWindow: 16384,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1,
        maxTokens: 8192,
        description: "Llama 3.1 8B at Q8 precision — near-lossless quality",
      },
      {
        name: "mistral-nemo:12b",
        parameterSize: "12B",
        quantization: "Q4_0",
        contextWindow: 16384,
        temperature: 0.72,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1,
        maxTokens: 8192,
        description: "Mistral Nemo 12B — largest model for 16GB VRAM",
      },
    ],
  },
  "24gb": {
    label: "24 GB",
    maxVramGB: 24,
    defaultContextWindow: 32768,
    maxGpuLayers: 64,
    batchSize: 4096,
    threads: 12,
    models: [
      {
        name: "llama3.1:70b",
        parameterSize: "70B",
        quantization: "Q4_K_M",
        contextWindow: 32768,
        temperature: 0.65,
        topP: 0.88,
        topK: 35,
        repeatPenalty: 1.05,
        maxTokens: 16384,
        description: "Llama 3.1 70B — maximum quality local inference",
      },
      {
        name: "mixtral:8x7b",
        parameterSize: "47B MoE",
        quantization: "Q4_K_M",
        contextWindow: 32768,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.08,
        maxTokens: 16384,
        description: "Mixtral 8x7B MoE — best reasoning local model",
      },
    ],
  },
};

// VRAM tier selection from environment or fallback
export function detectVramTier(): string {
  const envVram = process.env.VRAM_CEILING_GB;
  if (envVram) {
    const gb = parseInt(envVram, 10);
    if (gb >= 24) return "24gb";
    if (gb >= 16) return "16gb";
    if (gb >= 12) return "12gb";
    if (gb >= 8) return "8gb";
  }
  // Default to 8GB — works on most consumer GPUs
  return "8gb";
}

export function getVramConfig(): VramTier {
  const tier = detectVramTier();
  return VRAM_TIERS[tier] || VRAM_TIERS["8gb"];
}

export function getBestModel(preferred?: string): ModelConfig {
  const config = getVramConfig();
  if (preferred) {
    const match = config.models.find(m => m.name.includes(preferred));
    if (match) return match;
  }
  // Return first model (best) in the tier
  return config.models[0];
}

// Parameter throttling: reduce params when model struggles
export function throttleParams(baseConfig: ModelConfig, throttleLevel: number): ModelConfig {
  return {
    ...baseConfig,
    contextWindow: Math.floor(baseConfig.contextWindow / Math.max(throttleLevel, 1)),
    maxTokens: Math.floor(baseConfig.maxTokens / Math.max(throttleLevel, 1)),
    batchSize: Math.floor(512 / Math.max(throttleLevel, 1)),
    temperature: Math.max(0.3, baseConfig.temperature - (throttleLevel * 0.1)),
  };
}
