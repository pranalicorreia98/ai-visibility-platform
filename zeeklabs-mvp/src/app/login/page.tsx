"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  BarChart3,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Activity,
  Target,
  Users,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

// Highlights - what makes zeeklabs different, not attributed to fabricated customers
const highlights = [
  {
    icon: Target,
    title: "See what AI actually says",
    description: "ChatGPT, Gemini, and Perplexity don't show up in Google Analytics. We simulate real buyer questions and show you exactly how each one answers.",
  },
  {
    icon: Users,
    title: "Benchmark against named competitors",
    description: "Not just your own score in isolation - see exactly how you compare to the competitors you actually care about, every time you run an analysis.",
  },
  {
    icon: TrendingUp,
    title: "A plan, not just a score",
    description: "Wikipedia, Crunchbase, G2, schema markup - a prioritized action plan tells you exactly what closes the gap fastest.",
  },
];

// Features
const features = [
  {
    icon: Activity,
    title: "Real-time AI Monitoring",
    description: "Track your brand mentions across ChatGPT, Gemini, Claude, and more",
  },
  {
    icon: Target,
    title: "Visibility Score",
    description: "Get a clear score showing your AI presence vs competitors",
  },
  {
    icon: TrendingUp,
    title: "Actionable Insights",
    description: "AI-powered recommendations to boost your visibility",
  },
  {
    icon: Users,
    title: "Competitor Analysis",
    description: "See how you stack up against competitors in AI responses",
  },
];

function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
      <p className="text-sm">
        Access denied — your account is either awaiting admin approval or wasn&apos;t
        approved. You&apos;ll get an email once a decision is made.
      </p>
    </div>
  );
}

function DemoAutoTrigger({ onTrigger }: { onTrigger: () => void }) {
  const searchParams = useSearchParams();
  const triggered = searchParams.get("demo") === "1";

  useEffect(() => {
    if (triggered) onTrigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered]);

  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState(0);

  // Auto-rotate highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHighlight((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoLogin = async (overrideEmail?: string) => {
    setIsLoading(true);
    const effectiveEmail = overrideEmail !== undefined ? overrideEmail : email;
    await signIn("credentials", {
      email: effectiveEmail || "demo@zeeklabs.com",
      callbackUrl: "/dashboard/analysis",
    });
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard/analysis" });
    setIsLoading(false);
  };

  const nextHighlight = () => {
    setCurrentHighlight((prev) => (prev + 1) % highlights.length);
  };

  const prevHighlight = () => {
    setCurrentHighlight((prev) => (prev - 1 + highlights.length) % highlights.length);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Premium branding with testimonials */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#081229]" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between gap-10 p-10 xl:p-14 w-full h-screen overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Image
              src="/zeeklabs-logo.svg"
              alt="zeeklabs Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              zeeklabs<span className="text-primary">.ai</span>
            </span>
          </div>

          {/* Main content */}
          <div className="space-y-10 max-w-xl">
            {/* Headline */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Brand Intelligence</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-white">
                Own Your Brand&apos;s
                <span className="block gradient-text-premium">AI Visibility</span>
              </h1>
              <p className="text-lg text-slate-400">
                Monitor, analyze, and improve how AI systems like ChatGPT and Gemini recommend your brand to millions of users.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <feature.icon className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Highlight carousel */}
            <div className="relative">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                {(() => {
                  const HighlightIcon = highlights[currentHighlight].icon;
                  return <HighlightIcon className="h-8 w-8 text-primary/70 mb-4" />;
                })()}

                <div className="min-h-[120px]">
                  <p className="font-semibold text-white text-lg mb-2">
                    {highlights[currentHighlight].title}
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    {highlights[currentHighlight].description}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    {highlights.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentHighlight(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === currentHighlight ? "w-6 bg-primary" : "w-2 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={prevHighlight}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={nextHighlight}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center justify-center gap-3 mb-8">
            <Image
              src="/zeeklabs-logo.svg"
              alt="zeeklabs Logo"
              width={56}
              height={56}
              className="h-14 w-14"
            />
            <div className="text-center">
              <span className="text-2xl font-bold tracking-tight">zeeklabs</span>
              <span className="text-primary">.ai</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login form */}
          <div className="space-y-5">
            <Suspense fallback={null}>
              <LoginErrorBanner />
            </Suspense>
            <Suspense fallback={null}>
              <DemoAutoTrigger onTrigger={() => handleDemoLogin("demo@zeeklabs.com")} />
            </Suspense>

            {/* Google login */}
            <Button
              variant="outline"
              className="w-full h-12 text-base rounded-xl border-2 hover:bg-muted/50"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email login */}
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base rounded-xl"
              />

              <Button
                className="w-full h-12 text-base rounded-xl gradient-bg hover:opacity-90 transition-opacity"
                onClick={() => handleDemoLogin()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Demo hint - directly triggers the demo login, not just a hint */}
            <button
              type="button"
              onClick={() => handleDemoLogin("demo@zeeklabs.com")}
              disabled={isLoading}
              className="w-full text-left p-4 rounded-xl bg-primary/10 border-2 border-primary/30 hover:bg-primary/15 hover:border-primary/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Try the demo — no signup required</p>
                  <p className="text-sm text-muted-foreground">
                    Instantly explore zeeklabs with a live demo account
                  </p>
                </div>
              </div>
            </button>

            {/* Features list */}
            <div className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">What you&apos;ll get:</p>
              <div className="space-y-2">
                {[
                  "AI visibility tracking across ChatGPT & Gemini",
                  "Real-time brand monitoring",
                  "Competitor analysis dashboard",
                  "Actionable improvement recommendations",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
