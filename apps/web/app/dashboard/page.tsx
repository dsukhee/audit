'use client';

import Link from 'next/link';
import { computeRiskLevel, getRiskBand, RISK_BANDS } from '@audit/shared';
import { AppShell } from '@/components/app-shell';

const STATS = [
  { label: 'Нийт хяналт', value: '93+', hint: 'ISO 27001:2022 Annex A' },
  { label: 'Идэвхтэй аудит', value: '—', hint: 'In progress' },
  { label: 'Major NC', value: '—', hint: 'Ноцтой үл тохирол' },
  { label: 'Compliance', value: '—', hint: 'Дундаж оноо' },
];

function RiskMatrix() {
  const levels = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];
  return (
    <table className="border-collapse text-center text-xs">
      <tbody>
        {levels.map((l) => (
          <tr key={l}>
            <td className="px-2 py-1 font-medium text-slate-500">L{l}</td>
            {impacts.map((i) => {
              const score = l * i;
              const band = getRiskBand(computeRiskLevel(score));
              return (
                <td
                  key={i}
                  className="h-9 w-9 font-semibold text-white"
                  style={{ backgroundColor: band.color }}
                  title={`${band.label} (${score})`}
                >
                  {score}
                </td>
              );
            })}
          </tr>
        ))}
        <tr>
          <td />
          {impacts.map((i) => (
            <td key={i} className="px-2 py-1 font-medium text-slate-500">
              I{i}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Link
          href="/audits"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Аудитууд →
        </Link>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Risk Heatmap (ISO 27005 · 5×5)</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">riskScore = likelihood × impact</p>
          <div className="overflow-x-auto">
            <RiskMatrix />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {RISK_BANDS.map((b) => (
              <span key={b.level} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: b.color }}
                />
                {b.label} ({b.min}-{b.max})
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Phase 2 — идэвхтэй модулиуд</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>✅ Audit Management — аудит үүсгэх, баг, scope</li>
            <li>✅ ISO 27001 Checklist Engine — хяналт бөглөх</li>
            <li>✅ Evidence Management — файл хавсаргах</li>
            <li>⏭ Phase 3 — Nonconformity + CAPA + Risk</li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
