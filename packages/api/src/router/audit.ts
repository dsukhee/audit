import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const auditRouter = router({
  // List all audits
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "PLANNED", "IN_PROGRESS", "FIELDWORK_COMPLETE", "REPORTING", "COMPLETED", "CLOSED", "CANCELLED"]).optional(),
        organizationId: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;

      const where: any = {};
      if (input?.status) where.status = input.status;
      if (input?.organizationId) where.organizationId = input.organizationId;

      const [audits, total] = await Promise.all([
        ctx.prisma.audit.findMany({
          where,
          include: {
            organization: { select: { id: true, name: true } },
            leadAuditor: { select: { id: true, firstName: true, lastName: true } },
            standard: { select: { id: true, code: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.prisma.audit.count({ where }),
      ]);

      return { audits, total, page, pageSize };
    }),

  // Get single audit by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.audit.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          organization: true,
          leadAuditor: { select: { id: true, firstName: true, lastName: true, email: true } },
          standard: true,
          teamMembers: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          _count: { select: { checklistResponses: true, nonconformities: true, evidence: true } },
        },
      });
    }),

  // Create a new audit
  create: protectedProcedure
    .input(
      z.object({
        auditCode: z.string().min(1),
        title: z.string().optional(),
        organizationId: z.string(),
        standardId: z.string(),
        scope: z.string().optional(),
        objectives: z.string().optional(),
        plannedStartDate: z.string().optional(),
        plannedEndDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.audit.create({
        data: {
          auditCode: input.auditCode,
          title: input.title,
          organizationId: input.organizationId,
          standardId: input.standardId,
          leadAuditorId: ctx.user.id,
          scope: input.scope,
          objectives: input.objectives,
          plannedStartDate: input.plannedStartDate ? new Date(input.plannedStartDate) : undefined,
          plannedEndDate: input.plannedEndDate ? new Date(input.plannedEndDate) : undefined,
        },
      });
    }),

  // Update audit status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["DRAFT", "PLANNED", "IN_PROGRESS", "FIELDWORK_COMPLETE", "REPORTING", "COMPLETED", "CLOSED", "CANCELLED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.audit.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
