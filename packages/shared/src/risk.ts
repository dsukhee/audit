/**
 * ISO 27005 эрсдэлийн үнэлгээ — 5x5 matrix.
 *
 *   riskScore = likelihood(1-5) × impact(1-5) → 1..25
 *
 *   Banding:
 *     1-4   → VERY_LOW
 *     5-9   → LOW
 *     10-14 → MEDIUM
 *     15-19 → HIGH
 *     20-25 → CRITICAL
 *
 * Эдгээр төрлүүд Prisma-ийн RiskFactor / RiskLevel enum-тэй яг таарна.
 * (shared багц нь @prisma/client-ээс хараат бус байхын тулд literal type ашиглав.)
 */

export type RiskFactorLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type RiskLevelValue = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** RiskFactor → тоон утга (1-5) */
export const RISK_FACTOR_VALUE: Record<RiskFactorLevel, number> = {
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  VERY_HIGH: 5,
};

export interface RiskBand {
  level: RiskLevelValue;
  min: number;
  max: number;
  /** Heatmap өнгө (Tailwind/HEX) */
  color: string;
  label: string;
}

/** Эрсдэлийн түвшний босго (1..25) */
export const RISK_BANDS: RiskBand[] = [
  { level: 'VERY_LOW', min: 1, max: 4, color: '#16a34a', label: 'Маш бага' },
  { level: 'LOW', min: 5, max: 9, color: '#65a30d', label: 'Бага' },
  { level: 'MEDIUM', min: 10, max: 14, color: '#ca8a04', label: 'Дунд' },
  { level: 'HIGH', min: 15, max: 19, color: '#ea580c', label: 'Өндөр' },
  { level: 'CRITICAL', min: 20, max: 25, color: '#dc2626', label: 'Эгзэгтэй' },
];

/** RiskFactor-ийн тоон утгыг буцаана (1-5). */
export function riskFactorValue(factor: RiskFactorLevel): number {
  return RISK_FACTOR_VALUE[factor];
}

/** likelihood × impact → riskScore (1..25). */
export function computeRiskScore(
  likelihood: RiskFactorLevel,
  impact: RiskFactorLevel,
): number {
  return RISK_FACTOR_VALUE[likelihood] * RISK_FACTOR_VALUE[impact];
}

/** riskScore (1..25) → RiskLevel. */
export function computeRiskLevel(score: number): RiskLevelValue {
  const band = RISK_BANDS.find((b) => score >= b.min && score <= b.max);
  if (!band) {
    throw new Error(`Эрсдэлийн оноо хүрээнээс гарсан байна: ${score} (1..25 байх ёстой)`);
  }
  return band.level;
}

/** Нэг алхамд score + level-ийг тооцоолно. */
export function assessRisk(
  likelihood: RiskFactorLevel,
  impact: RiskFactorLevel,
): { riskScore: number; riskLevel: RiskLevelValue } {
  const riskScore = computeRiskScore(likelihood, impact);
  return { riskScore, riskLevel: computeRiskLevel(riskScore) };
}

/** Тухайн түвшний band мэдээллийг (өнгө, шошго) буцаана. */
export function getRiskBand(level: RiskLevelValue): RiskBand {
  const band = RISK_BANDS.find((b) => b.level === level);
  if (!band) {
    throw new Error(`Тодорхойгүй эрсдэлийн түвшин: ${level}`);
  }
  return band;
}
