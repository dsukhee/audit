import { BadRequestException, Injectable } from '@nestjs/common';
import { ChecklistResult } from '@audit/database';
import { PrismaService } from '../prisma/prisma.service';
import { AuditsService } from '../audits/audits.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { UpsertResponseDto } from './dto/upsert-response.dto';

@Injectable()
export class ChecklistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditsService: AuditsService,
  ) {}

  /**
   * Аудитын бүх хяналтыг (стандартын дагуу) хариулттай нь хослуулж буцаана.
   * Мөн compliance тоймыг тооцоолно.
   */
  async getChecklist(auditId: string, user: AuthUser) {
    const audit = await this.auditsService.findOne(auditId, user);

    const [controls, responses] = await Promise.all([
      this.prisma.control.findMany({
        where: { standardId: audit.standardId },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.checklistResponse.findMany({ where: { auditId } }),
    ]);

    const responseByControl = new Map(responses.map((r) => [r.controlId, r]));

    const items = controls.map((c) => ({
      control: c,
      response: responseByControl.get(c.id) ?? null,
      // question == null бол энэ нь бүлэг/гарчиг (бөглөх шаардлагагүй)
      answerable: c.question != null,
    }));

    return { audit: { id: audit.id, auditCode: audit.auditCode }, items, summary: this.summarize(items) };
  }

  /** Нэг хяналтын хариултыг хадгална (upsert). */
  async upsertResponse(
    auditId: string,
    controlId: string,
    dto: UpsertResponseDto,
    user: AuthUser,
  ) {
    const audit = await this.auditsService.findOne(auditId, user);

    const control = await this.prisma.control.findUnique({ where: { id: controlId } });
    if (!control || control.standardId !== audit.standardId) {
      throw new BadRequestException('Хяналт энэ аудитын стандартад хамаарахгүй байна.');
    }

    return this.prisma.checklistResponse.upsert({
      where: { auditId_controlId: { auditId, controlId } },
      update: {
        result: dto.result ?? null,
        comment: dto.comment,
        respondedById: user.id,
        respondedAt: new Date(),
      },
      create: {
        auditId,
        controlId,
        result: dto.result ?? null,
        comment: dto.comment,
        respondedById: user.id,
        respondedAt: new Date(),
      },
    });
  }

  private summarize(
    items: { answerable: boolean; response: { result: ChecklistResult | null } | null }[],
  ) {
    const counts: Record<ChecklistResult, number> = {
      CONFORMITY: 0,
      MINOR_NC: 0,
      MAJOR_NC: 0,
      OBSERVATION: 0,
      NOT_APPLICABLE: 0,
    };

    const answerable = items.filter((i) => i.answerable);
    let answered = 0;
    for (const i of answerable) {
      const r = i.response?.result;
      if (r) {
        counts[r] += 1;
        answered += 1;
      }
    }

    const totalControls = answerable.length;
    const evaluatedApplicable = answered - counts.NOT_APPLICABLE; // N/A-г хасна
    const compliancePercent =
      evaluatedApplicable > 0
        ? Math.round((counts.CONFORMITY / evaluatedApplicable) * 100)
        : 0;

    return {
      totalControls,
      answered,
      unanswered: totalControls - answered,
      counts,
      compliancePercent,
    };
  }
}
