import { NcCategory } from '@audit/database';
import {
  AiFindingContext,
  AiGenerationResult,
  AiProvider,
} from '../ai.types';

interface OpenAiChatResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { total_tokens?: number };
}

/**
 * OpenAI-нийцтэй provider. OpenAI болон локал LLM (Llama/Mistral, Ollama г.м.)-д
 * адил ажиллана — зөвхөн baseUrl/apiKey/model өөр байна.
 */
export class OpenAiProvider implements AiProvider {
  constructor(
    readonly name: string,
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateFinding(context: AiFindingContext): Promise<AiGenerationResult> {
    const system = [
      'Та ISO 27001 аудитын мэргэжилтэн. Доорх мэдээлэлд тулгуурлан аудитын дүгнэлтийг',
      'ЗӨВХӨН дараах JSON форматаар буцаа (тайлбаргүй):',
      '{"finding": "...", "evidence": "...", "requirement": "...", "conclusion": "...", "suggestedCategory": "MAJOR|MINOR|OBSERVATION|null"}',
      'conclusion нь "Major Nonconformity", "Minor Nonconformity", "Observation", "Conformity" эсвэл "Not Applicable" байна.',
    ].join(' ');

    const user = [
      `Стандарт: ${context.standardCode}`,
      `Заалт (Clause): ${context.clause} — ${context.controlTitle}`,
      context.requirementText ? `Шаардлага: ${context.requirementText}` : '',
      context.question ? `Асуулт: ${context.question}` : '',
      `Хариулт: ${context.answer ?? '(байхгүй)'}`,
      `Нотлох баримт: ${context.evidence ?? '(байхгүй)'}`,
      context.resultHint ? `Аудиторын үнэлгээ: ${context.resultHint}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`AI provider алдаа: ${res.status} ${await res.text().catch(() => '')}`);
    }

    const data = (await res.json()) as OpenAiChatResponse;
    const content = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = this.parse(content);

    return {
      ...parsed,
      modelProvider: this.name,
      modelName: this.model,
      tokensUsed: data.usage?.total_tokens ?? null,
      raw: data,
    };
  }

  private parse(content: string): {
    finding: string;
    evidence: string;
    requirement: string;
    conclusion: string;
    suggestedCategory: NcCategory | null;
  } {
    let obj: Record<string, unknown> = {};
    try {
      // ```json ... ``` блок байж болзошгүй тул цэвэрлэнэ
      const cleaned = content.replace(/```json|```/g, '').trim();
      obj = JSON.parse(cleaned);
    } catch {
      obj = { finding: content };
    }

    const cat = String(obj.suggestedCategory ?? '').toUpperCase();
    const suggestedCategory =
      cat === 'MAJOR' ? NcCategory.MAJOR : cat === 'MINOR' ? NcCategory.MINOR : cat === 'OBSERVATION' ? NcCategory.OBSERVATION : null;

    return {
      finding: String(obj.finding ?? ''),
      evidence: String(obj.evidence ?? ''),
      requirement: String(obj.requirement ?? ''),
      conclusion: String(obj.conclusion ?? ''),
      suggestedCategory,
    };
  }
}
