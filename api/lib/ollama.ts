// @ts-nocheck
/**
 * Ollama local model client with VRAM-aware execution.
 * Zero-cost AI — no API keys, no cloud calls.
 * Falls back to enhanced mock responses if Ollama is not running.
 */

import { getVramConfig, getBestModel, throttleParams, type ModelConfig } from "./vram-config.js";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

// Throttle tracking per model
const throttleTracker: Record<string, number> = {};

interface GenerateOptions {
  prompt: string;
  system?: string;
  model?: string;
  stream?: boolean;
}

interface GenerateResult {
  text: string;
  model: string;
  source: "ollama" | "mock";
  tokensPerSecond?: number;
  throttleLevel?: number;
}

// System prompts optimized for Virtus Publishing
const SYSTEM_PROMPTS: Record<string, string> = {
  outline: `You are Virtus AI, an expert eBook outlining assistant for Virtus Publishing. Create detailed, well-structured chapter outlines with clear titles, sections, and bullet points. Be practical and actionable.`,
  chapter: `You are Virtus AI, an expert eBook writing assistant. Write engaging, professional prose with clear paragraph structure. Aim for 800-1200 words. Use varied sentence structure. Hook the reader early.`,
  enhance: `You are Virtus AI, a senior editor. Enhance text for clarity, impact, and professionalism while preserving the author's voice. Remove filler. Strengthen weak phrases. Maintain original meaning.`,
  title: `You are Virtus AI, a creative consultant. Suggest compelling, marketable eBook titles with brief explanations of why each works. Consider SEO, genre conventions, and emotional appeal.`,
  general: `You are Virtus AI, the in-house publishing assistant at Virtus Publishing. Help authors create, refine, and publish professional eBooks. Be concise, practical, encouraging. Provide actionable advice.`,
  cover: `You are Virtus AI, a book cover design consultant. Describe compelling cover concepts based on the book's theme, genre, and target audience. Suggest color palettes, imagery, typography.`,
  marketing: `You are Virtus AI, a book marketing strategist. Provide practical marketing advice for eBook promotion, including social media, email campaigns, and store optimization.`,
};

function detectIntent(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes("outline") || lower.includes("structure") || lower.includes("chapters") || lower.includes("table of contents")) return "outline";
  if (lower.includes("write") || lower.includes("chapter") || lower.includes("content") || lower.includes("draft") || lower.includes("prose")) return "chapter";
  if (lower.includes("edit") || lower.includes("improve") || lower.includes("enhance") || lower.includes("refine") || lower.includes("rewrite")) return "enhance";
  if (lower.includes("title") || lower.includes("name") || lower.includes("headline")) return "title";
  if (lower.includes("cover") || lower.includes("design") || lower.includes("artwork")) return "cover";
  if (lower.includes("market") || lower.includes("promote") || lower.includes("sell") || lower.includes("audience")) return "marketing";
  return "general";
}

// Enhanced mock responses (fallback when Ollama unavailable)
function getMockResponse(intent: string, prompt: string): string {
  const responses: Record<string, string> = {
    outline: `## eBook Outline: ${prompt.slice(0, 60)}

### Chapter 1: Introduction — Hooking Your Reader
- Open with a compelling story, statistic, or question
- Present the problem your book solves
- Preview the journey and promise transformation

### Chapter 2: Foundations — Building Context
- Historical background and why it matters now
- Key terminology and core concepts defined
- Common misconceptions addressed

### Chapter 3: Core Principles — The Heart of Your Message
- Principle 1: The foundational idea with evidence
- Principle 2: Practical application with examples
- Principle 3: Advanced techniques for mastery

### Chapter 4: Case Studies — Real-World Proof
- Success story: how [person/company] applied these ideas
- Failure analysis: lessons from what did not work
- Comparative study: before and after scenarios

### Chapter 5: Implementation — Actionable Steps
- Step-by-step process with milestones
- Tools, resources, and templates
- Troubleshooting common obstacles

### Chapter 6: Conclusion — Lasting Impact
- Key takeaways synthesized
- Call to action with clear next steps
- Final empowering message that resonates`,

    chapter: `The journey of creating something remarkable begins with a single, deliberate step forward. In an age where information flows endlessly and attention has become the scarcest resource, the ability to craft compelling narratives has never been more valuable.

Consider the landscape of modern publishing. What once required navigating layers of gatekeepers — agents, editors, and traditional publishing houses — can now be accomplished with vision, dedication, and the right tools. This democratization has opened doors for voices that might otherwise have remained unheard, allowing stories to reach global audiences with unprecedented speed.

The essence of great writing lies not merely in the transmission of information, but in the creation of genuine connection. When a reader picks up your book, they are inviting you into their mind, their time, and their trust. Honor that invitation with clarity, authenticity, and purpose.

As we explore the principles that separate exceptional books from forgettable ones, remember that every bestselling author started exactly where you are now — with an idea and the courage to pursue it. The difference between a dream and a published book is simply the decision to begin.`,

    enhance: `The publishing landscape has undergone a remarkable transformation. Where authors once faced insurmountable barriers to entry, today's creators enjoy unprecedented access to global audiences.

This shift represents far more than technological progress — it embodies a fundamental reimagining of how knowledge and stories flow through society. The modern author stands at the intersection of creativity and technology, equipped with tools that amplify their voice across borders, languages, and cultures.

Success in this new paradigm requires both artistic vision and strategic thinking. The writers who thrive are those who embrace the full spectrum of modern publishing — from AI-assisted drafting to data-driven marketing. Your book deserves to be read. Let's make sure it is.`,

    title: `Here are compelling title options for your eBook:

1. **The Art of Digital Publishing** — Clean, authoritative. Appeals to craft-focused readers seeking mastery.

2. **Words Unbound: The New Publishing Revolution** — Energetic and aspirational. Suggests liberation and transformative change.

3. **From Manuscript to Masterpiece** — Promises transformation. Appeals to ambitious authors ready to elevate their work.

4. **The Author's Digital Canvas** — Creative metaphor that positions writing as artistry. Appeals to creative professionals.

5. **Crafting Tomorrow's Classics** — Aspirational with lasting impact. Suggests timeless quality in a modern format.

6. **Publish Without Permission** — Bold, empowering. Speaks to independent authors breaking free from gatekeepers.

7. **The Complete Author's Blueprint** — Practical, comprehensive. Promises a step-by-step system that works.`,

    cover: `## Cover Design Concept

**Visual Direction:** A split-composition showing a traditional quill pen dissolving into digital particles/pixels, symbolizing the bridge between classical writing and modern publishing.

**Color Palette:**
- Primary: Deep navy (#1B2A4A) — trust, authority
- Accent: Warm gold (#C8A55C) — premium quality
- Highlight: Soft cream (#F5F0E8) — readability

**Typography:**
- Title: Serif font (like Playfair Display) — elegance and tradition
- Subtitle: Clean sans-serif (like Inter) — modern accessibility

**Layout:**
- Title centered, large, commanding presence
- Subtle geometric pattern in background for texture
- Author name at bottom in gold accent
- Minimalist approach — let the concept breathe

**Genre Signals:** Professional, premium, transformative — appeals to serious authors.`,

    marketing: `## eBook Marketing Strategy

**Phase 1: Pre-Launch (2 weeks before)**
- Tease excerpts on social media (Twitter threads, LinkedIn posts)
- Build email list with a free chapter giveaway
- Create a landing page with countdown timer

**Phase 2: Launch Week**
- Email blast to your list with exclusive launch pricing
- Coordinate social posts across all platforms
- Reach out to 10 micro-influencers in your niche
- Post in relevant subreddits, Facebook groups, forums

**Phase 3: Sustained Growth**
- Weekly blog posts related to your book's topic
- Guest podcast appearances (aim for 5 in first month)
- Amazon/Goodreads review campaign with ARC readers
- Run a limited-time promotional pricing cycle

**Free Promotion Channels:**
- Virtus Publishing featured placement
- Reddit r/selfpublish, r/writing
- Twitter #WritingCommunity
- LinkedIn articles for non-fiction
- Free Book Promotions (if doing a free run)`,

    general: `I'm Virtus AI, your open-source publishing assistant. I run entirely on your local machine — no API keys, no cloud costs, no data leaving your system.

Here's what I can help you with:

**Writing & Creation**
- **Outlining** — Detailed chapter structures and book blueprints
- **Drafting** — Full chapter content with professional prose
- **Editing** — Enhance clarity, tone, and impact of existing text
- **Titling** — Generate compelling, marketable book titles

**Production**
- **Cover concepts** — Visual direction and design briefs
- **Formatting** — Structure and layout recommendations
- **Metadata** — Optimize descriptions, tags, categorization

**Marketing**
- **Launch strategy** — Pre-launch, launch, and sustain phases
- **Promotion** — Social media, email, and community strategies
- **Positioning** — Genre analysis and competitive differentiation

What would you like to work on today?`,
  };

  return responses[intent] || responses.general;
}

// Core Ollama generation with throttling
export async function generateWithOllama(options: GenerateOptions): Promise<GenerateResult> {
  const { prompt, system, model: preferredModel } = options;
  const intent = detectIntent(prompt);
  const systemPrompt = system || SYSTEM_PROMPTS[intent] || SYSTEM_PROMPTS.general;

  // Try Ollama first
  try {
    const modelConfig = getBestModel(preferredModel);
    const modelKey = modelConfig.name;

    // Apply throttling if previous calls failed
    const throttleLevel = throttleTracker[modelKey] || 0;
    const config = throttleLevel > 0 ? throttleParams(modelConfig, throttleLevel) : modelConfig;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.name,
        prompt: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
        stream: false,
        options: {
          temperature: config.temperature,
          top_p: config.topP,
          top_k: config.topK,
          repeat_penalty: config.repeatPenalty,
          num_predict: config.maxTokens,
          num_ctx: config.contextWindow,
          num_gpu: config.name.includes("70b") || config.name.includes("47b") ? 48 : 32,
          num_thread: getVramConfig().threads,
          batch_size: getVramConfig().batchSize,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.response?.trim();

    if (!text) {
      throw new Error("Empty response from Ollama");
    }

    // Reset throttle on success
    throttleTracker[modelKey] = 0;

    return {
      text,
      model: config.name,
      source: "ollama",
      tokensPerSecond: data.eval_count / (data.eval_duration / 1e9),
      throttleLevel: 0,
    };
  } catch (err) {
    // Increment throttle for this model
    const modelKey = preferredModel || getBestModel().name;
    throttleTracker[modelKey] = (throttleTracker[modelKey] || 0) + 1;

    console.log(`[Ollama] Unavailable (throttle level ${throttleTracker[modelKey]}), falling back to mock. To use local AI, install Ollama and run: ollama run ${getBestModel().name}`);

    // Return enhanced mock response
    return {
      text: getMockResponse(intent, prompt),
      model: "virtus-ai-mock",
      source: "mock",
      throttleLevel: throttleTracker[modelKey],
    };
  }
}

// Check Ollama health
export async function checkOllamaHealth(): Promise<{ available: boolean; models?: string[]; vramTier?: string }> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return { available: false };
    const data = await response.json();
    const models = data.models?.map((m: any) => m.name) || [];
    return { available: models.length > 0, models, vramTier: detectVramTier() };
  } catch {
    return { available: false };
  }
}

export { detectIntent, SYSTEM_PROMPTS, getMockResponse };
