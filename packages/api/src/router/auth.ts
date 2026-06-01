import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { hashPassword, comparePassword, signToken } from "../lib/auth";

export const authRouter = router({
  // Register a new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.enum(["AUDITOR", "ORG_REPRESENTATIVE", "ADMIN"]).default("AUDITOR"),
        organizationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "И-мэйл бүртгэлтэй байна" });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          organizationId: input.organizationId,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      return { user, token };
    }),

  // Login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !user.isActive) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "И-мэйл эсвэл нууц үг буруу" });
      }

      const valid = await comparePassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "И-мэйл эсвэл нууц үг буруу" });
      }

      const token = signToken({ userId: user.id, email: user.email, role: user.role });

      // Log the login
      await ctx.prisma.auditLog.create({
        data: { userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id },
      });

      return {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        token,
      };
    }),

  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});
