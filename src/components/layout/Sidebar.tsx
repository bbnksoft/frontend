"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FileText,
  Users,
  Truck,
  CreditCard,
  Receipt,
  Building2,
  Package,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/vendors", label: "Vendors", icon: Truck },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/banking", label: "Banking", icon: Building2 },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">AcctPlatform</h1>
        <p className="text-xs text-slate-400 mt-0.5">Finance & Accounting</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={clearAuth}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
