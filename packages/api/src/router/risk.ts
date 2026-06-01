import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const riskFactorEnum = z.enum(["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]);

// Calculate risk level from score
function calculateRiskLevel(score: number): "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score <= 4) return "VERY_LOW";
  if (score <= 9) return "LOW";
  if (score <= 14) return "MEDIUM";
  if (score <= 19) return "HIGH";
  return "CRITICAL";
}

// Convert factor enum to numeric value
function factorToNumber(factor: string): number {
  const map: Record<string, number> = { VERY_LOW: 1, LOW: 2, MEDIUM: 3, HIGH: 4, VERY_HIGH: 5 };
  return map[factor] ?? 1;
}

export const riskRouter = router({
  // List risks (optionally filtered by audit or organization)
  list: protectedProcedure
    .input(
      z.object({
        auditId: z.string().optional(),
        organizationId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input?.auditId) where.auditId = input.auditId;
      if (input?.organizationId) where.organizationId = input.organizationId;

      return ctx.prisma.risk.findMany({
        where,
        include: { owner: { select: { firstName: true, lastName: true } } },
        orderBy: { riskScore: "desc" },
      });
    }),

  // Create a risk
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        riskCode: z.string().optional(),
        auditId: z.string().optional(),
        organizationId: z.string().optional(),
        asset: z.string().optional(),
        threat: z.string().optional(),
        vulnerability: z.string().optional(),
        likelihood: riskFactorEnum,
        impact: riskFactorEnum,
        treatment: z.enum(["MITIGATE", "ACCEPT", "TRANSFER", "AVOID"]).optional(),
        treatmentPlan: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const likelihoodNum = factorToNumber(input.likelihood);
      const impactNum = factorToNumber(input.impact);
      const riskScore = likelihoodNum * impactNum;
      const riskLevel = calculateRiskLevel(riskScore);

      return ctx.prisma.risk.create({
        data: {
          ...input,
          riskScore,
          riskLevel,
          ownerId: ctx.user.id,
        },
      });
    }),

  // Update risk assessment
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        likelihood: riskFactorEnum.optional(),
        impact: riskFactorEnum.optional(),
        treatment: z.enum(["MITIGATE", "ACCEPT", "TRANSFER", "AVOID"]).optional(),
        treatmentPlan: z.string().optional(),
        status: z.enum(["IDENTIFIED", "ASSESSED", "TREATMENT_PLANNED", "IN_TREATMENT", "MITIGATED", "ACCEPTED", "CLOSED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.risk.findUniqueOrThrow({ where: { id: input.id } });

      const likelihood = input.likelihood || existing.likelihood;
      const impact = input.impact || existing.impact;
      const likelihoodNum = factorToNumber(likelihood);
      const impactNum = factorToNumber(impact);
      const riskScore = likelihoodNum * impactNum;
      const riskLevel = calculateRiskLevel(riskScore);

      return ctx.prisma.risk.update({
        where: { id: input.id },
        data: {
          likelihood: input.likelihood || undefined,
          impact: input.impact || undefined,
          riskScore,
          riskLevel,
          treatment: input.treatment || undefined,
          treatmentPlan: input.treatmentPlan || undefined,
          status: input.status || undefined,
        },
      });
    }),
});
