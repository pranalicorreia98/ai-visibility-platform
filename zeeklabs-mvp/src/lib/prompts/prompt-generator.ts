/**
 * Dynamic Prompt Generator
 * Generates prompts based on brand scale (small, mid-sized, large)
 */

import {
  Search,
  Star,
  Users,
  TrendingUp,
  Shield,
  Zap,
  MessageSquare,
  Lightbulb,
  DollarSign,
  Trophy,
  Layers,
  MapPin,
  Newspaper,
  Award,
  RefreshCw,
  Rocket,
  Target,
  HelpCircle,
  Scale,
  Gem,
  ThumbsUp,
  ListOrdered,
  Globe,
  Building,
  Briefcase,
  Heart,
  Clock,
  Percent,
  Gift,
  Wrench,
  BookOpen,
  Headphones,
  ShoppingCart,
  Truck,
  CreditCard,
  Phone,
  Mail,
  Camera,
  Video,
  Mic,
  FileText,
  BarChart,
  PieChart,
  Activity,
  Compass,
  Flag,
  type LucideIcon,
} from "lucide-react";

export type BrandScale = "small" | "mid" | "large";

export interface PromptItem {
  id: string;
  category: string;
  icon: LucideIcon;
  gradient: string;
  bgGradient?: string;
  borderColor?: string;
  textColor?: string;
  prompt: string;
  purpose: string;
}

/**
 * Determine brand scale based on available data
 * - Small: < 3 competitors, no domain, low visibility score
 * - Mid: 3-6 competitors, has domain, moderate visibility
 * - Large: > 6 competitors, established domain, high visibility
 */
export function determineBrandScale(
  competitors: Array<{ id: string; name: string; domain?: string }> | string[],
  domain?: string,
  visibilityScore?: number
): BrandScale {
  const competitorCount = competitors?.length || 0;
  const hasDomain = !!domain && domain.length > 0;
  const score = visibilityScore || 0;

  // Large scale indicators
  if (competitorCount > 6 || (competitorCount >= 4 && score > 70) || (hasDomain && score > 80)) {
    return "large";
  }

  // Mid scale indicators
  if (competitorCount >= 3 || (hasDomain && competitorCount >= 2) || score > 50) {
    return "mid";
  }

  // Default to small
  return "small";
}

/**
 * Get prompt count based on brand scale
 */
export function getPromptCount(scale: BrandScale): number {
  switch (scale) {
    case "small":
      return 20;
    case "mid":
      return 35;
    case "large":
      return 60;
    default:
      return 20;
  }
}

/**
 * Generate comprehensive prompts for a brand
 */
export function generateBrandPrompts(
  brandName: string,
  industryContext: string,
  competitorNames: string[],
  scale: BrandScale
): PromptItem[] {
  const primaryCompetitor = competitorNames[0] || "competitors";
  const secondaryCompetitor = competitorNames[1] || "other brands";
  const thirdCompetitor = competitorNames[2] || "alternatives";

  // Base prompts (20) - Always included
  const basePrompts: PromptItem[] = [
    // Brand Discovery (5)
    {
      id: "direct-brand",
      category: "Brand Discovery",
      icon: Search,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `Tell me about ${brandName}`,
      purpose: "Tests direct brand recognition"
    },
    {
      id: "brand-review",
      category: "Brand Discovery",
      icon: Star,
      gradient: "from-amber-500 to-yellow-500",
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      prompt: `Is ${brandName} any good? What are the reviews like?`,
      purpose: "Checks reputation and sentiment"
    },
    {
      id: "brand-features",
      category: "Brand Discovery",
      icon: Layers,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      prompt: `What does ${brandName} offer? What are their main products or services?`,
      purpose: "Evaluates product knowledge depth"
    },
    {
      id: "brand-pricing",
      category: "Brand Discovery",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      prompt: `How much does ${brandName} cost? Is it worth the price?`,
      purpose: "Tests pricing information accuracy"
    },
    {
      id: "brand-history",
      category: "Brand Discovery",
      icon: BookOpen,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      prompt: `What is the history of ${brandName}? When was it founded?`,
      purpose: "Tests brand knowledge depth"
    },
    // Recommendations (5)
    {
      id: "industry-best",
      category: "Recommendations",
      icon: Trophy,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      prompt: `What are the best companies in ${industryContext}?`,
      purpose: "Tests category leadership visibility"
    },
    {
      id: "recommendation",
      category: "Recommendations",
      icon: ThumbsUp,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      prompt: `Can you recommend a good provider in ${industryContext}?`,
      purpose: "Measures recommendation inclusion"
    },
    {
      id: "top-list",
      category: "Recommendations",
      icon: ListOrdered,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
      borderColor: "border-cyan-200",
      textColor: "text-cyan-700",
      prompt: `List the top 10 players in ${industryContext} in India`,
      purpose: "Checks ranking position in lists"
    },
    {
      id: "beginner-query",
      category: "Recommendations",
      icon: HelpCircle,
      gradient: "from-lime-500 to-green-500",
      bgGradient: "from-lime-50 to-green-50",
      borderColor: "border-lime-200",
      textColor: "text-lime-700",
      prompt: `I'm new to ${industryContext}. Where should I start?`,
      purpose: "Tests entry-point recommendations"
    },
    {
      id: "use-case",
      category: "Recommendations",
      icon: Target,
      gradient: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
      borderColor: "border-teal-200",
      textColor: "text-teal-700",
      prompt: `Which ${industryContext} service is best for small businesses?`,
      purpose: "Tests segment-specific recommendations"
    },
    // Competition (4)
    {
      id: "brand-comparison",
      category: "Competition",
      icon: Users,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      borderColor: "border-violet-200",
      textColor: "text-violet-700",
      prompt: `Compare ${brandName} vs ${primaryCompetitor}`,
      purpose: "Tests competitive positioning"
    },
    {
      id: "alternatives",
      category: "Competition",
      icon: RefreshCw,
      gradient: "from-fuchsia-500 to-purple-500",
      bgGradient: "from-fuchsia-50 to-purple-50",
      borderColor: "border-fuchsia-200",
      textColor: "text-fuchsia-700",
      prompt: `What are some alternatives to ${brandName}?`,
      purpose: "Maps alternative brand associations"
    },
    {
      id: "comparison-general",
      category: "Competition",
      icon: Scale,
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700",
      prompt: `Compare the leading brands in ${industryContext}`,
      purpose: "Tests competitive mention context"
    },
    {
      id: "why-choose",
      category: "Competition",
      icon: Flag,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      prompt: `Why should I choose ${brandName} over ${primaryCompetitor}?`,
      purpose: "Tests differentiation messaging"
    },
    // Trust & Authority (3)
    {
      id: "trust-query",
      category: "Trust & Authority",
      icon: Shield,
      gradient: "from-slate-500 to-gray-600",
      bgGradient: "from-slate-50 to-gray-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-700",
      prompt: `Which ${industryContext} brands are most trusted in India?`,
      purpose: "Measures trust and authority signals"
    },
    {
      id: "expert-opinion",
      category: "Trust & Authority",
      icon: Award,
      gradient: "from-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `What do experts say about ${brandName}?`,
      purpose: "Tests expert citation and authority"
    },
    {
      id: "value-query",
      category: "Trust & Authority",
      icon: Gem,
      gradient: "from-sky-500 to-blue-500",
      bgGradient: "from-sky-50 to-blue-50",
      borderColor: "border-sky-200",
      textColor: "text-sky-700",
      prompt: `What's the best value for money in ${industryContext}?`,
      purpose: "Tests value positioning"
    },
    // Trending & News (3)
    {
      id: "trending",
      category: "Trending & News",
      icon: TrendingUp,
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      prompt: `What's trending in ${industryContext} right now?`,
      purpose: "Checks current relevance visibility"
    },
    {
      id: "news-query",
      category: "Trending & News",
      icon: Newspaper,
      gradient: "from-gray-500 to-slate-600",
      bgGradient: "from-gray-50 to-slate-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      prompt: `Any recent news about ${brandName}?`,
      purpose: "Tests news and PR visibility"
    },
    {
      id: "startup-query",
      category: "Trending & News",
      icon: Rocket,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      prompt: `What are some innovative startups in ${industryContext}?`,
      purpose: "Checks emerging brand visibility"
    },
  ];

  // Mid-scale additional prompts (15 more = 35 total)
  const midScalePrompts: PromptItem[] = [
    // Problem Solving (3)
    {
      id: "problem-solving",
      category: "Problem Solving",
      icon: Lightbulb,
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-50 to-amber-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      prompt: `I need help with ${industryContext} solutions. What options do I have?`,
      purpose: "Tests solution-based discovery"
    },
    {
      id: "local-query",
      category: "Problem Solving",
      icon: MapPin,
      gradient: "from-red-500 to-orange-500",
      bgGradient: "from-red-50 to-orange-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      prompt: `Best ${industryContext} providers near me in India`,
      purpose: "Checks local/regional visibility"
    },
    {
      id: "budget-query",
      category: "Problem Solving",
      icon: DollarSign,
      gradient: "from-green-500 to-teal-500",
      bgGradient: "from-green-50 to-teal-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      prompt: `What are affordable options in ${industryContext}?`,
      purpose: "Tests budget segment visibility"
    },
    // Customer Experience (3)
    {
      id: "customer-service",
      category: "Customer Experience",
      icon: Headphones,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `How is ${brandName}'s customer service?`,
      purpose: "Tests service reputation"
    },
    {
      id: "user-experience",
      category: "Customer Experience",
      icon: Heart,
      gradient: "from-pink-500 to-red-500",
      bgGradient: "from-pink-50 to-red-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      prompt: `What do customers love about ${brandName}?`,
      purpose: "Tests positive sentiment extraction"
    },
    {
      id: "complaints",
      category: "Customer Experience",
      icon: MessageSquare,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      prompt: `What are common complaints about ${brandName}?`,
      purpose: "Tests negative sentiment awareness"
    },
    // Market Position (3)
    {
      id: "market-leader",
      category: "Market Position",
      icon: Building,
      gradient: "from-slate-600 to-gray-700",
      bgGradient: "from-slate-50 to-gray-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-700",
      prompt: `Who is the market leader in ${industryContext} in India?`,
      purpose: "Tests leadership visibility"
    },
    {
      id: "market-share",
      category: "Market Position",
      icon: PieChart,
      gradient: "from-indigo-500 to-violet-500",
      bgGradient: "from-indigo-50 to-violet-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      prompt: `What is ${brandName}'s market share?`,
      purpose: "Tests market position knowledge"
    },
    {
      id: "growth-trajectory",
      category: "Market Position",
      icon: Activity,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      prompt: `Is ${brandName} growing? What's their trajectory?`,
      purpose: "Tests growth narrative"
    },
    // Specific Comparisons (3)
    {
      id: "vs-competitor-2",
      category: "Competition",
      icon: Users,
      gradient: "from-violet-500 to-indigo-500",
      bgGradient: "from-violet-50 to-indigo-50",
      borderColor: "border-violet-200",
      textColor: "text-violet-700",
      prompt: `${brandName} vs ${secondaryCompetitor} - which is better?`,
      purpose: "Tests secondary competitor positioning"
    },
    {
      id: "switching-query",
      category: "Competition",
      icon: RefreshCw,
      gradient: "from-cyan-500 to-teal-500",
      bgGradient: "from-cyan-50 to-teal-50",
      borderColor: "border-cyan-200",
      textColor: "text-cyan-700",
      prompt: `Should I switch from ${primaryCompetitor} to ${brandName}?`,
      purpose: "Tests switching narrative"
    },
    {
      id: "pros-cons",
      category: "Competition",
      icon: Scale,
      gradient: "from-amber-500 to-yellow-500",
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      prompt: `What are the pros and cons of ${brandName}?`,
      purpose: "Tests balanced perception"
    },
    // Use Cases (3)
    {
      id: "enterprise-use",
      category: "Use Cases",
      icon: Briefcase,
      gradient: "from-gray-600 to-slate-700",
      bgGradient: "from-gray-50 to-slate-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      prompt: `Is ${brandName} suitable for enterprise use?`,
      purpose: "Tests enterprise perception"
    },
    {
      id: "startup-use",
      category: "Use Cases",
      icon: Rocket,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      prompt: `Is ${brandName} good for startups?`,
      purpose: "Tests startup segment visibility"
    },
    {
      id: "individual-use",
      category: "Use Cases",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `Can individuals use ${brandName}? Is it suitable for personal use?`,
      purpose: "Tests B2C perception"
    },
  ];

  // Large-scale additional prompts (25 more = 60 total)
  const largeScalePrompts: PromptItem[] = [
    // Deep Competitive Analysis (5)
    {
      id: "vs-competitor-3",
      category: "Deep Competition",
      icon: Users,
      gradient: "from-rose-500 to-red-500",
      bgGradient: "from-rose-50 to-red-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700",
      prompt: `Compare ${brandName}, ${primaryCompetitor}, and ${secondaryCompetitor}`,
      purpose: "Tests multi-competitor comparison"
    },
    {
      id: "competitive-advantage",
      category: "Deep Competition",
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      prompt: `What is ${brandName}'s competitive advantage?`,
      purpose: "Tests differentiation clarity"
    },
    {
      id: "market-disruption",
      category: "Deep Competition",
      icon: Activity,
      gradient: "from-red-500 to-pink-500",
      bgGradient: "from-red-50 to-pink-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      prompt: `Is ${brandName} disrupting the ${industryContext} market?`,
      purpose: "Tests disruption narrative"
    },
    {
      id: "industry-benchmark",
      category: "Deep Competition",
      icon: BarChart,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      prompt: `How does ${brandName} compare to industry benchmarks?`,
      purpose: "Tests benchmark positioning"
    },
    {
      id: "competitor-weakness",
      category: "Deep Competition",
      icon: Target,
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      prompt: `What does ${brandName} do better than ${primaryCompetitor}?`,
      purpose: "Tests competitive strengths"
    },
    // Product Deep Dive (5)
    {
      id: "product-features",
      category: "Product Analysis",
      icon: Layers,
      gradient: "from-teal-500 to-emerald-500",
      bgGradient: "from-teal-50 to-emerald-50",
      borderColor: "border-teal-200",
      textColor: "text-teal-700",
      prompt: `What are ${brandName}'s key features?`,
      purpose: "Tests feature awareness"
    },
    {
      id: "product-quality",
      category: "Product Analysis",
      icon: Award,
      gradient: "from-amber-500 to-yellow-500",
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      prompt: `How is the quality of ${brandName}'s products?`,
      purpose: "Tests quality perception"
    },
    {
      id: "product-innovation",
      category: "Product Analysis",
      icon: Lightbulb,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      prompt: `What innovations has ${brandName} introduced?`,
      purpose: "Tests innovation narrative"
    },
    {
      id: "product-roadmap",
      category: "Product Analysis",
      icon: Compass,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `What's new from ${brandName}? Any upcoming products?`,
      purpose: "Tests roadmap visibility"
    },
    {
      id: "product-ecosystem",
      category: "Product Analysis",
      icon: Globe,
      gradient: "from-green-500 to-teal-500",
      bgGradient: "from-green-50 to-teal-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      prompt: `Does ${brandName} have an ecosystem of products?`,
      purpose: "Tests ecosystem awareness"
    },
    // Pricing & Value (4)
    {
      id: "pricing-comparison",
      category: "Pricing & Value",
      icon: DollarSign,
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      prompt: `How does ${brandName}'s pricing compare to ${primaryCompetitor}?`,
      purpose: "Tests price comparison"
    },
    {
      id: "pricing-tiers",
      category: "Pricing & Value",
      icon: Layers,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      prompt: `What pricing plans does ${brandName} offer?`,
      purpose: "Tests pricing knowledge"
    },
    {
      id: "roi-query",
      category: "Pricing & Value",
      icon: Percent,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `What's the ROI of using ${brandName}?`,
      purpose: "Tests value proposition"
    },
    {
      id: "discount-query",
      category: "Pricing & Value",
      icon: Gift,
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      prompt: `Does ${brandName} offer discounts or promotions?`,
      purpose: "Tests promotional visibility"
    },
    // Support & Operations (4)
    {
      id: "support-quality",
      category: "Support & Operations",
      icon: Headphones,
      gradient: "from-indigo-500 to-violet-500",
      bgGradient: "from-indigo-50 to-violet-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      prompt: `How responsive is ${brandName}'s support team?`,
      purpose: "Tests support reputation"
    },
    {
      id: "onboarding",
      category: "Support & Operations",
      icon: BookOpen,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
      borderColor: "border-cyan-200",
      textColor: "text-cyan-700",
      prompt: `How easy is it to get started with ${brandName}?`,
      purpose: "Tests onboarding experience"
    },
    {
      id: "implementation",
      category: "Support & Operations",
      icon: Wrench,
      gradient: "from-gray-500 to-slate-600",
      bgGradient: "from-gray-50 to-slate-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      prompt: `How long does it take to implement ${brandName}?`,
      purpose: "Tests implementation perception"
    },
    {
      id: "training",
      category: "Support & Operations",
      icon: FileText,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      borderColor: "border-violet-200",
      textColor: "text-violet-700",
      prompt: `Does ${brandName} provide training and documentation?`,
      purpose: "Tests enablement resources"
    },
    // Industry Specific (4)
    {
      id: "industry-fit",
      category: "Industry Fit",
      icon: Building,
      gradient: "from-slate-600 to-gray-700",
      bgGradient: "from-slate-50 to-gray-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-700",
      prompt: `Which industries does ${brandName} serve best?`,
      purpose: "Tests industry fit perception"
    },
    {
      id: "case-studies",
      category: "Industry Fit",
      icon: FileText,
      gradient: "from-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      prompt: `Are there any ${brandName} case studies or success stories?`,
      purpose: "Tests case study visibility"
    },
    {
      id: "enterprise-clients",
      category: "Industry Fit",
      icon: Briefcase,
      gradient: "from-gray-600 to-slate-700",
      bgGradient: "from-gray-50 to-slate-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      prompt: `What major companies use ${brandName}?`,
      purpose: "Tests enterprise adoption"
    },
    {
      id: "certifications",
      category: "Industry Fit",
      icon: Award,
      gradient: "from-amber-600 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      prompt: `Does ${brandName} have any certifications or compliance?`,
      purpose: "Tests compliance visibility"
    },
    // Future & Vision (3)
    {
      id: "company-vision",
      category: "Future & Vision",
      icon: Compass,
      gradient: "from-purple-600 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      prompt: `What is ${brandName}'s vision for the future?`,
      purpose: "Tests vision narrative"
    },
    {
      id: "industry-future",
      category: "Future & Vision",
      icon: TrendingUp,
      gradient: "from-pink-600 to-rose-600",
      bgGradient: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      prompt: `How is ${brandName} preparing for the future of ${industryContext}?`,
      purpose: "Tests future readiness"
    },
    {
      id: "sustainability",
      category: "Future & Vision",
      icon: Globe,
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      prompt: `Is ${brandName} sustainable or environmentally conscious?`,
      purpose: "Tests ESG perception"
    },
  ];

  // Build the prompt list based on scale
  let allPrompts = [...basePrompts];

  if (scale === "mid" || scale === "large") {
    allPrompts = [...allPrompts, ...midScalePrompts];
  }

  if (scale === "large") {
    allPrompts = [...allPrompts, ...largeScalePrompts];
  }

  return allPrompts;
}

/**
 * Get industry context from domain
 */
export function getIndustryContext(domain: string): string {
  const industryKeywords = domain.toLowerCase();

  if (industryKeywords.includes("skin") || industryKeywords.includes("beauty") || industryKeywords.includes("cosmetic")) {
    return "skincare & beauty";
  } else if (industryKeywords.includes("tech") || industryKeywords.includes("software") || industryKeywords.includes("saas")) {
    return "technology";
  } else if (industryKeywords.includes("health") || industryKeywords.includes("medical") || industryKeywords.includes("pharma")) {
    return "healthcare";
  } else if (industryKeywords.includes("food") || industryKeywords.includes("restaurant") || industryKeywords.includes("cafe")) {
    return "food & beverage";
  } else if (industryKeywords.includes("fashion") || industryKeywords.includes("cloth") || industryKeywords.includes("apparel")) {
    return "fashion & apparel";
  } else if (industryKeywords.includes("finance") || industryKeywords.includes("bank") || industryKeywords.includes("invest")) {
    return "finance & banking";
  } else if (industryKeywords.includes("education") || industryKeywords.includes("learn") || industryKeywords.includes("school")) {
    return "education";
  } else if (industryKeywords.includes("travel") || industryKeywords.includes("hotel") || industryKeywords.includes("tour")) {
    return "travel & hospitality";
  }

  return "this industry";
}
