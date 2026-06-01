"use client";

import { Plus, AlertTriangle } from "lucide-react";

const statusBadge: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

export default function NonconformitiesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Үл тохирол (NC)</h1>
          <p className="mt-1 text-sm text-gray-500">Бүх аудитын үл тохирлын жагсаалт</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          NC бүртгэх
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Нээлттэй", count: "—", cls: "border-l-4 border-red-500" },
          { label: "Явагдаж буй", count: "—", cls: "border-l-4 border-yellow-500" },
          { label: "Шалгагдсан", count: "—", cls: "border-l-4 border-green-500" },
          { label: "Хаагдсан", count: "—", cls: "border-l-4 border-gray-400" },
        ].map((item) => (
          <div key={item.label} className={`card ${item.cls}`}>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-xl font-bold">{item.count}</p>
          </div>
        ))}
      </div>

      {/* NC Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заалт</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ангилал</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Олдвор</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төлөв</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хугацаа</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                Үл тохирол бүртгэгдээгүй байна.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
