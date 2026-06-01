'use client';

import { useEffect, useState } from 'react';
import {
  createCapa,
  createNonconformity,
  getCapa,
  getNonconformities,
  updateCapa,
  updateNonconformity,
  verifyCapa,
  type CorrectiveAction,
  type NcCategoryValue,
  type Nonconformity,
} from '@/lib/api';

const CATEGORY_BADGE: Record<NcCategoryValue, string> = {
  MAJOR: 'bg-red-100 text-red-800',
  MINOR: 'bg-amber-100 text-amber-800',
  OBSERVATION: 'bg-blue-100 text-blue-800',
};

const NC_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED'];
const CAPA_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'VERIFIED'];

export function NonconformityTab({ auditId }: { auditId: string }) {
  const [ncs, setNcs] = useState<Nonconformity[]>([]);
  const [selected, setSelected] = useState<Nonconformity | null>(null);
  const [capas, setCapas] = useState<CorrectiveAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // NC form
  const [category, setCategory] = useState<NcCategoryValue>('MINOR');
  const [finding, setFinding] = useState('');
  const [clause, setClause] = useState('');

  // CAPA form
  const [capaAction, setCapaAction] = useState('');
  const [capaOwner, setCapaOwner] = useState('');

  async function loadNcs() {
    try {
      setNcs(await getNonconformities(auditId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  useEffect(() => {
    loadNcs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  async function selectNc(nc: Nonconformity) {
    setSelected(nc);
    setCapas(await getCapa(nc.id));
  }

  async function handleCreateNc(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createNonconformity(auditId, { category, finding, clause: clause || undefined });
      setFinding('');
      setClause('');
      setShowForm(false);
      await loadNcs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  async function changeNcStatus(id: string, status: string) {
    await updateNonconformity(id, { status });
    await loadNcs();
    if (selected?.id === id) setSelected({ ...selected, status: status as Nonconformity['status'] });
  }

  async function handleAddCapa(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    await createCapa(selected.id, { action: capaAction, ownerLabel: capaOwner || undefined });
    setCapaAction('');
    setCapaOwner('');
    setCapas(await getCapa(selected.id));
  }

  async function changeCapaStatus(id: string, status: string) {
    await updateCapa(id, { status });
    if (selected) setCapas(await getCapa(selected.id));
  }

  async function handleVerify(id: string) {
    await verifyCapa(id, {});
    if (selected) setCapas(await getCapa(selected.id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Үл тохирол (NC)</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {showForm ? 'Болих' : '+ NC нэмэх'}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreateNc} className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NcCategoryValue)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="MAJOR">Major</option>
            <option value="MINOR">Minor</option>
            <option value="OBSERVATION">Observation</option>
          </select>
          <input
            value={clause}
            onChange={(e) => setClause(e.target.value)}
            placeholder="Clause (6.1.2)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={finding}
            onChange={(e) => setFinding(e.target.value)}
            placeholder="Finding (тогтоосон зөрчил)"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white sm:col-span-4">
            NC бүртгэх
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* NC list */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {ncs.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Үл тохирол алга.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ncs.map((nc) => (
                <li
                  key={nc.id}
                  onClick={() => selectNc(nc)}
                  className={`cursor-pointer px-4 py-3 hover:bg-slate-50 ${
                    selected?.id === nc.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">{nc.ncCode}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[nc.category]}`}>
                      {nc.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{nc.finding}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {nc.clause ? `Clause ${nc.clause} · ` : ''}
                    {nc.status} · CAPA: {nc._count?.correctiveActions ?? 0}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected NC + CAPA */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          {!selected ? (
            <p className="text-sm text-slate-500">NC сонгоно уу.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{selected.ncCode}</h3>
                <select
                  value={selected.status}
                  onChange={(e) => changeNcStatus(selected.id, e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                >
                  {NC_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-slate-700">{selected.finding}</p>

              <h4 className="mt-4 text-sm font-semibold text-slate-800">Залруулах арга хэмжээ (CAPA)</h4>
              <ul className="mt-2 space-y-2">
                {capas.map((c) => (
                  <li key={c.id} className="rounded-md border border-slate-100 p-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-700">{c.action}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <select
                          value={c.status}
                          onChange={(e) => changeCapaStatus(c.id, e.target.value)}
                          className="rounded border border-slate-300 px-1.5 py-0.5 text-xs"
                        >
                          {CAPA_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {c.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerify(c.id)}
                            className="rounded bg-green-600 px-2 py-0.5 text-xs text-white hover:bg-green-700"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </div>
                    {c.ownerLabel && <p className="mt-0.5 text-xs text-slate-400">Эзэмшигч: {c.ownerLabel}</p>}
                  </li>
                ))}
                {capas.length === 0 && <li className="text-xs text-slate-400">CAPA алга.</li>}
              </ul>

              <form onSubmit={handleAddCapa} className="mt-3 space-y-2">
                <input
                  value={capaAction}
                  onChange={(e) => setCapaAction(e.target.value)}
                  placeholder="Арга хэмжээ"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    value={capaOwner}
                    onChange={(e) => setCapaOwner(e.target.value)}
                    placeholder="Эзэмшигч (IT Manager)"
                    className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  />
                  <button type="submit" className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white">
                    Нэмэх
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
