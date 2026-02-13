import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Discourse API proxy routes
  discourse: router({
    latestTopics: publicProcedure
      .input(z.object({ page: z.number().default(0), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(
            `https://www.horlogeforum.nl/latest.json?page=${input.page}&limit=${input.limit}`
          );
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error fetching latest topics:", error);
          throw error;
        }
      }),

    topicsByCategory: publicProcedure
      .input(
        z.object({
          categorySlug: z.string(),
          page: z.number().default(0),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        try {
          const response = await fetch(
            `https://www.horlogeforum.nl/c/${input.categorySlug}.json?page=${input.page}&limit=${input.limit}`
          );
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error fetching topics by category:", error);
          throw error;
        }
      }),

    topicDetail: publicProcedure
      .input(z.object({ topicId: z.number() }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(`https://www.horlogeforum.nl/t/${input.topicId}.json`);
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error fetching topic detail:", error);
          throw error;
        }
      }),

    topicDetailPage: publicProcedure
      .input(z.object({ topicId: z.number(), page: z.number().default(0) }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(`https://www.horlogeforum.nl/t/${input.topicId}.json?page=${input.page}`);
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error fetching topic detail page:", error);
          throw error;
        }
      }),

    search: publicProcedure
      .input(z.object({ query: z.string(), page: z.number().default(0) }))
      .query(async ({ input }) => {
        try {
          const encodedQuery = encodeURIComponent(input.query);
          const response = await fetch(
            `https://www.horlogeforum.nl/search.json?q=${encodedQuery}&page=${input.page}`
          );
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error searching topics:", error);
          throw error;
        }
      }),

    categories: publicProcedure.query(async () => {
      try {
        const response = await fetch(`https://www.horlogeforum.nl/categories.json`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error("[Discourse API] Error fetching categories:", error);
        throw error;
      }
    }),

    user: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(`https://www.horlogeforum.nl/u/${input.username}.json`);
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error fetching user:", error);
          throw error;
        }
      }),

    createTopic: publicProcedure
      .input(
        z.object({
          title: z.string().min(1),
          raw: z.string().min(1),
          category: z.number(),
          apiUsername: z.string(),
          apiKey: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await fetch(`https://www.horlogeforum.nl/posts.json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Api-Username": input.apiUsername,
              "Api-Key": input.apiKey,
            },
            body: JSON.stringify({
              title: input.title,
              raw: input.raw,
              category: input.category,
              archetype: "regular",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0] || "Failed to create topic");
          }

          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error creating topic:", error);
          throw error;
        }
      }),

    createReply: publicProcedure
      .input(
        z.object({
          topicId: z.number(),
          raw: z.string().min(1),
          apiUsername: z.string(),
          apiKey: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await fetch(`https://www.horlogeforum.nl/posts.json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Api-Username": input.apiUsername,
              "Api-Key": input.apiKey,
            },
            body: JSON.stringify({
              topic_id: input.topicId,
              raw: input.raw,
              archetype: "regular",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0] || "Failed to create reply");
          }

          return await response.json();
        } catch (error) {
          console.error("[Discourse API] Error creating reply:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
