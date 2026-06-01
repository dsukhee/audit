'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRiskBand, RISK_BANDS, type RiskLevelValue } from '@audit/shared';
import { AppShell } from '@/components/app-shell';
import { getDashboard, type DashboardData } from '@/lib/api';

const RISK_ORDER: RiskLevelValue[] = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const stats = [
    { label: 'Нийт аудит', value: data?.totalAudits ?? '—' },
    { label: 'Нийт NC', value: data?.nonconformities.total ?? '—' },
    { label: 'Major NC', value: data?.nonconformities.byCategory.MAJOR ?? 0 },
    { label: 'Нийт эрсдэл', value: data?.risks.total ?? '—' },
  ];

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

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Эрсдэлийн тархалт</h2>
          <div className="mt-4 space-y-2">
            {RISK_ORDER.map((level) => {
              const band = getRiskBand(level);
              const count = data?.risks.byLevel[level] ?? 0;
              const total = data?.risks.total || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-slate-600">{band.label}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: band.color }} />
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-slate-700">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit status + CAPA */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Аудитын төлөв</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(data?.auditsByStatus ?? {}).map(([status, count]) => (
              <span key={status} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {status}: <strong>{count}</strong>
              </span>
            ))}
            {!data?.totalAudits && <span className="text-sm text-slate-400">Аудит алга.</span>}
          </div>

          <h2 className="mt-5 font-semibold text-slate-900">CAPA төлөв</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(data?.capa.byStatus ?? {}).map(([status, count]) => (
              <span key={status} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                {status}: <strong>{count}</strong>
              </span>
            ))}
            {Object.keys(data?.capa.byStatus ?? {}).length === 0 && (
              <span className="text-sm text-slate-400">CAPA алга.</span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            {RISK_BANDS.map((b) => (
              <span key={b.level} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: b.color }} />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
