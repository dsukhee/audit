'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAudit, updateAudit, type Audit } from '@/lib/api';
import { AppShell } from '@/components/app-shell';
import { AiTab } from '@/components/ai-tab';
import { ChecklistTab } from '@/components/checklist-tab';
import { EvidenceTab } from '@/components/evidence-tab';
import { NonconformityTab } from '@/components/nonconformity-tab';
import { ReportsTab } from '@/components/reports-tab';
import { RiskTab } from '@/components/risk-tab';

const STATUSES = [
  'DRAFT',
  'PLANNED',
  'IN_PROGRESS',
  'FIELDWORK_COMPLETE',
  'REPORTING',
  'COMPLETED',
  'CLOSED',
  'CANCELLED',
];

type Tab = 'info' | 'checklist' | 'evidence' | 'nc' | 'risk' | 'ai' | 'reports';

export default function AuditDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [tab, setTab] = useState<Tab>('info');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setAudit(await getAudit(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function changeStatus(status: string) {
    try {
      const updated = await updateAudit(id, { status });
      setAudit(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Мэдээлэл' },
    { key: 'checklist', label: 'Чеклист' },
    { key: 'evidence', label: 'Нотлох баримт' },
    { key: 'nc', label: 'Үл тохирол' },
    { key: 'risk', label: 'Эрсдэл' },
    { key: 'ai', label: 'AI туслах' },
    { key: 'reports', label: 'Тайлан' },
  ];

  return (
    <AppShell>
      <Link href="/audits" className="text-sm text-slate-500 hover:underline">
        ← Аудитууд
      </Link>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {!audit ? (
        <p className="mt-4 text-sm text-slate-500">Ачааллаж байна...</p>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{audit.auditCode}</h1>
              <p className="text-sm text-slate-500">
                {audit.title || audit.organization?.name} · {audit.standard?.code}
              </p>
            </div>
            <select
              value={audit.status}
              onChange={(e) => changeStatus(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex gap-1 border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  tab === t.key
                    ? 'border-brand text-brand'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === 'info' && <InfoTab audit={audit} />}
            {tab === 'checklist' && <ChecklistTab auditId={id} />}
            {tab === 'evidence' && <EvidenceTab auditId={id} />}
            {tab === 'nc' && <NonconformityTab auditId={id} />}
            {tab === 'risk' && <RiskTab auditId={id} />}
            {tab === 'ai' && <AiTab auditId={id} />}
            {tab === 'reports' && <ReportsTab auditId={id} />}
          </div>
        </>
      )}
    </AppShell>
  );
}

function InfoTab({ audit }: { audit: Audit }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Үндсэн мэдээлэл</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Байгууллага" value={audit.organization?.name} />
          <Row label="Стандарт" value={audit.standard?.code} />
          <Row
            label="Тэргүүлэх аудитор"
            value={audit.leadAuditor ? `${audit.leadAuditor.firstName} ${audit.leadAuditor.lastName}` : '—'}
          />
          <Row label="Хамрах хүрээ" value={audit.scope || '—'} />
          <Row label="Зорилго" value={audit.objectives || '—'} />
        </dl>
        <div className="mt-4 flex gap-4 text-xs text-slate-500">
          <span>Хяналт бөглөсөн: {audit._count?.checklistResponses ?? 0}</span>
          <span>NC: {audit._count?.nonconformities ?? 0}</span>
          <span>Баримт: {audit._count?.evidence ?? 0}</span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Аудитын баг</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(audit.teamMembers ?? []).map((m) => (
            <li key={m.id} className="flex items-center justify-between">
              <span className="text-slate-700">
                {m.user.firstName} {m.user.lastName}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {m.teamRole}
              </span>
            </li>
          ))}
          {(audit.teamMembers ?? []).length === 0 && (
            <li className="text-slate-400">Багийн гишүүн алга.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3">
      <dt className="w-32 shrink-0 text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
