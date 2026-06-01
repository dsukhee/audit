import { Injectable, NotFoundException } from '@nestjs/common';
import { NcCategory, NcStatus } from '@audit/database';
import { CHECKLIST_RESULT_TO_NC } from '@audit/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditsService } from '../audits/audits.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateNonconformityDto } from './dto/create-nonconformity.dto';
import { UpdateNonconformityDto } from './dto/update-nonconformity.dto';

@Injectable()
export class NonconformitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditsService: AuditsService,
  ) {}

  /** NC-NNN форматтай дараагийн кодыг үүсгэнэ (бүх системд нэгдсэн дугаарлалт). */
  private async generateNcCode(): Promise<string> {
    const count = await this.prisma.nonconformity.count();
    return `NC-${String(count + 1).padStart(3, '0')}`;
  }

  async create(auditId: string, dto: CreateNonconformityDto, user: AuthUser) {
    await this.auditsService.findOne(auditId, user);
    const ncCode = await this.generateNcCode();
    return this.prisma.nonconformity.create({
      data: {
        ncCode,
        auditId,
        category: dto.category,
        finding: dto.finding,
        clause: dto.clause,
        controlId: dto.controlId,
        checklistResponseId: dto.checklistResponseId,
        evidenceSummary: dto.evidenceSummary,
        impact: dto.impact,
        recommendation: dto.recommendation,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        reportedById: user.id,
      },
    });
  }

  /**
   * Чеклистийн хариунаас үл тохирлыг автоматаар үүсгэнэ (идемпотент).
   * Хэрэв тухайн хариунд аль хэдийн NC байгаа бол шинээр үүсгэхгүй.
   */
  async createFromChecklistResponse(checklistResponseId: string, user: AuthUser) {
    const response = await this.prisma.checklistResponse.findUnique({
      where: { id: checklistResponseId },
      include: { control: true },
    });
    if (!response || !response.result) return null;

    const category = CHECKLIST_RESULT_TO_NC[response.result] as NcCategory | undefined;
    if (!category) return null; // CONFORMITY / N/A → NC үүсгэхгүй

    const existing = await this.prisma.nonconformity.findFirst({
      where: { checklistResponseId },
    });
    if (existing) return existing;

    const ncCode = await this.generateNcCode();
    return this.prisma.nonconformity.create({
      data: {
        ncCode,
        auditId: response.auditId,
        category,
        clause: response.control.clause,
        controlId: response.controlId,
        checklistResponseId,
        finding:
          response.comment ||
          `${response.control.clause} ${response.control.title} — үл тохирол илэрсэн.`,
        reportedById: user.id,
      },
    });
  }

  async findByAudit(auditId: string, user: AuthUser) {
    await this.auditsService.findOne(auditId, user);
    return this.prisma.nonconformity.findMany({
      where: { auditId },
      orderBy: { ncCode: 'asc' },
      include: {
        _count: { select: { correctiveActions: true } },
        control: { select: { clause: true, title: true } },
      },
    });
  }

  async findOne(id: string, user: AuthUser) {
    const nc = await this.prisma.nonconformity.findUnique({
      where: { id },
      include: {
        control: { select: { clause: true, title: true } },
        correctiveActions: {
          orderBy: { createdAt: 'asc' },
          include: { owner: { select: { firstName: true, lastName: true } } },
        },
        evidence: true,
      },
    });
    if (!nc) throw new NotFoundException('Үл тохирол олдсонгүй.');
    await this.auditsService.findOne(nc.auditId, user);
    return nc;
  }

  async update(id: string, dto: UpdateNonconformityDto, user: AuthUser) {
    await this.findOne(id, user);
    return this.prisma.nonconformity.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        closedAt: dto.status === NcStatus.CLOSED ? new Date() : undefined,
      },
    });
  }

  async remove(id: string, user: AuthUser) {
    await this.findOne(id, user);
    await this.prisma.nonconformity.delete({ where: { id } });
    return { success: true };
  }
}
