import { NcCategory } from '@audit/database';

/** AI-д өгөх контекст (нэг хяналтын үнэлгээ). */
export interface AiFindingContext {
  standardCode: string;
  clause: string;
  controlTitle: string;
  requirementText?: string | null;
  question?: string | null;
  answer?: string | null;
  evidence?: string | null;
  /** Аудиторын өгсөн үр дүнгийн сануулга (хэрэв байгаа бол). */
  resultHint?: string | null;
}

/** AI-ийн үүсгэсэн бүтэцлэгдсэн дүгнэлт. */
export interface AiFindingOutput {
  finding: string;
  evidence: string;
  requirement: string;
  conclusion: string;
  suggestedCategory: NcCategory | null;
}

export interface AiGenerationResult extends AiFindingOutput {
  modelProvider: string;
  modelName: string;
  tokensUsed?: number | null;
  raw?: unknown;
}

/** AI provider-ийн нэгдсэн интерфейс. */
export interface AiProvider {
  readonly name: string;
  generateFinding(context: AiFindingContext): Promise<AiGenerationResult>;
}
