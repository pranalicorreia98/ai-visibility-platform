"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function FloatingPromptLab() {
  const pathname = usePathname();

  // Don't show on the simulator page itself
  if (pathname === "/dashboard/simulator") {
    return null;
  }

  return (
    <Link
      href="/dashboard/simulator"
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 group"
      title="Open Prompt Lab"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Button */}
        <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-105 transition-all duration-300">
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs font-medium hidden md:inline">Prompt</span>
        </div>

        {/* Tooltip for mobile */}
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden pointer-events-none">
          Prompt
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
        </div>
      </div>
    </Link>
  );
}
