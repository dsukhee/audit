'use client';

import { useEffect, useState } from 'react';
import {
  getChecklist,
  upsertChecklistResponse,
  type Checklist,
  type ChecklistResultValue,
} from '@/lib/api';

const RESULT_OPTIONS: { value: ChecklistResultValue; label: string; color: string }[] = [
  { value: 'CONFORMITY', label: 'Нийцсэн', color: 'bg-green-100 text-green-800' },
  { value: 'MINOR_NC', label: 'Minor NC', color: 'bg-amber-100 text-amber-800' },
  { value: 'MAJOR_NC', label: 'Major NC', color: 'bg-red-100 text-red-800' },
  { value: 'OBSERVATION', label: 'Ажиглалт', color: 'bg-blue-100 text-blue-800' },
  { value: 'NOT_APPLICABLE', label: 'N/A', color: 'bg-slate-100 text-slate-600' },
];

export function ChecklistTab({ auditId }: { auditId: string }) {
  const [data, setData] = useState<Checklist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    try {
      setData(await getChecklist(auditId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  async function setResult(controlId: string, result: ChecklistResultValue | '') {
    setSavingId(controlId);
    try {
      await upsertChecklistResponse(auditId, controlId, {
        result: result || undefined,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setSavingId(null);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Ачааллаж байна...</p>;

  const { summary } = data;

  return (
    <div>
      {/* Тойм */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <SummaryCard label="Compliance" value={`${summary.compliancePercent}%`} highlight />
        <SummaryCard label="Хяналт" value={String(summary.totalControls)} />
        <SummaryCard label="Нийцсэн" value={String(summary.counts.CONFORMITY)} />
        <SummaryCard label="Major NC" value={String(summary.counts.MAJOR_NC)} />
        <SummaryCard label="Minor NC" value={String(summary.counts.MINOR_NC)} />
        <SummaryCard label="Ажиглалт" value={String(summary.counts.OBSERVATION)} />
        <SummaryCard label="Бөглөөгүй" value={String(summary.unanswered)} />
      </div>

      <div className="space-y-1">
        {data.items.map((item) =>
          item.answerable ? (
            <div
              key={item.control.id}
              className="flex items-center gap-4 rounded-md border border-slate-100 bg-white px-4 py-2.5"
            >
              <div className="w-20 shrink-0 font-mono text-xs text-slate-500">
                {item.control.clause}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800">{item.control.title}</p>
                {item.control.question && (
                  <p className="text-xs text-slate-400">{item.control.question}</p>
                )}
              </div>
              <select
                value={item.response?.result ?? ''}
                onChange={(e) => setResult(item.control.id, e.target.value as ChecklistResultValue | '')}
                disabled={savingId === item.control.id}
                className="w-36 shrink-0 rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              >
                <option value="">— Үнэлээгүй —</option>
                {RESULT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div key={item.control.id} className="px-2 pb-1 pt-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {item.control.clause} — {item.control.title}
              </h3>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-brand bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${highlight ? 'text-brand' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
