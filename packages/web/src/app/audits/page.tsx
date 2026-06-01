"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function AuditsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аудитууд</h1>
          <p className="mt-1 text-sm text-gray-500">Бүх аудитын жагсаалт</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Шинэ аудит
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Аудит хайх..." className="input pl-10" />
          </div>
          <select className="input w-48">
            <option value="">Бүх төлөв</option>
            <option value="DRAFT">Ноорог</option>
            <option value="PLANNED">Төлөвлөсөн</option>
            <option value="IN_PROGRESS">Явагдаж байна</option>
            <option value="COMPLETED">Дууссан</option>
            <option value="CLOSED">Хаагдсан</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Код</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Байгууллага</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стандарт</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Төлөв</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                Аудит бүртгэгдээгүй байна. "Шинэ аудит" товч дээр дарж эхлүүлнэ үү.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
