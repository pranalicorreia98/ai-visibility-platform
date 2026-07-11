"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Settings,
  User,
  Download,
  RefreshCw,
  Loader2,
  Bell,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useBrand } from "@/contexts/brand-context";
import { generatePDFReport } from "@/lib/pdf-generator";

export function Header() {
  const { data: session } = useSession();
  const {
    brands,
    selectedBrand,
    selectedBrandId,
    setSelectedBrandId,
    visibilityData,
    analysisData,
    refreshVisibilityData,
    visibilityLoading,
  } = useBrand();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const hasReportData = analysisData !== null || (visibilityData?.simulations && visibilityData.simulations > 0);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleDownloadPDF = async () => {
    if (!selectedBrandId || downloadingPdf) return;

    setDownloadingPdf(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: selectedBrandId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      setDownloadingPdf(false);
      await new Promise(resolve => setTimeout(resolve, 50));
      generatePDFReport(data.report);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to generate report. Please try again.");
      setDownloadingPdf(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
      {/* Brand Selector */}
      <div className="flex items-center gap-4">
        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
          <SelectTrigger className="w-[220px] bg-gray-50 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            <SelectValue placeholder="Select a brand" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id} className="rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">{brand.name.charAt(0)}</span>
                  </div>
                  {brand.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => refreshVisibilityData(true)}
          disabled={visibilityLoading}
          title="Refresh data"
          className="rounded-xl hover:bg-gray-100"
        >
          <RefreshCw className={`h-4 w-4 ${visibilityLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Download PDF - Floating Primary Button */}
        <Button
          onClick={handleDownloadPDF}
          disabled={!hasReportData || downloadingPdf}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
          title={hasReportData ? "Download PDF Report" : "Run analysis first to download report"}
        >
          {downloadingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download PDF
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-600 rounded-full" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100">
          <HelpCircle className="h-5 w-5 text-gray-500" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl p-2" align="end">
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="rounded-lg px-2 py-2 cursor-pointer">
              <User className="mr-2 h-4 w-4 text-gray-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg px-2 py-2 cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg px-2 py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
