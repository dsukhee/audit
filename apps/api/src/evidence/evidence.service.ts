import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EvidenceFileType } from '@audit/database';
import { ALLOWED_EVIDENCE_MIME_TYPES, MAX_EVIDENCE_FILE_SIZE } from '@audit/shared';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditsService } from '../audits/audits.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

const MIME_TO_TYPE: Record<string, EvidenceFileType> = {
  'application/pdf': EvidenceFileType.PDF,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': EvidenceFileType.DOCX,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': EvidenceFileType.XLSX,
  'image/jpeg': EvidenceFileType.JPG,
  'image/png': EvidenceFileType.PNG,
};

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly auditsService: AuditsService,
  ) {}

  async create(
    auditId: string,
    file: Express.Multer.File | undefined,
    dto: CreateEvidenceDto,
    user: AuthUser,
  ) {
    await this.auditsService.findOne(auditId, user);

    if (!file) {
      throw new BadRequestException('Файл хавсаргаагүй байна.');
    }
    if (!(ALLOWED_EVIDENCE_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException(`Зөвшөөрөгдөөгүй файлын төрөл: ${file.mimetype}`);
    }
    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      throw new BadRequestException('Файлын хэмжээ хэтэрсэн (дээд тал нь 25MB).');
    }

    const fileType = MIME_TO_TYPE[file.mimetype] ?? EvidenceFileType.OTHER;
    const safeName = file.originalname.replace(/[^\w.\-]+/g, '_');
    const storageKey = `audits/${auditId}/${randomUUID()}-${safeName}`;

    await this.storage.upload(storageKey, file.buffer, file.mimetype);

    return this.prisma.evidence.create({
      data: {
        auditId,
        controlId: dto.controlId,
        checklistResponseId: dto.checklistResponseId,
        nonconformityId: dto.nonconformityId,
        fileName: file.originalname,
        fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        storageKey,
        description: dto.description,
        uploadedById: user.id,
      },
    });
  }

  async findByAudit(auditId: string, user: AuthUser) {
    await this.auditsService.findOne(auditId, user);
    return this.prisma.evidence.findMany({
      where: { auditId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        control: { select: { clause: true, title: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getDownloadUrl(id: string, user: AuthUser) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id } });
    if (!evidence) throw new NotFoundException('Нотлох баримт олдсонгүй.');
    await this.auditsService.findOne(evidence.auditId, user);
    const url = await this.storage.getDownloadUrl(evidence.storageKey);
    return { url, fileName: evidence.fileName };
  }

  async remove(id: string, user: AuthUser) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id } });
    if (!evidence) throw new NotFoundException('Нотлох баримт олдсонгүй.');
    await this.auditsService.findOne(evidence.auditId, user);

    await this.storage.delete(evidence.storageKey).catch(() => undefined);
    await this.prisma.evidence.delete({ where: { id } });
    return { success: true };
  }
}
