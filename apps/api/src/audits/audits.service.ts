import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditTeamRole, Prisma, UserRole } from '@audit/database';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';

@Injectable()
export class AuditsService {
  constructor(private readonly prisma: PrismaService) {}

  /** AUD-YYYY-NNN форматтай дараагийн кодыг үүсгэнэ. */
  private async generateAuditCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AUD-${year}-`;
    const count = await this.prisma.audit.count({
      where: { auditCode: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateAuditDto, user: AuthUser) {
    const [org, standard] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: dto.organizationId } }),
      this.prisma.standard.findUnique({ where: { id: dto.standardId } }),
    ]);
    if (!org) throw new BadRequestException('Байгууллага олдсонгүй.');
    if (!standard) throw new BadRequestException('Стандарт олдсонгүй.');

    const leadAuditorId = dto.leadAuditorId ?? user.id;
    const lead = await this.prisma.user.findUnique({ where: { id: leadAuditorId } });
    if (!lead) throw new BadRequestException('Тэргүүлэх аудитор олдсонгүй.');

    const auditCode = await this.generateAuditCode();

    return this.prisma.audit.create({
      data: {
        auditCode,
        title: dto.title,
        organizationId: dto.organizationId,
        standardId: dto.standardId,
        leadAuditorId,
        scope: dto.scope,
        objectives: dto.objectives,
        plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : null,
        plannedEndDate: dto.plannedEndDate ? new Date(dto.plannedEndDate) : null,
        // Тэргүүлэх аудиторыг багийн гишүүнээр автоматаар нэмнэ
        teamMembers: {
          create: { userId: leadAuditorId, teamRole: AuditTeamRole.LEAD_AUDITOR },
        },
      },
      include: this.detailInclude(),
    });
  }

  findAll(user: AuthUser) {
    const where: Prisma.AuditWhereInput =
      user.role === UserRole.ORG_REPRESENTATIVE
        ? { organization: { users: { some: { id: user.id } } } }
        : {};

    return this.prisma.audit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        standard: { select: { id: true, code: true } },
        leadAuditor: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { nonconformities: true, checklistResponses: true } },
      },
    });
  }

  async findOne(id: string, user: AuthUser) {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: this.detailInclude(),
    });
    if (!audit) throw new NotFoundException('Аудит олдсонгүй.');

    if (
      user.role === UserRole.ORG_REPRESENTATIVE &&
      !(await this.userBelongsToOrg(user.id, audit.organizationId))
    ) {
      throw new ForbiddenException('Энэ аудитад хандах эрхгүй байна.');
    }
    return audit;
  }

  async update(id: string, dto: UpdateAuditDto, user: AuthUser) {
    await this.findOne(id, user);
    return this.prisma.audit.update({
      where: { id },
      data: {
        ...dto,
        plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : undefined,
        plannedEndDate: dto.plannedEndDate ? new Date(dto.plannedEndDate) : undefined,
        actualStartDate: dto.actualStartDate ? new Date(dto.actualStartDate) : undefined,
        actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : undefined,
      },
      include: this.detailInclude(),
    });
  }

  async addTeamMember(id: string, dto: AddTeamMemberDto, user: AuthUser) {
    await this.findOne(id, user);
    const member = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!member) throw new BadRequestException('Хэрэглэгч олдсонгүй.');

    return this.prisma.auditTeamMember.upsert({
      where: { auditId_userId: { auditId: id, userId: dto.userId } },
      update: { teamRole: dto.teamRole ?? AuditTeamRole.AUDITOR },
      create: {
        auditId: id,
        userId: dto.userId,
        teamRole: dto.teamRole ?? AuditTeamRole.AUDITOR,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async removeTeamMember(id: string, memberId: string, user: AuthUser) {
    await this.findOne(id, user);
    await this.prisma.auditTeamMember.delete({ where: { id: memberId } });
    return { success: true };
  }

  async remove(id: string, user: AuthUser) {
    await this.findOne(id, user);
    await this.prisma.audit.delete({ where: { id } });
    return { success: true };
  }

  private async userBelongsToOrg(userId: string, organizationId: string): Promise<boolean> {
    const u = await this.prisma.user.findUnique({ where: { id: userId } });
    return u?.organizationId === organizationId;
  }

  private detailInclude() {
    return {
      organization: true,
      standard: true,
      leadAuditor: { select: { id: true, firstName: true, lastName: true, email: true } },
      teamMembers: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      },
      _count: { select: { nonconformities: true, checklistResponses: true, evidence: true } },
    } satisfies Prisma.AuditInclude;
  }
}
