"use client";

import { Plus } from "lucide-react";

// 5x5 Risk Matrix colors
const matrixColors: Record<string, string> = {
  "1-1": "bg-green-100", "1-2": "bg-green-100", "1-3": "bg-yellow-100", "1-4": "bg-yellow-100", "1-5": "bg-orange-100",
  "2-1": "bg-green-100", "2-2": "bg-yellow-100", "2-3": "bg-yellow-100", "2-4": "bg-orange-100", "2-5": "bg-orange-100",
  "3-1": "bg-yellow-100", "3-2": "bg-yellow-100", "3-3": "bg-orange-100", "3-4": "bg-orange-100", "3-5": "bg-red-100",
  "4-1": "bg-yellow-100", "4-2": "bg-orange-100", "4-3": "bg-orange-100", "4-4": "bg-red-100", "4-5": "bg-red-100",
  "5-1": "bg-orange-100", "5-2": "bg-orange-100", "5-3": "bg-red-100", "5-4": "bg-red-100", "5-5": "bg-red-200",
};

const likelihoodLabels = ["Маш бага", "Бага", "Дунд", "Өндөр", "Маш өндөр"];
const impactLabels = ["Маш бага", "Бага", "Дунд", "Өндөр", "Маш өндөр"];

export default function RisksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Эрсдэлийн үнэлгээ</h1>
          <p className="mt-1 text-sm text-gray-500">ISO 27005 — 5x5 эрсдэлийн матриц</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Эрсдэл бүртгэх
        </button>
      </div>

      {/* 5x5 Risk Matrix Visualization */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Эрсдэлийн матриц (Магадлал x Нөлөөлөл)</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 -rotate-90 whitespace-nowrap">Магадлал →</span>
          </div>
          <div>
            <div className="grid grid-cols-5 gap-1">
              {[5, 4, 3, 2, 1].map((likelihood) =>
                [1, 2, 3, 4, 5].map((impact) => {
                  const score = likelihood * impact;
                  const key = `${likelihood}-${impact}`;
                  return (
                    <div
                      key={key}
                      className={`w-14 h-14 flex items-center justify-center rounded text-xs font-bold ${matrixColors[key]}`}
                    >
                      {score}
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex justify-between mt-2 px-1">
              {impactLabels.map((label) => (
                <span key={label} className="text-[10px] text-gray-400 w-14 text-center">{label}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">Нөлөөлөл →</p>
          </div>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Эрсдэл</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оноо</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Түвшин</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Боловсруулалт</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төлөв</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                Эрсдэл бүртгэгдээгүй байна.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
