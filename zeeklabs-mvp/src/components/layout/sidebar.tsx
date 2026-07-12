"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";

// Navigation items matching the design spec
const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Visibility", href: "/dashboard/analysis", icon: Target },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-gray-100">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-gray-900">
          ZeekLabs<span className="text-indigo-600">.ai</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
              )} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="h-4 w-4 text-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="p-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-900">Pro Plan</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Get unlimited scans and advanced analytics
          </p>
          <Link
            href="/pricing"
            className="block w-full text-center py-2 px-3 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          ZeekLabs.ai v1.0
        </div>
      </div>
    </div>
  );
}
