"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/zeeklabs-logo.svg"
                alt="zeeklabs Logo"
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span className="font-bold text-xl tracking-tight text-gray-900">
                zeeklabs<span className="text-indigo-600">.ai</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="#why-zeeklabs"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Why zeeklabs
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact
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
            <Link href="#why-zeeklabs" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Why zeeklabs
            </Link>
            <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Contact
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
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden">
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
            <div className="flex items-center justify-center">
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
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

      {/* Why zeeklabs / Differentiation Section */}
      <section id="why-zeeklabs" className="py-14 sm:py-16 bg-[#FAFAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for a world where AI answers the question first
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              More buyers are asking ChatGPT and Gemini before they ever open Google.
              Here&apos;s why the tools you already use can&apos;t see that.
            </p>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-14">
            <table className="w-full min-w-[640px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-transparent" />
                  <th className="p-4 bg-white border border-gray-200 border-b-0 rounded-t-xl font-semibold text-gray-600 text-sm">
                    Traditional SEO
                  </th>
                  <th className="p-4 bg-white border border-gray-200 border-b-0 border-l-0 font-semibold text-gray-600 text-sm">
                    Social listening
                  </th>
                  <th className="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-t-xl font-semibold text-white text-sm">
                    zeeklabs
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
                  <tr key={label}>
                    <td className={`p-4 bg-white border-l border-gray-200 text-sm font-medium text-gray-700 ${i === arr.length - 1 ? "border-b rounded-bl-xl" : ""}`}>
                      {label}
                    </td>
                    <td className={`p-4 bg-white border-x border-gray-200 text-center ${i === arr.length - 1 ? "border-b" : ""}`}>
                      <X className="mx-auto h-5 w-5 text-gray-300" />
                    </td>
                    <td className={`p-4 bg-white border-r border-gray-200 text-center ${i === arr.length - 1 ? "border-b" : ""}`}>
                      <X className="mx-auto h-5 w-5 text-gray-300" />
                    </td>
                    <td className={`p-4 bg-indigo-50 text-center ${i === arr.length - 1 ? "rounded-b-xl" : ""}`}>
                      <Check className="mx-auto h-5 w-5 text-indigo-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How it works */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-gray-200" />
            {[
              {
                icon: Search,
                step: "1",
                title: "Simulate",
                description: "We run the exact questions your buyers ask AI assistants — “best CRM for startups,” “alternatives to [competitor]” — across ChatGPT, Gemini, and Perplexity.",
              },
              {
                icon: BarChart3,
                step: "2",
                title: "Measure",
                description: "Get a visibility score, sentiment breakdown, and side-by-side competitor benchmark.",
              },
              {
                icon: TrendingUp,
                step: "3",
                title: "Improve",
                description: "A prioritized action plan — Wikipedia, Crunchbase, G2, schema markup, and more — shows exactly what closes the gap fastest.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="relative z-10 h-12 w-12 rounded-full bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-16 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to boost your AI visibility?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Get discovered the moment AI recommends a solution to your customers.
          </p>
          <div className="flex items-center justify-center">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/zeeklabs-logo.svg"
                alt="zeeklabs Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-bold text-lg text-white">zeeklabs.ai</span>
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
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} zeeklabs.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
