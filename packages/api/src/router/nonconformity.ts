import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const nonconformityRouter = router({
  // List NCs for an audit
  listByAudit: protectedProcedure
    .input(z.object({ auditId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.nonconformity.findMany({
        where: { auditId: input.auditId },
        include: {
          control: { select: { clause: true, title: true } },
          reportedBy: { select: { firstName: true, lastName: true } },
          _count: { select: { correctiveActions: true, evidence: true } },
        },
        orderBy: { identifiedAt: "desc" },
      });
    }),

  // Get single NC
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.nonconformity.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          control: true,
          reportedBy: { select: { firstName: true, lastName: true, email: true } },
          correctiveActions: { include: { owner: { select: { firstName: true, lastName: true } } } },
          evidence: true,
        },
      });
    }),

  // Create a new NC
  create: protectedProcedure
    .input(
      z.object({
        ncCode: z.string(),
        auditId: z.string(),
        controlId: z.string().optional(),
        checklistResponseId: z.string().optional(),
        clause: z.string().optional(),
        category: z.enum(["MAJOR", "MINOR", "OBSERVATION"]),
        finding: z.string().min(1),
        evidenceSummary: z.string().optional(),
        impact: z.string().optional(),
        recommendation: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.nonconformity.create({
        data: {
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          reportedById: ctx.user.id,
        },
      });
    }),

  // Update NC status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "VERIFIED", "CLOSED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.nonconformity.update({
        where: { id: input.id },
        data: {
          status: input.status,
          closedAt: input.status === "CLOSED" ? new Date() : undefined,
        },
      });
    }),
});
