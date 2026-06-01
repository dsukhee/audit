'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  createAudit,
  createOrganization,
  getAudits,
  getOrganizations,
  getStandards,
  type Audit,
  type Organization,
  type Standard,
} from '@/lib/api';
import { AppShell } from '@/components/app-shell';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-200 text-slate-600',
};

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [title, setTitle] = useState('');
  const [orgId, setOrgId] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [standardId, setStandardId] = useState('');
  const [scope, setScope] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [a, o, s] = await Promise.all([getAudits(), getOrganizations(), getStandards()]);
      setAudits(a);
      setOrgs(o);
      setStandards(s);
      if (s.length && !standardId) setStandardId(s[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let organizationId = orgId;
      if (!organizationId && newOrgName.trim()) {
        const org = await createOrganization({ name: newOrgName.trim() });
        organizationId = org.id;
      }
      if (!organizationId) {
        throw new Error('Байгууллага сонгох эсвэл шинээр оруулна уу.');
      }
      await createAudit({ organizationId, standardId, title: title || undefined, scope: scope || undefined });
      setShowForm(false);
      setTitle('');
      setScope('');
      setNewOrgName('');
      setOrgId('');
      setLoading(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Аудитууд</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {showForm ? 'Болих' : '+ Шинэ аудит'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Гарчиг</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Жишээ: 2026 оны гэрчилгээжүүлэлтийн аудит"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Стандарт</label>
              <select
                value={standardId}
                onChange={(e) => setStandardId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {standards.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Байгууллага</label>
              <select
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— Шинээр оруулах —</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            {!orgId && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Шинэ байгууллагын нэр</label>
                <input
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="XYZ LLC"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Хамрах хүрээ (Scope)</label>
              <textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? 'Хадгалж байна...' : 'Аудит үүсгэх'}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Ачааллаж байна...</p>
        ) : audits.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Аудит алга. Шинээр үүсгэнэ үү.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Код</th>
                <th className="px-4 py-3">Байгууллага</th>
                <th className="px-4 py-3">Стандарт</th>
                <th className="px-4 py-3">Аудитор</th>
                <th className="px-4 py-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/audits/${a.id}`} className="text-brand hover:underline">
                      {a.auditCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.organization?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.standard?.code ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.leadAuditor ? `${a.leadAuditor.firstName} ${a.leadAuditor.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
