'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeRiskLevel, getRiskBand, RISK_BANDS } from '@audit/shared';
import { apiFetch, clearToken, getToken } from '@/lib/api';

interface Me {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const STATS = [
  { label: 'Нийт хяналт', value: '114', hint: 'ISO 27001:2022' },
  { label: 'Нийцсэн', value: '—', hint: 'Conformity' },
  { label: 'Major NC', value: '—', hint: 'Ноцтой үл тохирол' },
  { label: 'Minor NC', value: '—', hint: 'Бага зэрэг' },
];

function RiskMatrix() {
  // likelihood 5→1 (мөр), impact 1→5 (багана)
  const levels = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];
  return (
    <div className="overflow-x-auto">
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
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    apiFetch<Me>('/auth/me')
      .then(setMe)
      .catch((err: Error) => {
        setError(err.message);
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {me ? `${me.firstName} ${me.lastName} · ${me.role}` : 'Ачааллаж байна...'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Гарах
        </button>
      </header>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          <p className="mb-4 mt-1 text-sm text-slate-500">
            riskScore = likelihood × impact
          </p>
          <RiskMatrix />
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
          <h2 className="font-semibold text-slate-900">Дараагийн алхам</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Phase 2 — Audit Management + Checklist Engine</li>
            <li>• Evidence (MinIO/S3) хавсралт</li>
            <li>• Phase 3 — Nonconformity + CAPA + Risk</li>
            <li>• Phase 4 — AI Assistant + Reports</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
