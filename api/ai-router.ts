import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { aiConversations, aiMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const aiRouter = createRouter({
  listConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const conversations = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.createdAt));

    return conversations;
  }),

  createConversation: authedQuery
    .input(z.object({ title: z.string().optional(), ebookId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const result = await db.insert(aiConversations).values({
        userId,
        ebookId: input.ebookId,
        title: input.title ?? "New Conversation",
      }).returning();

      return result[0];
    }),

  listMessages: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const conversation = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, input.conversationId))
        .limit(1);

      if (!conversation[0] || conversation[0].userId !== userId) {
        return [];
      }

      const messages = await db
        .select()
        .from(aiMessages)
        .where(eq(aiMessages.conversationId, input.conversationId))
        .orderBy(aiMessages.createdAt);

      return messages;
    }),

  sendMessage: authedQuery
    .input(z.object({ conversationId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const conversation = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, input.conversationId))
        .limit(1);

      if (!conversation[0] || conversation[0].userId !== userId) {
        return null;
      }

      await db.insert(aiMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.content,
      });

      const mockResponses: Record<string, string> = {
        outline: "I've created a detailed outline for your eBook. Here's a chapter-by-chapter breakdown:\n\n**Chapter 1: Introduction**\n- Hook the reader with a compelling opening\n- Establish the core theme\n- Preview what's to come\n\n**Chapter 2: Foundations**\n- Historical context\n- Key concepts and terminology\n- Setting the stage\n\n**Chapter 3: Core Ideas**\n- Main arguments and insights\n- Supporting evidence\n- Case studies\n\n**Chapter 4: Practical Application**\n- Step-by-step guidance\n- Real-world examples\n- Common pitfalls to avoid\n\n**Chapter 5: Conclusion**\n- Key takeaways\n- Call to action\n- Final thoughts",
        chapter: "Here's the chapter content:\n\nThe dawn of a new era in publishing has arrived. What once required months of painstaking work can now be accomplished in a fraction of the time, without sacrificing quality or authenticity.\n\nIn this chapter, we'll explore the fundamental shifts that have transformed the literary landscape. From the Gutenberg press to digital distribution, each technological leap has democratized access to knowledge and storytelling.\n\nThe modern author stands at the intersection of creativity and technology. With the right tools and mindset, the barriers to publishing have never been lower, while the potential reach has never been greater.",
        enhance: "Here's the enhanced version:\n\nThe publishing world has undergone a remarkable transformation. Where authors once faced insurmountable barriers to entry, today's creators enjoy unprecedented access to global audiences. This shift represents more than technological progress—it embodies a fundamental reimagining of how knowledge and stories flow through society.",
        title: "Here are some title suggestions:\n\n1. **The Art of Digital Storytelling**\n2. **Words Unbound: The New Publishing Revolution**\n3. **From Manuscript to Masterpiece**\n4. **The Author's Digital Canvas**\n5. **Crafting Tomorrow's Classics**",
      };

      const lowerContent = input.content.toLowerCase();
      let responseText = "I'm here to help with your eBook! I can assist with:\n\n- **Outlining** - Create chapter structures and flow\n- **Writing** - Generate chapter content and prose\n- **Editing** - Enhance and refine your text\n- **Titling** - Suggest compelling titles\n- **Metadata** - Optimize descriptions and tags\n\nWhat would you like to work on?";

      for (const [key, response] of Object.entries(mockResponses)) {
        if (lowerContent.includes(key)) {
          responseText = response;
          break;
        }
      }

      if (lowerContent.includes("write") || lowerContent.includes("content")) {
        responseText = mockResponses.chapter;
      } else if (lowerContent.includes("outline") || lowerContent.includes("structure")) {
        responseText = mockResponses.outline;
      } else if (lowerContent.includes("title") || lowerContent.includes("name")) {
        responseText = mockResponses.title;
      } else if (lowerContent.includes("edit") || lowerContent.includes("improve") || lowerContent.includes("enhance")) {
        responseText = mockResponses.enhance;
      }

      await db.insert(aiMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: responseText,
        model: "virtus-ai-v1",
        tokensUsed: responseText.length,
      });

      return { success: true, response: responseText };
    }),

  generateOutline: authedQuery
    .input(z.object({ prompt: z.string(), ebookId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const result = await db.insert(aiConversations).values({
        userId,
        ebookId: input.ebookId,
        title: `Outline: ${input.prompt.slice(0, 50)}...`,
      }).returning();

      const conv = result[0];

      await db.insert(aiMessages).values({
        conversationId: conv.id,
        role: "user",
        content: `Generate an outline for: ${input.prompt}`,
      });

      const outline = `## eBook Outline: ${input.prompt}\n\n### Chapter 1: Introduction\n- Opening hook\n- Problem statement\n- Promise of the book\n\n### Chapter 2: Background & Context\n- Historical overview\n- Current landscape\n- Key players and concepts\n\n### Chapter 3: Core Principles\n- Principle 1: Foundational concepts\n- Principle 2: Practical applications\n- Principle 3: Advanced techniques\n\n### Chapter 4: Case Studies\n- Success story #1\n- Success story #2\n- Lessons learned\n\n### Chapter 5: Implementation Guide\n- Step-by-step process\n- Tools and resources\n- Timeline and milestones\n\n### Chapter 6: Conclusion\n- Key takeaways\n- Next steps\n- Call to action`;

      await db.insert(aiMessages).values({
        conversationId: conv.id,
        role: "assistant",
        content: outline,
        model: "virtus-ai-v1",
        tokensUsed: outline.length,
      });

      return { outline, conversationId: conv.id };
    }),

  generateChapter: authedQuery
    .input(z.object({ title: z.string(), prompt: z.string(), ebookId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const chapter = `# ${input.title}\n\n${input.prompt}\n\nThe journey begins with a single step—a commitment to excellence that separates the extraordinary from the ordinary. In the pages that follow, we will explore the depths of this subject with rigor and passion, uncovering insights that have the power to transform perspectives and ignite action.\n\nEvery great work starts with a vision. The vision for this chapter is to provide a comprehensive yet accessible exploration of the topic at hand, drawing from both timeless wisdom and cutting-edge research. Readers will find practical strategies interwoven with compelling narratives, creating an experience that is both educational and inspiring.\n\nAs we delve deeper, the interconnectedness of ideas becomes apparent. What may seem like disparate concepts at first glance reveal themselves as threads in a larger tapestry of understanding. This holistic approach ensures that readers not only grasp individual points but also appreciate the broader context in which they exist.`;

      return { chapter };
    }),

  enhanceText: authedQuery
    .input(z.object({ text: z.string(), style: z.enum(["professional", "casual", "academic", "creative"]).default("professional") }))
    .mutation(async ({ input }) => {
      const enhanced = `[${input.style} tone applied]\n\n${input.text}\n\nThis refined version elevates the original text while preserving its core message. The language has been carefully chosen to resonate with the intended audience, balancing clarity with sophistication.`;

      return { enhanced };
    }),
});
