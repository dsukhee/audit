import { Injectable, NotFoundException } from '@nestjs/common';
import { CapaStatus } from '@audit/database';
import { PrismaService } from '../prisma/prisma.service';
import { AuditsService } from '../audits/audits.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaDto, VerifyCapaDto } from './dto/update-capa.dto';

@Injectable()
export class CapaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditsService: AuditsService,
  ) {}

  private async generateCapaCode(): Promise<string> {
    const count = await this.prisma.correctiveAction.count();
    return `CAPA-${String(count + 1).padStart(3, '0')}`;
  }

  /** NC-ийн дамжуулан аудитад хандах эрхийг шалгана. */
  private async assertNcAccess(nonconformityId: string, user: AuthUser) {
    const nc = await this.prisma.nonconformity.findUnique({
      where: { id: nonconformityId },
      select: { id: true, auditId: true },
    });
    if (!nc) throw new NotFoundException('Үл тохирол олдсонгүй.');
    await this.auditsService.findOne(nc.auditId, user);
    return nc;
  }

  async create(nonconformityId: string, dto: CreateCapaDto, user: AuthUser) {
    await this.assertNcAccess(nonconformityId, user);
    const capaCode = await this.generateCapaCode();
    return this.prisma.correctiveAction.create({
      data: {
        capaCode,
        nonconformityId,
        action: dto.action,
        rootCause: dto.rootCause,
        ownerId: dto.ownerId,
        ownerLabel: dto.ownerLabel,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async findByNc(nonconformityId: string, user: AuthUser) {
    await this.assertNcAccess(nonconformityId, user);
    return this.prisma.correctiveAction.findMany({
      where: { nonconformityId },
      orderBy: { createdAt: 'asc' },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        verifiedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  private async getOwnedCapa(id: string, user: AuthUser) {
    const capa = await this.prisma.correctiveAction.findUnique({ where: { id } });
    if (!capa) throw new NotFoundException('Залруулах арга хэмжээ олдсонгүй.');
    await this.assertNcAccess(capa.nonconformityId, user);
    return capa;
  }

  async update(id: string, dto: UpdateCapaDto, user: AuthUser) {
    await this.getOwnedCapa(id, user);
    return this.prisma.correctiveAction.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt: dto.status === CapaStatus.CLOSED ? new Date() : undefined,
      },
    });
  }

  /** Арга хэмжээг баталгаажуулна (VERIFIED). */
  async verify(id: string, dto: VerifyCapaDto, user: AuthUser) {
    await this.getOwnedCapa(id, user);
    return this.prisma.correctiveAction.update({
      where: { id },
      data: {
        status: CapaStatus.VERIFIED,
        verifiedById: user.id,
        verifiedAt: new Date(),
        verificationNote: dto.verificationNote,
      },
    });
  }

  async remove(id: string, user: AuthUser) {
    await this.getOwnedCapa(id, user);
    await this.prisma.correctiveAction.delete({ where: { id } });
    return { success: true };
  }
}
