/**
 * API client туслах — NestJS backend рүү хүсэлт илгээнэ.
 * Token-ийг localStorage-д хадгална (Phase 1 энгийн хувилбар).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'audit_access_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError;
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message ?? 'Алдаа гарлаа';
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: authHeaders({ 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) }),
  });
  return handle<T>(res);
}

/** Multipart файл upload (Content-Type-ийг browser өөрөө тохируулна). */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  return handle<T>(res);
}

// ============================================================================
// Төрлүүд
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Organization {
  id: string;
  name: string;
  industry?: string | null;
  registrationNo?: string | null;
  _count?: { audits: number; users: number };
}

export interface Standard {
  id: string;
  code: string;
  name: string;
  _count?: { controls: number };
}

export interface Audit {
  id: string;
  auditCode: string;
  title?: string | null;
  status: string;
  scope?: string | null;
  objectives?: string | null;
  organization?: { id: string; name: string };
  standard?: { id: string; code: string };
  leadAuditor?: { id: string; firstName: string; lastName: string };
  teamMembers?: TeamMember[];
  _count?: { nonconformities: number; checklistResponses: number; evidence: number };
}

export interface TeamMember {
  id: string;
  teamRole: string;
  user: { id: string; firstName: string; lastName: string; email: string; role?: string };
}

export interface Control {
  id: string;
  clause: string;
  title: string;
  question?: string | null;
  category?: string | null;
  parentId?: string | null;
}

export type ChecklistResultValue =
  | 'CONFORMITY'
  | 'MINOR_NC'
  | 'MAJOR_NC'
  | 'OBSERVATION'
  | 'NOT_APPLICABLE';

export interface ChecklistResponse {
  id: string;
  result: ChecklistResultValue | null;
  comment?: string | null;
}

export interface ChecklistItem {
  control: Control;
  response: ChecklistResponse | null;
  answerable: boolean;
}

export interface ChecklistSummary {
  totalControls: number;
  answered: number;
  unanswered: number;
  counts: Record<ChecklistResultValue, number>;
  compliancePercent: number;
}

export interface Checklist {
  audit: { id: string; auditCode: string };
  items: ChecklistItem[];
  summary: ChecklistSummary;
}

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: number | null;
  description?: string | null;
  uploadedAt: string;
  control?: { clause: string; title: string } | null;
  uploadedBy?: { firstName: string; lastName: string } | null;
}

// ============================================================================
// Endpoint wrappers
// ============================================================================

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const login = (email: string, password: string) =>
  apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiFetch<User>('/auth/me');

export const getOrganizations = () => apiFetch<Organization[]>('/organizations');
export const createOrganization = (data: { name: string; industry?: string }) =>
  apiFetch<Organization>('/organizations', { method: 'POST', body: JSON.stringify(data) });

export const getStandards = () => apiFetch<Standard[]>('/standards');

export const getAudits = () => apiFetch<Audit[]>('/audits');
export const getAudit = (id: string) => apiFetch<Audit>(`/audits/${id}`);
export const createAudit = (data: {
  organizationId: string;
  standardId: string;
  title?: string;
  scope?: string;
}) => apiFetch<Audit>('/audits', { method: 'POST', body: JSON.stringify(data) });
export const updateAudit = (id: string, data: Record<string, unknown>) =>
  apiFetch<Audit>(`/audits/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const getChecklist = (auditId: string) =>
  apiFetch<Checklist>(`/audits/${auditId}/checklist`);
export const upsertChecklistResponse = (
  auditId: string,
  controlId: string,
  data: { result?: ChecklistResultValue; comment?: string },
) =>
  apiFetch<{ response: ChecklistResponse; nonconformity: Nonconformity | null }>(
    `/audits/${auditId}/checklist/${controlId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );

export const getEvidence = (auditId: string) =>
  apiFetch<Evidence[]>(`/audits/${auditId}/evidence`);
export const uploadEvidence = (auditId: string, formData: FormData) =>
  apiUpload<Evidence>(`/audits/${auditId}/evidence`, formData);
export const getEvidenceDownloadUrl = (auditId: string, id: string) =>
  apiFetch<{ url: string; fileName: string }>(`/audits/${auditId}/evidence/${id}/download`);


// ============================================================================
// Phase 3 — Nonconformity / CAPA / Risk
// ============================================================================

export type NcCategoryValue = 'MAJOR' | 'MINOR' | 'OBSERVATION';
export type NcStatusValue = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED';

export interface Nonconformity {
  id: string;
  ncCode: string;
  category: NcCategoryValue;
  finding: string;
  clause?: string | null;
  evidenceSummary?: string | null;
  impact?: string | null;
  recommendation?: string | null;
  status: NcStatusValue;
  dueDate?: string | null;
  control?: { clause: string; title: string } | null;
  correctiveActions?: CorrectiveAction[];
  _count?: { correctiveActions: number };
}

export type CapaStatusValue = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'VERIFIED';

export interface CorrectiveAction {
  id: string;
  capaCode?: string | null;
  action: string;
  rootCause?: string | null;
  ownerLabel?: string | null;
  status: CapaStatusValue;
  dueDate?: string | null;
  verificationNote?: string | null;
  owner?: { firstName: string; lastName: string } | null;
}

export type RiskFactorValue = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type RiskLevelValueT = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatusValue =
  | 'IDENTIFIED'
  | 'ASSESSED'
  | 'TREATMENT_PLANNED'
  | 'IN_TREATMENT'
  | 'MITIGATED'
  | 'ACCEPTED'
  | 'CLOSED';

export interface Risk {
  id: string;
  riskCode?: string | null;
  title: string;
  description?: string | null;
  asset?: string | null;
  threat?: string | null;
  likelihood: RiskFactorValue;
  impact: RiskFactorValue;
  riskScore: number;
  riskLevel: RiskLevelValueT;
  treatment?: string | null;
  treatmentPlan?: string | null;
  status: RiskStatusValue;
  owner?: { firstName: string; lastName: string } | null;
}

// Nonconformity
export const getNonconformities = (auditId: string) =>
  apiFetch<Nonconformity[]>(`/audits/${auditId}/nonconformities`);
export const getNonconformity = (id: string) =>
  apiFetch<Nonconformity>(`/nonconformities/${id}`);
export const createNonconformity = (
  auditId: string,
  data: { category: NcCategoryValue; finding: string; clause?: string; impact?: string; recommendation?: string },
) => apiFetch<Nonconformity>(`/audits/${auditId}/nonconformities`, { method: 'POST', body: JSON.stringify(data) });
export const updateNonconformity = (id: string, data: Record<string, unknown>) =>
  apiFetch<Nonconformity>(`/nonconformities/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteNonconformity = (id: string) =>
  apiFetch<{ success: boolean }>(`/nonconformities/${id}`, { method: 'DELETE' });

// CAPA
export const getCapa = (ncId: string) =>
  apiFetch<CorrectiveAction[]>(`/nonconformities/${ncId}/capa`);
export const createCapa = (
  ncId: string,
  data: { action: string; rootCause?: string; ownerLabel?: string; dueDate?: string },
) => apiFetch<CorrectiveAction>(`/nonconformities/${ncId}/capa`, { method: 'POST', body: JSON.stringify(data) });
export const updateCapa = (id: string, data: Record<string, unknown>) =>
  apiFetch<CorrectiveAction>(`/capa/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const verifyCapa = (id: string, data: { verificationNote?: string }) =>
  apiFetch<CorrectiveAction>(`/capa/${id}/verify`, { method: 'POST', body: JSON.stringify(data) });
export const deleteCapa = (id: string) =>
  apiFetch<{ success: boolean }>(`/capa/${id}`, { method: 'DELETE' });

// Risk
export const getRisks = (auditId: string) => apiFetch<Risk[]>(`/audits/${auditId}/risks`);
export const createRisk = (
  auditId: string,
  data: {
    title: string;
    likelihood: RiskFactorValue;
    impact: RiskFactorValue;
    description?: string;
    asset?: string;
    threat?: string;
  },
) => apiFetch<Risk>(`/audits/${auditId}/risks`, { method: 'POST', body: JSON.stringify(data) });
export const updateRisk = (id: string, data: Record<string, unknown>) =>
  apiFetch<Risk>(`/risks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteRisk = (id: string) =>
  apiFetch<{ success: boolean }>(`/risks/${id}`, { method: 'DELETE' });


// ============================================================================
// Phase 4 — AI Assistant / Reports / Dashboard
// ============================================================================

export interface AiAnalysis {
  id: string;
  generatedFinding?: string | null;
  generatedEvidence?: string | null;
  generatedRequirement?: string | null;
  generatedConclusion?: string | null;
  suggestedCategory?: NcCategoryValue | null;
  modelProvider?: string | null;
  modelName?: string | null;
  createdAt: string;
  control?: { clause: string; title: string } | null;
}

export const generateFinding = (
  auditId: string,
  data: { controlId: string; answer?: string; evidence?: string; result?: ChecklistResultValue },
) => apiFetch<AiAnalysis>(`/audits/${auditId}/ai/generate-finding`, { method: 'POST', body: JSON.stringify(data) });

export const getAiAnalyses = (auditId: string) =>
  apiFetch<AiAnalysis[]>(`/audits/${auditId}/ai`);

export type CountMap = Record<string, number>;

export interface AuditAnalytics {
  audit: { auditCode: string; organization?: string; standard?: string; status: string; leadAuditor?: string | null };
  checklist: {
    totalControls: number;
    answered: number;
    unanswered: number;
    counts: Record<ChecklistResultValue, number>;
    compliancePercent: number;
  };
  nonconformities: { total: number; byCategory: CountMap; byStatus: CountMap };
  capa: { total: number; byStatus: CountMap };
  risks: { total: number; byLevel: CountMap };
}

export interface ReportListItem {
  id: string;
  type: string;
  format: string;
  title?: string | null;
  status: string;
  generatedAt?: string | null;
}

export interface Report {
  id: string;
  type: string;
  title?: string | null;
  contentJson: {
    generatedAt: string;
    type: string;
    executiveSummary: AuditAnalytics;
    detailedFindings: {
      ncCode: string;
      category: string;
      clause?: string | null;
      finding: string;
      evidence?: string | null;
      impact?: string | null;
      recommendation?: string | null;
      status: string;
      correctiveActions: { action: string; status: string; ownerLabel?: string | null }[];
    }[];
  };
}

export interface DashboardData {
  totalAudits: number;
  auditsByStatus: CountMap;
  nonconformities: { total: number; byCategory: CountMap };
  capa: { byStatus: CountMap };
  risks: { total: number; byLevel: CountMap };
}

export const getAuditAnalytics = (auditId: string) =>
  apiFetch<AuditAnalytics>(`/audits/${auditId}/analytics`);
export const listReports = (auditId: string) =>
  apiFetch<ReportListItem[]>(`/audits/${auditId}/reports`);
export const generateReport = (auditId: string, type: string, format = 'PDF') =>
  apiFetch<ReportListItem>(`/audits/${auditId}/reports`, {
    method: 'POST',
    body: JSON.stringify({ type, format }),
  });
export const getReport = (id: string) => apiFetch<Report>(`/reports/${id}`);

export const getDashboard = () => apiFetch<DashboardData>('/dashboard');
