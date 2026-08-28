"use client";

import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Note: DropdownMenu still used for user profile menu
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Settings,
  User,
  Download,
  Loader2,
  Bell,
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useBrand } from "@/contexts/brand-context";
import { determineBrandScale, generateBrandPrompts, getIndustryContext, getPromptCount } from "@/lib/prompts/prompt-generator";

export function Header() {
  const { data: session } = useSession();
  const {
    brands,
    selectedBrand,
    selectedBrandId,
    setSelectedBrandId,
    visibilityData,
    analysisData,
  } = useBrand();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Enable PDF download if we have analysis data OR visibility data with any meaningful data
  const hasReportData = analysisData !== null ||
    (visibilityData !== null && (
      (visibilityData.simulations && visibilityData.simulations > 0) ||
      (visibilityData.score?.overall && visibilityData.score.overall > 0) ||
      (visibilityData.mentions?.total && visibilityData.mentions.total > 0)
    ));
  const [promptSimulatorOpen, setPromptSimulatorOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Generate dynamic prompts based on brand scale
  const brandName = selectedBrand?.name || "Your Brand";
  const domain = selectedBrand?.domain || "";
  const competitors = selectedBrand?.competitors || [];
  const visibilityScore = visibilityData?.score?.overall;

  // Determine brand scale and generate prompts
  const brandScale = determineBrandScale(competitors, domain, visibilityScore);
  const industryContext = getIndustryContext(domain);
  const competitorNames = competitors.map(c => typeof c === 'string' ? c : c.name);

  // Generate prompts using the centralized prompt generator
  const generatedPrompts = generateBrandPrompts(brandName, industryContext, competitorNames, brandScale);

  // Map to the format expected by the UI (with insight instead of purpose)
  const prompts = generatedPrompts.map(p => ({
    id: p.id,
    category: p.category,
    icon: p.icon,
    gradient: p.gradient,
    prompt: p.prompt,
    insight: p.purpose
  }));

  // Scale label for display
  const scaleLabel = brandScale === "large" ? "Enterprise" : brandScale === "mid" ? "Mid-sized" : "Small";
  const promptCount = getPromptCount(brandScale);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(prompts.map(p => p.category)));
    return ["all", ...cats];
  }, [prompts]);

  // Filter prompts based on search and category
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = searchQuery === "" ||
        prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.insight.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchQuery, selectedCategory]);

  const handleCopyPrompt = async (promptId: string, promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPromptId(promptId);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleDownloadPDF = async () => {
    if (!selectedBrandId || downloadingPdf) return;

    setDownloadingPdf(true);
    try {
      // Open the new report preview page in a new window for printing
      const reportWindow = window.open(`/report-preview/${selectedBrandId}`, '_blank');

      if (!reportWindow) {
        throw new Error('Could not open report window. Please allow popups.');
      }

      // Wait for the page to load, then trigger print
      // The report-preview page will render the full report
      let printTriggered = false;

      const triggerPrint = () => {
        if (printTriggered) return;
        printTriggered = true;

        try {
          reportWindow.focus();
          reportWindow.print();
        } catch (e) {
          console.error('Print error:', e);
        }
      };

      // Try onload first
      reportWindow.onload = () => {
        // Wait for React to render
        setTimeout(triggerPrint, 1500);
      };

      // Fallback timeout
      setTimeout(() => {
        if (!printTriggered) {
          triggerPrint();
        }
      }, 4000);

    } catch (err) {
      console.error("Error downloading PDF:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to generate report: ${errorMessage}`);
    } finally {
      // Reset downloading state after a short delay
      setTimeout(() => setDownloadingPdf(false), 2000);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-3 sm:px-6 gap-2">
      {/* Logo and Brand Selector */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Logo */}
        <Link href="/dashboard/analysis" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/zeeklabs-logo.svg"
            alt="zeeklabs.ai Logo"
            width={36}
            height={36}
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
          <span className="hidden sm:inline font-bold text-lg tracking-tight text-gray-900">
            zeeklabs<span className="text-indigo-600">.ai</span>
          </span>
        </Link>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px bg-gray-200" />

        {/* Brand Selector */}
        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
          <SelectTrigger className="w-[130px] sm:w-[220px] bg-gray-50 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
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
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Prompt Simulator Button */}
        <Button
          onClick={() => setPromptSimulatorOpen(true)}
          size="icon"
          className="sm:w-auto sm:px-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
        >
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Prompt</span>
        </Button>

        {/* Download PDF */}
        <Button
          onClick={handleDownloadPDF}
          disabled={!hasReportData || downloadingPdf}
          size="icon"
          className="sm:w-auto sm:px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
          title={hasReportData ? "Download PDF Report" : "Run analysis first to download report"}
        >
          {downloadingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
          ) : (
            <Download className="h-4 w-4 sm:mr-2" />
          )}
          <span className="hidden sm:inline">Download PDF</span>
        </Button>

        {/* Settings - duplicated in the user menu below, hide on mobile to save space */}
        <Button
          variant="outline"
          asChild
          className="hidden md:inline-flex rounded-xl border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
        >
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4 mr-2 text-gray-600" />
            Settings
          </Link>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-600 rounded-full" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl hover:bg-gray-100">
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

      {/* Prompt Simulator Modal */}
      <Dialog open={promptSimulatorOpen} onOpenChange={setPromptSimulatorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Prompt Simulator
                  </DialogTitle>
                  <p className="text-sm text-white/80 mt-1">
                    Test how AI platforms respond to queries about{" "}
                    <span className="font-semibold text-white">{selectedBrand?.name || "your brand"}</span>
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              )}
            </div>

            {/* Stats & Category Filter */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                  {selectedBrand?.name || "No brand selected"}
                </Badge>
                <Badge variant="outline" className="text-white/90 border-white/30">
                  {scaleLabel} • {filteredPrompts.length} of {prompts.length} prompts
                </Badge>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {cat === "all" ? "All Prompts" : cat}
              </button>
            ))}
          </div>

          {/* Prompts Grid */}
          <div className="p-6 overflow-y-auto max-h-[50vh] bg-gradient-to-b from-white to-gray-50">
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No prompts found matching your search</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  className="mt-2 text-indigo-600 hover:underline text-sm"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map((item) => {
                  const IconComponent = item.icon;
                  const isCopied = copiedPromptId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="group relative bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Gradient Top Border */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`} />

                      <div className="p-4">
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                              <IconComponent className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {item.category}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyPrompt(item.id, item.prompt)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Copy prompt"
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
                            )}
                          </button>
                        </div>

                        {/* Prompt Text */}
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 mb-3 border border-gray-100">
                          <p className="text-sm font-medium text-gray-800 leading-relaxed">
                            "{item.prompt}"
                          </p>
                        </div>

                        {/* Insight */}
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {item.insight}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Tip */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {prompts.length} prompts generated for your {scaleLabel.toLowerCase()} brand
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Copy these prompts and test them on ChatGPT, Gemini, and Perplexity. Prompt count scales based on competitors ({competitors.length}) and visibility score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
