/**
 * Платформын нийтлэг тогтмолууд.
 */

/** Хэрэглэгчийн роль (Prisma UserRole-тэй таарна). */
export const USER_ROLES = ['AUDITOR', 'ORG_REPRESENTATIVE', 'ADMIN'] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

/** Чеклистийн хариултын үр дүн (Prisma ChecklistResult-тэй таарна). */
export const CHECKLIST_RESULTS = [
  'CONFORMITY',
  'MINOR_NC',
  'MAJOR_NC',
  'OBSERVATION',
  'NOT_APPLICABLE',
] as const;
export type ChecklistResultValue = (typeof CHECKLIST_RESULTS)[number];

/** Чеклистийн хариунаас үл тохирол үүсгэх шаардлагатай эсэх. */
export const CHECKLIST_RESULT_TO_NC: Partial<Record<ChecklistResultValue, 'MAJOR' | 'MINOR' | 'OBSERVATION'>> = {
  MAJOR_NC: 'MAJOR',
  MINOR_NC: 'MINOR',
  OBSERVATION: 'OBSERVATION',
};

/** ID prefix-үүд (жишээ: AUD-2026-001, NC-001). */
export const ID_PREFIX = {
  AUDIT: 'AUD',
  NONCONFORMITY: 'NC',
  CORRECTIVE_ACTION: 'CAPA',
  RISK: 'RISK',
} as const;

/** Зөвшөөрөгдсөн нотлох баримтын MIME төрлүүд. */
export const ALLOWED_EVIDENCE_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'image/jpeg',
  'image/png',
] as const;

/** Файлын дээд хэмжээ (bytes) — 25MB. */
export const MAX_EVIDENCE_FILE_SIZE = 25 * 1024 * 1024;
