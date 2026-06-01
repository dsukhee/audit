import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";

export const organizationRouter = router({
  // List all organizations
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.organization.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { audits: true, users: true } } },
    });
  }),

  // Get single organization
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.organization.findUniqueOrThrow({
        where: { id: input.id },
        include: { users: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }, audits: true },
      });
    }),

  // Create organization (admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        registrationNo: z.string().optional(),
        industry: z.string().optional(),
        address: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.organization.create({ data: input });
    }),
});
