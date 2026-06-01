import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const checklistRouter = router({
  // Get all checklist responses for an audit
  getByAudit: protectedProcedure
    .input(z.object({ auditId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.checklistResponse.findMany({
        where: { auditId: input.auditId },
        include: {
          control: { select: { id: true, clause: true, title: true, question: true, category: true } },
          respondedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { control: { sortOrder: "asc" } },
      });
    }),

  // Initialize checklist for an audit (creates empty responses for all controls)
  initialize: protectedProcedure
    .input(z.object({ auditId: z.string(), standardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const controls = await ctx.prisma.control.findMany({
        where: { standardId: input.standardId },
        select: { id: true },
      });

      const data = controls.map((c) => ({
        auditId: input.auditId,
        controlId: c.id,
      }));

      await ctx.prisma.checklistResponse.createMany({ data, skipDuplicates: true });
      return { created: data.length };
    }),

  // Update a checklist response (fill in result)
  respond: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        result: z.enum(["CONFORMITY", "MINOR_NC", "MAJOR_NC", "OBSERVATION", "NOT_APPLICABLE"]),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.checklistResponse.update({
        where: { id: input.id },
        data: {
          result: input.result,
          comment: input.comment,
          respondedById: ctx.user.id,
          respondedAt: new Date(),
        },
      });
    }),
});
