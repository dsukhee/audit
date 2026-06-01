import { Injectable, NotFoundException } from '@nestjs/common';
import { RiskFactor } from '@audit/database';
import { assessRisk, type RiskFactorLevel } from '@audit/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditsService } from '../audits/audits.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';

@Injectable()
export class RisksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditsService: AuditsService,
  ) {}

  private async generateRiskCode(): Promise<string> {
    const count = await this.prisma.risk.count();
    return `RISK-${String(count + 1).padStart(3, '0')}`;
  }

  async create(auditId: string, dto: CreateRiskDto, user: AuthUser) {
    const audit = await this.auditsService.findOne(auditId, user);
    const { riskScore, riskLevel } = assessRisk(
      dto.likelihood as RiskFactorLevel,
      dto.impact as RiskFactorLevel,
    );
    const riskCode = await this.generateRiskCode();

    return this.prisma.risk.create({
      data: {
        riskCode,
        auditId,
        organizationId: audit.organizationId,
        title: dto.title,
        description: dto.description,
        asset: dto.asset,
        threat: dto.threat,
        vulnerability: dto.vulnerability,
        likelihood: dto.likelihood,
        impact: dto.impact,
        riskScore,
        riskLevel,
        treatment: dto.treatment,
        treatmentPlan: dto.treatmentPlan,
        ownerId: dto.ownerId,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : null,
      },
    });
  }

  async findByAudit(auditId: string, user: AuthUser) {
    await this.auditsService.findOne(auditId, user);
    return this.prisma.risk.findMany({
      where: { auditId },
      orderBy: { riskScore: 'desc' },
      include: { owner: { select: { firstName: true, lastName: true } } },
    });
  }

  async findOne(id: string, user: AuthUser) {
    const risk = await this.prisma.risk.findUnique({ where: { id } });
    if (!risk) throw new NotFoundException('Эрсдэл олдсонгүй.');
    if (risk.auditId) await this.auditsService.findOne(risk.auditId, user);
    return risk;
  }

  async update(id: string, dto: UpdateRiskDto, user: AuthUser) {
    const existing = await this.findOne(id, user);

    // likelihood эсвэл impact өөрчлөгдвөл оноо/түвшинг дахин тооцоолно
    const likelihood = (dto.likelihood ?? existing.likelihood) as RiskFactor;
    const impact = (dto.impact ?? existing.impact) as RiskFactor;
    const recompute = dto.likelihood !== undefined || dto.impact !== undefined;
    const scored = recompute
      ? assessRisk(likelihood as RiskFactorLevel, impact as RiskFactorLevel)
      : null;

    return this.prisma.risk.update({
      where: { id },
      data: {
        ...dto,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : undefined,
        ...(scored ? { riskScore: scored.riskScore, riskLevel: scored.riskLevel } : {}),
      },
    });
  }

  async remove(id: string, user: AuthUser) {
    await this.findOne(id, user);
    await this.prisma.risk.delete({ where: { id } });
    return { success: true };
  }
}
