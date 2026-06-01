import Link from 'next/link';

const MODULES = [
  { title: 'Audit Management', desc: 'Аудит төлөвлөх, баг, хамрах хүрээ' },
  { title: 'ISO 27001 Checklist', desc: 'Бүх хяналтыг асуулга хэлбэрээр бөглөх' },
  { title: 'Evidence Management', desc: 'Нотлох баримт хавсаргах (PDF, DOCX, XLSX)' },
  { title: 'Nonconformity', desc: 'Үл тохирол бүртгэх (Major / Minor)' },
  { title: 'Corrective Action', desc: 'Залруулах арга хэмжээ (CAPA) хянах' },
  { title: 'Risk Assessment', desc: 'ISO 27005 — 5×5 эрсдэлийн матриц' },
  { title: 'AI Audit Assistant', desc: 'Finding автоматаар үүсгэх' },
  { title: 'Reports & Dashboard', desc: 'Авто тайлан, compliance оноо' },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between">
        <span className="rounded bg-brand px-2.5 py-1 text-sm font-semibold text-white">
          ISO Audit
        </span>
        <Link
          href="/login"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Нэвтрэх
        </Link>
      </div>

      <section className="mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          ISO 27001 аудитын платформ
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Мэдээллийн аюулгүй байдлын аудитыг төлөвлөхөөс эхлээд тайлан гаргах хүртэл нэг системд
          удирдана. Чеклист, нотлох баримт, үл тохирол, эрсдэл, AI туслах — бүгд нэг дор.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-md bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark"
        >
          Эхлэх →
        </Link>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m) => (
          <div
            key={m.title}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="font-semibold text-slate-900">{m.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{m.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
