// @ts-nocheck
// OpenAI service with graceful fallback to mock responses

interface AIGenerateOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  outline: `You are an expert eBook outlining assistant. Create detailed, well-structured chapter outlines. Format with clear chapter titles, section headers, and bullet points.`,
  chapter: `You are an expert eBook writing assistant. Write engaging, professional prose. Use clear paragraph structure. Aim for 800-1200 words per response.`,
  enhance: `You are an expert editor. Enhance the provided text for clarity, impact, and professionalism while preserving the author's voice.`,
  title: `You are a creative title consultant. Suggest compelling, marketable eBook titles with brief explanations of why each works.`,
  general: `You are Virtus AI, an expert publishing assistant. Help authors create, refine, and publish professional eBooks. Be concise, practical, and encouraging.`,
};

function detectIntent(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes("outline") || lower.includes("structure") || lower.includes("chapters")) return "outline";
  if (lower.includes("write") || lower.includes("chapter") || lower.includes("content") || lower.includes("draft")) return "chapter";
  if (lower.includes("edit") || lower.includes("improve") || lower.includes("enhance") || lower.includes("refine")) return "enhance";
  if (lower.includes("title") || lower.includes("name") || lower.includes("headline")) return "title";
  return "general";
}

function getMockResponse(intent: string, prompt: string): string {
  const mockResponses: Record<string, string> = {
    outline: `## eBook Outline

### Chapter 1: Introduction
- Hook the reader with a compelling opening story
- Present the problem your book solves
- Preview the journey ahead and key takeaways

### Chapter 2: Foundations
- Historical context and background
- Key terminology and core concepts
- Why this matters now

### Chapter 3: Core Principles
- Principle 1: The foundational idea
- Principle 2: Practical application
- Principle 3: Advanced techniques

### Chapter 4: Case Studies & Examples
- Real-world success story
- Lessons learned and key insights
- Common mistakes to avoid

### Chapter 5: Implementation Guide
- Step-by-step action plan
- Tools, resources, and templates
- Timeline for execution

### Chapter 6: Conclusion
- Key takeaways summary
- Call to action for readers
- Final empowering message`,

    chapter: `The journey of creating something remarkable begins with a single, deliberate step. In an age where information flows endlessly and attention is the scarcest resource, the ability to craft compelling narratives has never been more valuable.

Consider the landscape of modern publishing. What once required navigating gatekeepers, agents, and traditional publishing houses can now be accomplished with vision, dedication, and the right tools. This democratization of publishing has opened doors for voices that might otherwise have remained unheard.

The essence of great writing lies not merely in the transmission of information, but in the creation of connection. When a reader picks up your book, they are inviting you into their mind, their time, their trust. Honor that invitation with clarity, authenticity, and purpose.

As we explore the principles and practices that separate exceptional books from forgettable ones, remember that every bestselling author started exactly where you are now—with an idea and the courage to pursue it.`,

    enhance: `The publishing landscape has undergone a remarkable transformation. Where authors once faced insurmountable barriers to entry, today's creators enjoy unprecedented access to global audiences.

This shift represents more than technological progress—it embodies a fundamental reimagining of how knowledge and stories flow through society. The modern author stands at the intersection of creativity and technology, equipped with tools that amplify their voice across borders and languages.`,

    title: `Here are some compelling title options:

1. **The Art of Digital Publishing** — Clean, authoritative, appeals to craft-focused readers
2. **Words Unbound: The New Publishing Revolution** — Energetic, suggests liberation and change
3. **From Manuscript to Masterpiece** — Promises transformation, appeals to ambitious authors
4. **The Author's Digital Canvas** — Creative metaphor, appeals to artists and writers
5. **Crafting Tomorrow's Classics** — Aspirational, suggests lasting impact`,

    general: `I'm Virtus AI, your publishing assistant. I can help you with:

- **Outlining** — Create detailed chapter structures and book blueprints
- **Writing** — Draft chapters, introductions, and content sections
- **Editing** — Enhance clarity, tone, and impact of existing text
- **Titles** — Generate compelling, marketable book titles
- **Metadata** — Optimize descriptions, tags, and categorization
- **Strategy** — Publishing timelines, pricing, and positioning advice

What would you like to work on today?`,
  };

  return mockResponses[intent] || mockResponses.general;
}

export async function generateAIResponse(options: AIGenerateOptions): Promise<{ text: string; source: "openai" | "mock" }> {
  const { prompt, systemPrompt, maxTokens = 1500 } = options;
  const intent = detectIntent(prompt);
  const sysPrompt = systemPrompt || SYSTEM_PROMPTS[intent] || SYSTEM_PROMPTS.general;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { text: getMockResponse(intent, prompt), source: "mock" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("[OpenAI] API error:", response.status, await response.text());
      return { text: getMockResponse(intent, prompt), source: "mock" };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return { text: getMockResponse(intent, prompt), source: "mock" };
    }

    return { text, source: "openai" };
  } catch (err) {
    console.error("[OpenAI] Request failed:", err);
    return { text: getMockResponse(intent, prompt), source: "mock" };
  }
}

export { detectIntent, SYSTEM_PROMPTS };
