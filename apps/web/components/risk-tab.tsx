'use client';

import { useEffect, useState } from 'react';
import { assessRisk, getRiskBand, type RiskFactorLevel } from '@audit/shared';
import { createRisk, getRisks, updateRisk, type Risk, type RiskFactorValue } from '@/lib/api';

const FACTORS: { value: RiskFactorValue; label: string }[] = [
  { value: 'VERY_LOW', label: '1 · Маш бага' },
  { value: 'LOW', label: '2 · Бага' },
  { value: 'MEDIUM', label: '3 · Дунд' },
  { value: 'HIGH', label: '4 · Өндөр' },
  { value: 'VERY_HIGH', label: '5 · Маш өндөр' },
];

const RISK_STATUSES = [
  'IDENTIFIED',
  'ASSESSED',
  'TREATMENT_PLANNED',
  'IN_TREATMENT',
  'MITIGATED',
  'ACCEPTED',
  'CLOSED',
];

export function RiskTab({ auditId }: { auditId: string }) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [asset, setAsset] = useState('');
  const [likelihood, setLikelihood] = useState<RiskFactorValue>('MEDIUM');
  const [impact, setImpact] = useState<RiskFactorValue>('MEDIUM');

  const preview = assessRisk(likelihood as RiskFactorLevel, impact as RiskFactorLevel);
  const previewBand = getRiskBand(preview.riskLevel);

  async function load() {
    try {
      setRisks(await getRisks(auditId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createRisk(auditId, { title, asset: asset || undefined, likelihood, impact });
      setTitle('');
      setAsset('');
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  async function changeStatus(id: string, status: string) {
    await updateRisk(id, { status });
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Эрсдэлийн бүртгэл (ISO 27005 · 5×5)</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {showForm ? 'Болих' : '+ Эрсдэл нэмэх'}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Эрсдэлийн нэр"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="Хөрөнгө (asset)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <div>
              <label className="block text-xs text-slate-500">Магадлал (Likelihood)</label>
              <select
                value={likelihood}
                onChange={(e) => setLikelihood(e.target.value as RiskFactorValue)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {FACTORS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Нөлөөлөл (Impact)</label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as RiskFactorValue)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {FACTORS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-slate-500">Тооцоолсон түвшин:</span>
            <span
              className="rounded-full px-3 py-1 text-sm font-semibold text-white"
              style={{ backgroundColor: previewBand.color }}
            >
              {previewBand.label} · {preview.riskScore}
            </span>
            <button type="submit" className="ml-auto rounded-md bg-brand px-4 py-2 text-sm font-medium text-white">
              Эрсдэл бүртгэх
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {risks.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Эрсдэл бүртгэгдээгүй.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Код</th>
                <th className="px-4 py-3">Эрсдэл</th>
                <th className="px-4 py-3">L×I</th>
                <th className="px-4 py-3">Түвшин</th>
                <th className="px-4 py-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => {
                const band = getRiskBand(r.riskLevel);
                return (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs">{r.riskCode}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{r.title}</p>
                      {r.asset && <p className="text-xs text-slate-400">{r.asset}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.riskScore}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: band.color }}
                      >
                        {band.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => changeStatus(r.id, e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        {RISK_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
