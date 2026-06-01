import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CapaStatus,
  ChecklistResult,
  NcCategory,
  NcStatus,
  Prisma,
  ReportFormat,
  ReportStatus,
  ReportType,
  RiskLevel,
} from '@audit/database';
import { PrismaService } from '../prisma/prisma.service';
import { AuditsService } from '../audits/audits.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditsService: AuditsService,
  ) {}

  /** Нэг аудитын бүх аналитик үзүүлэлтийг тооцоолно (тайлан + dashboard-д). */
  async buildAuditAnalytics(auditId: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        organization: { select: { name: true } },
        standard: { select: { code: true, id: true } },
        leadAuditor: { select: { firstName: true, lastName: true } },
      },
    });
    if (!audit) throw new NotFoundException('Аудит олдсонгүй.');

    const [applicableControls, responses, ncByCategory, ncByStatus, capaByStatus, riskByLevel] =
      await Promise.all([
        this.prisma.control.count({
          where: { standardId: audit.standardId, question: { not: null } },
        }),
        this.prisma.checklistResponse.groupBy({
          by: ['result'],
          where: { auditId, result: { not: null } },
          _count: { _all: true },
        }),
        this.prisma.nonconformity.groupBy({
          by: ['category'],
          where: { auditId },
          _count: { _all: true },
        }),
        this.prisma.nonconformity.groupBy({
          by: ['status'],
          where: { auditId },
          _count: { _all: true },
        }),
        this.prisma.correctiveAction.groupBy({
          by: ['status'],
          where: { nonconformity: { auditId } },
          _count: { _all: true },
        }),
        this.prisma.risk.groupBy({
          by: ['riskLevel'],
          where: { auditId },
          _count: { _all: true },
        }),
      ]);

    const checklistCounts = this.zero<ChecklistResult>(Object.values(ChecklistResult));
    for (const r of responses) {
      if (r.result) checklistCounts[r.result] = r._count._all;
    }
    const answered = Object.values(checklistCounts).reduce((a, b) => a + b, 0);
    const evaluatedApplicable = answered - checklistCounts.NOT_APPLICABLE;
    const compliancePercent =
      evaluatedApplicable > 0
        ? Math.round((checklistCounts.CONFORMITY / evaluatedApplicable) * 100)
        : 0;

    return {
      audit: {
        id: audit.id,
        auditCode: audit.auditCode,
        title: audit.title,
        organization: audit.organization?.name,
        standard: audit.standard?.code,
        status: audit.status,
        leadAuditor: audit.leadAuditor
          ? `${audit.leadAuditor.firstName} ${audit.leadAuditor.lastName}`
          : null,
      },
      checklist: {
        totalControls: applicableControls,
        answered,
        unanswered: Math.max(applicableControls - answered, 0),
        counts: checklistCounts,
        compliancePercent,
      },
      nonconformities: {
        total: ncByCategory.reduce((a, b) => a + b._count._all, 0),
        byCategory: this.toMap<NcCategory>(ncByCategory, 'category'),
        byStatus: this.toMap<NcStatus>(ncByStatus, 'status'),
      },
      capa: {
        total: capaByStatus.reduce((a, b) => a + b._count._all, 0),
        byStatus: this.toMap<CapaStatus>(capaByStatus, 'status'),
      },
      risks: {
        total: riskByLevel.reduce((a, b) => a + b._count._all, 0),
        byLevel: this.toMap<RiskLevel>(riskByLevel, 'riskLevel'),
      },
    };
  }

  /** Detailed findings — NC жагсаалт CAPA-тайгаа. */
  private async buildDetailedFindings(auditId: string) {
    const ncs = await this.prisma.nonconformity.findMany({
      where: { auditId },
      orderBy: { ncCode: 'asc' },
      include: {
        control: { select: { clause: true, title: true } },
        correctiveActions: { select: { action: true, status: true, ownerLabel: true } },
      },
    });

    return ncs.map((nc) => ({
      ncCode: nc.ncCode,
      category: nc.category,
      clause: nc.clause ?? nc.control?.clause ?? null,
      finding: nc.finding,
      evidence: nc.evidenceSummary,
      impact: nc.impact,
      recommendation: nc.recommendation,
      status: nc.status,
      correctiveActions: nc.correctiveActions,
    }));
  }

  async generateReport(
    auditId: string,
    type: ReportType,
    format: ReportFormat,
    user: AuthUser,
  ) {
    await this.auditsService.findOne(auditId, user);

    const analytics = await this.buildAuditAnalytics(auditId);
    const includeFindings =
      type === ReportType.DETAILED_FINDINGS ||
      type === ReportType.FULL_AUDIT_REPORT ||
      type === ReportType.MANAGEMENT_REPORT;
    const findings = includeFindings ? await this.buildDetailedFindings(auditId) : [];

    const contentJson = {
      generatedAt: new Date().toISOString(),
      type,
      executiveSummary: analytics,
      detailedFindings: findings,
    };

    return this.prisma.report.create({
      data: {
        auditId,
        type,
        format,
        title: `${analytics.audit.auditCode} — ${type}`,
        status: ReportStatus.GENERATED,
        contentJson: contentJson as unknown as Prisma.InputJsonObject,
        generatedById: user.id,
        generatedAt: new Date(),
      },
    });
  }

  async listReports(auditId: string, user: AuthUser) {
    await this.auditsService.findOne(auditId, user);
    return this.prisma.report.findMany({
      where: { auditId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, format: true, title: true, status: true, generatedAt: true },
    });
  }

  async getReport(id: string, user: AuthUser) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Тайлан олдсонгүй.');
    await this.auditsService.findOne(report.auditId, user);
    return report;
  }

  /** Бүх аудитыг хамарсан dashboard үзүүлэлт. */
  async getDashboard(user: AuthUser) {
    const audits = await this.auditsService.findAll(user);
    const auditIds = audits.map((a) => a.id);

    const [ncByCategory, riskByLevel, capaByStatus] = await Promise.all([
      this.prisma.nonconformity.groupBy({
        by: ['category'],
        where: { auditId: { in: auditIds } },
        _count: { _all: true },
      }),
      this.prisma.risk.groupBy({
        by: ['riskLevel'],
        where: { auditId: { in: auditIds } },
        _count: { _all: true },
      }),
      this.prisma.correctiveAction.groupBy({
        by: ['status'],
        where: { nonconformity: { auditId: { in: auditIds } } },
        _count: { _all: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const a of audits) byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;

    return {
      totalAudits: audits.length,
      auditsByStatus: byStatus,
      nonconformities: {
        total: ncByCategory.reduce((a, b) => a + b._count._all, 0),
        byCategory: this.toMap<NcCategory>(ncByCategory, 'category'),
      },
      capa: { byStatus: this.toMap<CapaStatus>(capaByStatus, 'status') },
      risks: {
        total: riskByLevel.reduce((a, b) => a + b._count._all, 0),
        byLevel: this.toMap<RiskLevel>(riskByLevel, 'riskLevel'),
      },
    };
  }

  // --- helpers ---
  private zero<T extends string>(keys: T[]): Record<T, number> {
    return keys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as Record<T, number>);
  }

  private toMap<T extends string>(
    rows: Array<{ _count: { _all: number } } & Record<string, unknown>>,
    key: string,
  ): Record<T, number> {
    const out: Record<string, number> = {};
    for (const row of rows) {
      out[String(row[key])] = row._count._all;
    }
    return out as Record<T, number>;
  }
}
