"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  CheckSquare,
  AlertTriangle,
  TriangleAlert,
  FileText,
  Building2,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Хянах самбар", href: "/", icon: LayoutDashboard },
  { name: "Аудитууд", href: "/audits", icon: Shield },
  { name: "Чеклист", href: "/checklist", icon: CheckSquare },
  { name: "Үл тохирол", href: "/nonconformities", icon: AlertTriangle },
  { name: "Эрсдэл", href: "/risks", icon: TriangleAlert },
  { name: "Тайлан", href: "/reports", icon: FileText },
  { name: "Байгууллагууд", href: "/organizations", icon: Building2 },
  { name: "Тохиргоо", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === "/login") return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Shield className="h-7 w-7 text-primary-600 mr-3" />
        <span className="font-bold text-gray-900">ISO Audit</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">ISO 27001 Audit v0.1</p>
      </div>
    </aside>
  );
}
