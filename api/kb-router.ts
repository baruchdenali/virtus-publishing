// @ts-nocheck
import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { indexKnowledgeBase, getArticle, searchArticles, getCategories } from "./lib/kb-indexer.js";

export const kbRouter = createRouter({
  list: publicQuery.query(() => {
    return indexKnowledgeBase();
  }),

  categories: publicQuery.query(() => {
    return getCategories();
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const article = getArticle(input.slug);
      if (!article) {
        return null;
      }
      return article;
    }),

  search: publicQuery
    .input(z.object({ q: z.string() }))
    .query(({ input }) => {
      if (!input.q.trim()) return [];
      return searchArticles(input.q);
    }),
});
