'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getEvidence,
  getEvidenceDownloadUrl,
  uploadEvidence,
  type Evidence,
} from '@/lib/api';

function formatSize(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceTab({ auditId }: { auditId: string }) {
  const [items, setItems] = useState<Evidence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      setItems(await getEvidence(auditId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Файл сонгоно уу.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (description) fd.append('description', description);
      await uploadEvidence(auditId, fd);
      if (fileRef.current) fileRef.current.value = '';
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(id: string) {
    try {
      const { url } = await getEvidenceDownloadUrl(auditId, id);
      window.open(url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
  }

  return (
    <div>
      <form
        onSubmit={handleUpload}
        className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600">Файл (PDF/DOCX/XLSX/JPG/PNG)</label>
          <input ref={fileRef} type="file" className="mt-1 text-sm" accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600">Тайлбар</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {uploading ? 'Хуулж байна...' : 'Хавсаргах'}
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Нотлох баримт алга.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Файл</th>
                <th className="px-4 py-3">Төрөл</th>
                <th className="px-4 py-3">Хэмжээ</th>
                <th className="px-4 py-3">Оруулсан</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{e.fileName}</td>
                  <td className="px-4 py-3 text-slate-500">{e.fileType}</td>
                  <td className="px-4 py-3 text-slate-500">{formatSize(e.fileSize)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {e.uploadedBy ? `${e.uploadedBy.firstName} ${e.uploadedBy.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownload(e.id)}
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Татах
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
