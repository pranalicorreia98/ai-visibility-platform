"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Globe,
  Target,
  BarChart3,
  Sparkles,
  Search,
  Check,
  Menu,
  X,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock,
  Zap,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      {/* Navigation - with scroll state */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/zeeklabs-logo.svg"
                alt="zeeklabs Logo"
                width={36}
                height={36}
                className="h-9 w-9 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-semibold text-xl tracking-tight text-gray-900">
                zeeklabs<span className="text-indigo-600">.ai</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="#why-zeeklabs"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/60 transition-all duration-200"
              >
                Why zeeklabs
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/60 transition-all duration-200"
              >
                Contact
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Button
                asChild
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 h-10 shadow-lg shadow-gray-900/10 transition-all duration-200 hover:shadow-xl hover:shadow-gray-900/15 press-effect"
              >
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 space-y-2 animate-fade-in-down">
            <Link href="#why-zeeklabs" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              Why zeeklabs
            </Link>
            <Link href="/contact" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              Contact
            </Link>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link href="/login" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                Login
              </Link>
              <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 rounded-full h-12">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        {/* Background - Subtle gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px] animate-fade-in" />
          <div className="absolute top-20 right-1/3 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-[80px] animate-fade-in" style={{ animationDelay: "0.2s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline chip */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white rounded-full border border-gray-200/80 shadow-sm animate-fade-in-down">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">AI Engine Optimization Platform</span>
            </div>

            {/* Headline - Stronger hierarchy */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.03em] text-gray-900 mb-6 leading-[1.08] animate-fade-in-up">
              Get discovered when AI
              <br className="hidden sm:block" />
              <span className="relative">
                <span className="relative z-10"> recommends solutions</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-indigo-200/60 -z-0 rounded" />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              See what ChatGPT, Gemini, and Perplexity say about your brand. Track visibility, benchmark competitors, and get actionable recommendations.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Button
                size="lg"
                asChild
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-xl shadow-gray-900/15 rounded-full px-8 h-14 text-base font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/20 press-effect"
              >
                <Link href="/login">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Analysis
                </Link>
              </Button>
              <Link
                href="#why-zeeklabs"
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1.5 transition-colors"
              >
                Learn how it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Social proof hint */}
            <p className="mt-8 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              Trusted by SEO teams and founders building AI-first brands
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Grid */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-50 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-50 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
              Platform Features
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 mb-5 tracking-tight">
              Everything you need for AI visibility
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools to monitor, analyze, and improve your brand&apos;s presence across AI platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {[
              {
                icon: Target,
                title: "AI Visibility Score",
                description: "Track how often AI models mention and recommend your brand across platforms.",
                gradient: "from-indigo-500 to-violet-500",
                bgLight: "bg-indigo-50",
                iconColor: "text-indigo-600",
              },
              {
                icon: BarChart3,
                title: "Competitor Analysis",
                description: "Compare your AI presence against competitors with real-time benchmarking.",
                gradient: "from-violet-500 to-purple-500",
                bgLight: "bg-violet-50",
                iconColor: "text-violet-600",
              },
              {
                icon: MessageSquare,
                title: "Sentiment Tracking",
                description: "Monitor how AI describes your brand - positive, negative, or neutral sentiment.",
                gradient: "from-emerald-500 to-teal-500",
                bgLight: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
              {
                icon: TrendingUp,
                title: "Growth Insights",
                description: "See visibility trends over time with actionable recommendations.",
                gradient: "from-blue-500 to-cyan-500",
                bgLight: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                icon: Shield,
                title: "Citation Monitoring",
                description: "Track where your brand is cited and discover new opportunities.",
                gradient: "from-amber-500 to-orange-500",
                bgLight: "bg-amber-50",
                iconColor: "text-amber-600",
              },
              {
                icon: Clock,
                title: "Real-time Alerts",
                description: "Get notified instantly when your AI visibility changes significantly.",
                gradient: "from-rose-500 to-pink-500",
                bgLight: "bg-rose-50",
                iconColor: "text-rose-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-6 lg:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient accent on hover */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

                <div className={`h-12 w-12 rounded-xl mb-5 flex items-center justify-center ${feature.bgLight} group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2.5">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[0.938rem]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why zeeklabs / Differentiation Section */}
      <section id="why-zeeklabs" className="py-20 sm:py-28 bg-[#FAFAFB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 lg:mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
              Why zeeklabs
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 mb-5 tracking-tight">
              Built for a world where AI answers first
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              More buyers are asking ChatGPT and Gemini before they ever open Google.
              Here&apos;s why the tools you already use can&apos;t see that.
            </p>
          </div>

          {/* Comparison table - Premium styling */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-20">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full min-w-[640px] border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="text-left p-5 bg-transparent w-[35%]" />
                    <th className="p-4 bg-white border border-gray-200 border-b-0 rounded-t-2xl font-semibold text-gray-500 text-sm tracking-wide">
                      Traditional SEO
                    </th>
                    <th className="p-4 bg-white border border-gray-200 border-b-0 border-l-0 font-semibold text-gray-500 text-sm tracking-wide">
                      Social listening
                    </th>
                    <th className="p-4 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 rounded-t-2xl font-semibold text-white text-sm tracking-wide shadow-lg shadow-indigo-500/20">
                      zeeklabs.ai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Sees what ChatGPT & Gemini actually say",
                    "Benchmarks you against named competitors",
                    "Tracks sentiment across AI platforms",
                    "Turns gaps into a prioritized action plan",
                  ].map((label, i, arr) => (
                    <tr key={label} className="group">
                      <td className={`p-5 bg-white border-l border-gray-200 text-sm font-medium text-gray-700 ${i === 0 ? "border-t rounded-tl-2xl" : ""} ${i === arr.length - 1 ? "border-b rounded-bl-2xl" : ""}`}>
                        {label}
                      </td>
                      <td className={`p-4 bg-white border-x border-gray-200 text-center transition-colors group-hover:bg-gray-50/50 ${i === 0 ? "border-t" : ""} ${i === arr.length - 1 ? "border-b" : ""}`}>
                        <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100">
                          <X className="h-4 w-4 text-gray-400" />
                        </div>
                      </td>
                      <td className={`p-4 bg-white border-r border-gray-200 text-center transition-colors group-hover:bg-gray-50/50 ${i === 0 ? "border-t" : ""} ${i === arr.length - 1 ? "border-b" : ""}`}>
                        <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100">
                          <X className="h-4 w-4 text-gray-400" />
                        </div>
                      </td>
                      <td className={`p-4 bg-indigo-50/80 text-center ${i === arr.length - 1 ? "rounded-b-2xl" : ""}`}>
                        <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-600 shadow-md shadow-indigo-500/30">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How it works - Premium steps */}
          <div className="relative">
            <div className="text-center mb-12">
              <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
                How it works
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Three steps to AI visibility
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200" />

              {[
                {
                  icon: Search,
                  step: "01",
                  title: "Simulate",
                  description: "We run the exact questions your buyers ask AI assistants — \"best CRM for startups,\" \"alternatives to [competitor]\" — across ChatGPT, Gemini, and Perplexity.",
                },
                {
                  icon: BarChart3,
                  step: "02",
                  title: "Measure",
                  description: "Get a visibility score, sentiment breakdown, and side-by-side competitor benchmark with actionable metrics.",
                },
                {
                  icon: TrendingUp,
                  step: "03",
                  title: "Improve",
                  description: "A prioritized action plan — Wikipedia, Crunchbase, G2, schema markup, and more — shows exactly what closes the gap fastest.",
                },
              ].map((item, i) => (
                <div key={item.step} className="relative text-center group">
                  <div className="relative z-10 mx-auto mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto shadow-sm group-hover:shadow-lg group-hover:border-indigo-200 transition-all duration-300">
                      <item.icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium gradient with pattern */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-950" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">Limited beta access</span>
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to boost your AI visibility?
          </h2>
          <p className="text-xl text-indigo-200/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get discovered the moment AI recommends a solution to your customers. Join forward-thinking brands already optimizing for AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-2xl shadow-black/20 rounded-full px-8 h-14 text-base font-medium transition-all duration-300 hover:scale-105 press-effect"
            >
              <Link href="/login">
                <Zap className="mr-2 h-5 w-5" />
                Start Free Analysis
              </Link>
            </Button>
            <Link
              href="/contact"
              className="text-white/80 hover:text-white font-medium flex items-center gap-1.5 transition-colors px-4 py-3"
            >
              Talk to us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Setup in 2 minutes
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Footer - Modern minimal */}
      <footer className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <Image
                  src="/zeeklabs-logo.svg"
                  alt="zeeklabs Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="font-semibold text-xl tracking-tight text-gray-900">
                  zeeklabs<span className="text-indigo-600">.ai</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                The AI Engine Optimization platform that helps brands get discovered when AI recommends solutions.
              </p>
            </div>

            {/* Product column */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#why-zeeklabs" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <a href="mailto:founder@zeeklabs.ai" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} zeeklabs.ai. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                Made in India 🇮🇳
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
