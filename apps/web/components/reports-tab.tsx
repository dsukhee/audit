'use client';

import { useEffect, useState } from 'react';
import {
  generateReport,
  getReport,
  listReports,
  type Report,
  type ReportListItem,
} from '@/lib/api';

const REPORT_TYPES = [
  { value: 'EXECUTIVE_SUMMARY', label: 'Executive Summary' },
  { value: 'DETAILED_FINDINGS', label: 'Detailed Findings' },
  { value: 'FULL_AUDIT_REPORT', label: 'Full Audit Report' },
  { value: 'MANAGEMENT_REPORT', label: 'Management Report' },
];

export function ReportsTab({ auditId }: { auditId: string }) {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [type, setType] = useState('FULL_AUDIT_REPORT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setReports(await listReports(auditId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const r = await generateReport(auditId, type);
      await load();
      setSelected(await getReport(r.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  async function view(id: string) {
    setSelected(await getReport(id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {REPORT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? 'Үүсгэж байна...' : 'Тайлан үүсгэх'}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Үүсгэсэн тайлангууд</h3>
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.id}
                onClick={() => view(r.id)}
                className="cursor-pointer rounded-md border border-slate-100 bg-white p-3 text-sm hover:bg-slate-50"
              >
                <p className="font-medium text-slate-800">{r.type}</p>
                <p className="text-xs text-slate-400">
                  {r.generatedAt ? new Date(r.generatedAt).toLocaleString('mn-MN') : ''}
                </p>
              </li>
            ))}
            {reports.length === 0 && <li className="text-xs text-slate-400">Тайлан алга.</li>}
          </ul>
        </div>

        <div className="lg:col-span-2">
          {selected ? <ReportView report={selected} /> : (
            <p className="text-sm text-slate-500">Тайлан сонгох эсвэл шинээр үүсгэнэ үү.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportView({ report }: { report: Report }) {
  const { executiveSummary: s, detailedFindings: findings } = report.contentJson;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
      <p className="text-xs text-slate-400">
        {new Date(report.contentJson.generatedAt).toLocaleString('mn-MN')}
      </p>

      <h3 className="mt-5 font-semibold text-slate-800">Executive Summary</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Compliance" value={`${s.checklist.compliancePercent}%`} />
        <Stat label="Хяналт шалгасан" value={`${s.checklist.answered}/${s.checklist.totalControls}`} />
        <Stat label="Нийцсэн" value={s.checklist.counts.CONFORMITY} />
        <Stat label="Major NC" value={s.checklist.counts.MAJOR_NC} />
        <Stat label="Minor NC" value={s.checklist.counts.MINOR_NC} />
        <Stat label="Observation" value={s.checklist.counts.OBSERVATION} />
        <Stat label="Нийт NC" value={s.nonconformities.total} />
        <Stat label="Нийт эрсдэл" value={s.risks.total} />
      </div>

      {findings.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold text-slate-800">Detailed Findings</h3>
          <div className="mt-2 space-y-3">
            {findings.map((f) => (
              <div key={f.ncCode} className="rounded-md border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">{f.ncCode}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{f.category}</span>
                </div>
                {f.clause && <p className="text-xs text-slate-400">Clause: {f.clause}</p>}
                <p className="mt-1 text-sm text-slate-700"><strong>Finding:</strong> {f.finding}</p>
                {f.impact && <p className="text-sm text-slate-600"><strong>Impact:</strong> {f.impact}</p>}
                {f.recommendation && (
                  <p className="text-sm text-slate-600"><strong>Recommendation:</strong> {f.recommendation}</p>
                )}
                {f.correctiveActions.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    CAPA: {f.correctiveActions.map((c) => `${c.action} (${c.status})`).join('; ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
