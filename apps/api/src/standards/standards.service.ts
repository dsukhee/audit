import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StandardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.standard.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      include: { _count: { select: { controls: true } } },
    });
  }

  async findOne(id: string) {
    const standard = await this.prisma.standard.findUnique({ where: { id } });
    if (!standard) {
      throw new NotFoundException('Стандарт олдсонгүй.');
    }
    return standard;
  }

  async getControls(standardId: string) {
    await this.findOne(standardId);
    return this.prisma.control.findMany({
      where: { standardId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
