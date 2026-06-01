import { NcCategory } from '@audit/database';
import {
  AiFindingContext,
  AiGenerationResult,
  AiProvider,
} from '../ai.types';

/**
 * Офлайн дүрэмд суурилсан provider — гадаад сүлжээ шаардахгүй.
 * AI provider тохируулаагүй эсвэл алдаа гарсан үед нөөц (fallback) болж ажиллана.
 */
export class HeuristicProvider implements AiProvider {
  readonly name = 'heuristic';

  // Үл тохирол сэжиглүүлэх түлхүүр үгс (монгол + англи)
  private static readonly NEGATIVE = [
    'байхгүй',
    'хийгдээгүй',
    'шинэчлэгдээгүй',
    'батлаагүй',
    'мөрддөггүй',
    'хэрэгжээгүй',
    'дутуу',
    'хоцорсон',
    'no ',
    'not ',
    'missing',
    'lack',
    'without',
    'fail',
  ];

  generateFinding(context: AiFindingContext): Promise<AiGenerationResult> {
    const { conclusion, category } = this.classify(context);

    const requirement = `${context.standardCode} Clause ${context.clause}`;

    const finding =
      category === null
        ? `${context.clause} ${context.controlTitle}: шаардлага хангагдсан байна. ${context.answer ?? ''}`.trim()
        : `${context.clause} ${context.controlTitle}: ${context.answer ?? 'тогтоосон зөрчил илэрсэн.'}`.trim();

    const evidence = context.evidence?.trim()
      ? context.evidence.trim()
      : 'Нотлох баримт ирүүлээгүй / тодорхойлогдоогүй.';

    return Promise.resolve({
      finding,
      evidence,
      requirement,
      conclusion,
      suggestedCategory: category,
      modelProvider: this.name,
      modelName: 'rule-based-v1',
      tokensUsed: null,
    });
  }

  private classify(context: AiFindingContext): {
    conclusion: string;
    category: NcCategory | null;
  } {
    // 1. Аудиторын өгсөн үр дүн (result hint) тэргүүлэх ач холбогдолтой
    const hint = context.resultHint?.toUpperCase();
    if (hint) {
      if (hint.includes('MAJOR')) return { conclusion: 'Major Nonconformity', category: NcCategory.MAJOR };
      if (hint.includes('MINOR')) return { conclusion: 'Minor Nonconformity', category: NcCategory.MINOR };
      if (hint.includes('OBSERVATION')) return { conclusion: 'Observation', category: NcCategory.OBSERVATION };
      if (hint.includes('CONFORMITY')) return { conclusion: 'Conformity', category: null };
      if (hint.includes('NOT_APPLICABLE') || hint.includes('N/A')) return { conclusion: 'Not Applicable', category: null };
    }

    // 2. Хариултын текстээс эвристик байдлаар тааварлах
    const text = `${context.answer ?? ''} ${context.evidence ?? ''}`.toLowerCase();
    const negativeHits = HeuristicProvider.NEGATIVE.filter((w) => text.includes(w)).length;

    if (negativeHits >= 2) return { conclusion: 'Major Nonconformity', category: NcCategory.MAJOR };
    if (negativeHits === 1) return { conclusion: 'Minor Nonconformity', category: NcCategory.MINOR };
    if (!text.trim()) return { conclusion: 'Observation', category: NcCategory.OBSERVATION };
    return { conclusion: 'Conformity', category: null };
  }
}
