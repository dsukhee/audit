"use client";

import { Shield, FileText, AlertTriangle, CheckCircle } from "lucide-react";

const stats = [
  { name: "Нийт аудит", value: "—", icon: Shield, color: "text-primary-600 bg-primary-50" },
  { name: "Идэвхтэй NC", value: "—", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
  { name: "Чеклист бөглөлт", value: "—", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  { name: "Тайлан", value: "—", icon: FileText, color: "text-amber-600 bg-amber-50" },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Хянах самбар</h1>
        <p className="mt-1 text-sm text-gray-500">ISO 27001 Аудитын платформ — Ерөнхий тойм</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card flex items-center gap-4">
            <div className={`rounded-lg p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Сүүлийн үйлдлүүд</h2>
        <div className="card">
          <p className="text-sm text-gray-500 text-center py-8">
            Аудит эхлүүлсний дараа энд үйлдлүүд харагдана.
          </p>
        </div>
      </div>
    </div>
  );
}
