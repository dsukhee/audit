import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiAnalysisType, Prisma } from '@audit/database';
import { PrismaService } from '../prisma/prisma.service';
import { AuditsService } from '../audits/audits.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { GenerateFindingDto } from './dto/generate-finding.dto';
import { AiFindingContext, AiGenerationResult, AiProvider } from './ai.types';
import { HeuristicProvider } from './providers/heuristic.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly heuristic = new HeuristicProvider();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditsService: AuditsService,
  ) {}

  /** Тохиргооноос гадаад provider-ийг бүтээнэ (байхгүй бол null). */
  private buildPrimaryProvider(): AiProvider | null {
    const provider = this.config.get<string>('AI_PROVIDER', 'openai');

    if (provider === 'local') {
      const baseUrl = this.config.get<string>('LOCAL_LLM_BASE_URL', '');
      const model = this.config.get<string>('LOCAL_LLM_MODEL', 'llama3');
      if (!baseUrl) return null;
      return new OpenAiProvider('local', baseUrl, '', model);
    }

    // default: openai
    const apiKey = this.config.get<string>('OPENAI_API_KEY', '');
    if (!apiKey) return null;
    const baseUrl = this.config.get<string>('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    const model = this.config.get<string>('OPENAI_MODEL', 'gpt-4o');
    return new OpenAiProvider('openai', baseUrl, apiKey, model);
  }

  async generateFinding(auditId: string, dto: GenerateFindingDto, user: AuthUser) {
    await this.auditsService.findOne(auditId, user);

    const control = await this.prisma.control.findUnique({
      where: { id: dto.controlId },
      include: { standard: { select: { code: true } } },
    });
    if (!control) throw new NotFoundException('Хяналт олдсонгүй.');

    const context: AiFindingContext = {
      standardCode: control.standard.code,
      clause: control.clause,
      controlTitle: control.title,
      requirementText: control.description,
      question: control.question,
      answer: dto.answer,
      evidence: dto.evidence,
      resultHint: dto.result ?? null,
    };

    const primary = this.buildPrimaryProvider();
    let result: AiGenerationResult;

    if (primary) {
      try {
        result = await primary.generateFinding(context);
      } catch (err) {
        this.logger.warn(
          `Primary AI provider (${primary.name}) амжилтгүй, heuristic руу шилжлээ: ${
            err instanceof Error ? err.message : err
          }`,
        );
        result = await this.heuristic.generateFinding(context);
      }
    } else {
      result = await this.heuristic.generateFinding(context);
    }

    return this.prisma.aiAnalysis.create({
      data: {
        auditId,
        controlId: control.id,
        type: AiAnalysisType.FINDING_GENERATION,
        inputQuestion: control.question,
        inputAnswer: dto.answer,
        inputEvidence: dto.evidence,
        generatedFinding: result.finding,
        generatedEvidence: result.evidence,
        generatedRequirement: result.requirement,
        generatedConclusion: result.conclusion,
        suggestedCategory: result.suggestedCategory,
        modelProvider: result.modelProvider,
        modelName: result.modelName,
        tokensUsed: result.tokensUsed,
        rawResponse: (result.raw as Prisma.InputJsonValue) ?? undefined,
        createdById: user.id,
      },
    });
  }

  async findByAudit(auditId: string, user: AuthUser) {
    await this.auditsService.findOne(auditId, user);
    return this.prisma.aiAnalysis.findMany({
      where: { auditId },
      orderBy: { createdAt: 'desc' },
      include: { control: { select: { clause: true, title: true } } },
    });
  }
}
