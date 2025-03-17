import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return post ?? null;
  }),
});
