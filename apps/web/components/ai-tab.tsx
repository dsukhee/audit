'use client';

import { useEffect, useState } from 'react';
import {
  generateFinding,
  getAiAnalyses,
  getChecklist,
  type AiAnalysis,
  type ChecklistItem,
  type ChecklistResultValue,
} from '@/lib/api';

const RESULTS: { value: ChecklistResultValue; label: string }[] = [
  { value: 'CONFORMITY', label: 'Нийцсэн' },
  { value: 'MINOR_NC', label: 'Minor NC' },
  { value: 'MAJOR_NC', label: 'Major NC' },
  { value: 'OBSERVATION', label: 'Ажиглалт' },
  { value: 'NOT_APPLICABLE', label: 'N/A' },
];

export function AiTab({ auditId }: { auditId: string }) {
  const [controls, setControls] = useState<ChecklistItem[]>([]);
  const [analyses, setAnalyses] = useState<AiAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<AiAnalysis | null>(null);

  const [controlId, setControlId] = useState('');
  const [answer, setAnswer] = useState('');
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState<ChecklistResultValue | ''>('');

  async function load() {
    try {
      const [cl, an] = await Promise.all([getChecklist(auditId), getAiAnalyses(auditId)]);
      const answerable = cl.items.filter((i) => i.answerable);
      setControls(answerable);
      if (answerable.length && !controlId) setControlId(answerable[0].control.id);
      setAnalyses(an);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await generateFinding(auditId, {
        controlId,
        answer: answer || undefined,
        evidence: evidence || undefined,
        result: result || undefined,
      });
      setLatest(res);
      setAnalyses(await getAiAnalyses(auditId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-semibold text-slate-900">AI Audit Assistant</h2>
        <p className="mt-1 text-sm text-slate-500">
          Асуулт, хариулт, нотлох баримтыг оруулбал AI нь Finding / Evidence / Requirement /
          Conclusion-ийг үүсгэнэ.
        </p>

        <form onSubmit={handleGenerate} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Хяналт</label>
            <select
              value={controlId}
              onChange={(e) => setControlId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {controls.map((c) => (
                <option key={c.control.id} value={c.control.id}>
                  {c.control.clause} — {c.control.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Хариулт / ажиглалт</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Нотлох баримт</label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Үр дүн (сонголтоор)</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as ChecklistResultValue | '')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">— Авто тааварлуулах —</option>
              {RESULTS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !controlId}
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? 'Үүсгэж байна...' : '✨ Finding үүсгэх'}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        {latest && (
          <div className="rounded-lg border border-brand bg-blue-50/50 p-4">
            <h3 className="text-sm font-semibold text-brand">Үүсгэсэн дүгнэлт</h3>
            <Field label="Finding" value={latest.generatedFinding} />
            <Field label="Evidence" value={latest.generatedEvidence} />
            <Field label="Requirement" value={latest.generatedRequirement} />
            <Field label="Conclusion" value={latest.generatedConclusion} />
            <p className="mt-2 text-xs text-slate-400">
              Provider: {latest.modelProvider} · {latest.modelName}
            </p>
          </div>
        )}

        <h3 className="mt-4 text-sm font-semibold text-slate-800">Өмнөх шинжилгээ ({analyses.length})</h3>
        <ul className="mt-2 space-y-2">
          {analyses.map((a) => (
            <li key={a.id} className="rounded-md border border-slate-100 bg-white p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">{a.control?.clause}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{a.generatedConclusion}</span>
              </div>
              <p className="mt-1 text-slate-700">{a.generatedFinding}</p>
            </li>
          ))}
          {analyses.length === 0 && <li className="text-xs text-slate-400">Шинжилгээ алга.</li>}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm text-slate-800">{value || '—'}</p>
    </div>
  );
}
