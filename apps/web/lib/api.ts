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
  apiFetch<ChecklistResponse>(`/audits/${auditId}/checklist/${controlId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getEvidence = (auditId: string) =>
  apiFetch<Evidence[]>(`/audits/${auditId}/evidence`);
export const uploadEvidence = (auditId: string, formData: FormData) =>
  apiUpload<Evidence>(`/audits/${auditId}/evidence`, formData);
export const getEvidenceDownloadUrl = (auditId: string, id: string) =>
  apiFetch<{ url: string; fileName: string }>(`/audits/${auditId}/evidence/${id}/download`);
