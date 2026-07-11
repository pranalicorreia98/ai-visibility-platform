"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Zap,
  ArrowRight,
  Check,
  Star,
  Play,
  Globe,
  Target,
  BarChart3,
  Users,
  Sparkles,
  ChevronDown,
  Send,
  Loader2,
  Quote,
  Menu,
  X,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformHovered, setPlatformHovered] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);

  // Close platform menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (platformRef.current && !platformRef.current.contains(event.target as Node)) {
        setPlatformHovered(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                ZeekLabs<span className="text-indigo-600">.ai</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Platform with Hover Menu */}
              <div
                ref={platformRef}
                className="relative"
                onMouseEnter={() => setPlatformHovered(true)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                  Platform
                  <ChevronDown className={`h-4 w-4 transition-transform ${platformHovered ? "rotate-180" : ""}`} />
                </button>

                {/* Platform Mega Menu with Playground */}
                {platformHovered && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                    onMouseLeave={() => setPlatformHovered(false)}
                  >
                    <PromptPlayground />
                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="/terms"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Terms
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 rounded-xl">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            <Link href="/pricing" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Pricing
            </Link>
            <Link href="#testimonials" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Testimonials
            </Link>
            <Link href="/terms" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Terms
            </Link>
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Login
              </Link>
              <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-violet-600">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="mb-6 px-4 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI Engine Optimization Platform
            </Badge>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Increase Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                AI Visibility
              </span>{" "}
              Across ChatGPT, Gemini & AI Search
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Optimize your brand&apos;s presence in AI-powered search results. Get discovered when AI recommends solutions to your potential customers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/25 rounded-xl px-8 h-14 text-base"
              >
                <Link href="/login">
                  <Globe className="mr-2 h-5 w-5" />
                  Analyze My Website
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl px-8 h-14 text-base border-gray-300 hover:bg-gray-50"
              >
                <Link href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  Book Demo
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"
                    />
                  ))}
                </div>
                <span>2,000+ brands optimized</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="mt-20 relative">
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-emerald-600">GPT</span>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">G</span>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-violet-600">C</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    AI models discovering your brand in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for AI visibility
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools to monitor, analyze, and improve your brand&apos;s presence across AI platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "AI Visibility Score",
                description: "Track how often AI models mention and recommend your brand.",
                color: "indigo",
              },
              {
                icon: BarChart3,
                title: "Competitor Analysis",
                description: "Compare your AI presence against competitors in real-time.",
                color: "violet",
              },
              {
                icon: MessageSquare,
                title: "Sentiment Tracking",
                description: "Monitor how AI describes your brand - positive, negative, or neutral.",
                color: "emerald",
              },
              {
                icon: TrendingUp,
                title: "Growth Insights",
                description: "See your visibility trends over time with actionable insights.",
                color: "blue",
              },
              {
                icon: Shield,
                title: "Citation Monitoring",
                description: "Track where your brand is cited and find new opportunities.",
                color: "amber",
              },
              {
                icon: Clock,
                title: "Real-time Alerts",
                description: "Get notified when your AI visibility changes significantly.",
                color: "rose",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className={`h-12 w-12 rounded-xl mb-4 flex items-center justify-center bg-${feature.color}-100 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[#FAFAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by leading brands
            </h2>
            <p className="text-lg text-gray-600">
              See how companies are improving their AI visibility with ZeekLabs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Our AI visibility increased by 200% in just 3 months. The insights are incredible.",
                author: "Sarah Chen",
                role: "CMO, TechStartup",
                metric: "+200% visibility",
              },
              {
                quote: "Finally, a tool that helps us understand how AI talks about our brand.",
                author: "Michael Park",
                role: "Head of Digital, Enterprise Co",
                metric: "+85% mentions",
              },
              {
                quote: "The competitor analysis helped us identify gaps we never knew existed.",
                author: "Emily Rodriguez",
                role: "Marketing Director, SaaS Inc",
                metric: "+150% recommendations",
              },
              {
                quote: "Essential for any brand serious about AI-first marketing.",
                author: "David Kim",
                role: "CEO, AI Agency",
                metric: "4x ROI",
              },
              {
                quote: "The action plan feature is a game-changer for our SEO team.",
                author: "Jessica Liu",
                role: "SEO Lead, E-commerce Brand",
                metric: "+120% citations",
              },
              {
                quote: "Best investment we've made in our digital presence this year.",
                author: "Alex Thompson",
                role: "Founder, B2B Platform",
                metric: "+300% reach",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <Quote className="h-8 w-8 text-indigo-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {testimonial.metric}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to boost your AI visibility?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join 2,000+ brands already optimizing their presence across AI platforms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-indigo-700 hover:bg-gray-100 shadow-xl rounded-xl px-8 h-14 text-base"
            >
              <Link href="/login">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-xl px-8 h-14 text-base border-white/30 text-white hover:bg-white/10"
            >
              <Link href="#demo">Book Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">ZeekLabs.ai</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/security" className="hover:text-white transition-colors">
                Security
              </Link>
              <Link href="/docs" className="hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} ZeekLabs.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Prompt Playground Component (shows on Platform hover)
function PromptPlayground() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<{
    chatgpt?: string;
    gemini?: string;
  } | null>(null);

  const examplePrompts = [
    "What is the best CRM?",
    "What is the best fintech API?",
    "What are the best running shoes?",
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    // Simulate API response for demo
    await new Promise((r) => setTimeout(r, 1500));

    setResponses({
      chatgpt: `Based on your query "${prompt}", here are some top recommendations...`,
      gemini: `For "${prompt}", I would suggest considering these options...`,
    });
    setLoading(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-100">
          <Sparkles className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Prompt Playground</h3>
          <p className="text-sm text-gray-500">Test how AI responds to prompts</p>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="relative mb-4">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Try: What is the best CRM?"
          className="pr-12 h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Example Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {examplePrompts.map((ep, i) => (
          <button
            key={i}
            onClick={() => setPrompt(ep)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            {ep}
          </button>
        ))}
      </div>

      {/* Responses */}
      {responses && (
        <div className="space-y-3">
          {/* ChatGPT Response */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">GPT</span>
              </div>
              <span className="text-sm font-medium text-emerald-800">ChatGPT</span>
            </div>
            <p className="text-sm text-emerald-700">{responses.chatgpt}</p>
          </div>

          {/* Gemini Response */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">G</span>
              </div>
              <span className="text-sm font-medium text-blue-800">Gemini</span>
            </div>
            <p className="text-sm text-blue-700">{responses.gemini}</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          Get full analysis for your brand
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
