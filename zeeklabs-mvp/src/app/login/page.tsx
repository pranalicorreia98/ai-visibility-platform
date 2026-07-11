"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Mail,
  BarChart3,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  CheckCircle2,
  ArrowRight,
  Activity,
  Target,
  Users,
} from "lucide-react";

// Testimonials data
const testimonials = [
  {
    quote: "ZeekLabs transformed how we understand our brand presence in AI. We increased our ChatGPT mentions by 340% in 3 months.",
    author: "Sarah Chen",
    role: "Head of Growth",
    company: "TechScale AI",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "Finally, a tool that shows us exactly how AI assistants talk about our brand. The insights are game-changing for our SEO strategy.",
    author: "Marcus Williams",
    role: "VP Marketing",
    company: "Innovate Labs",
    avatar: "MW",
    rating: 5,
  },
  {
    quote: "We went from not being mentioned at all to ranking #2 in ChatGPT recommendations. The ROI has been incredible.",
    author: "Priya Sharma",
    role: "CMO",
    company: "DataDriven.io",
    avatar: "PS",
    rating: 5,
  },
];

// Stats
const stats = [
  { value: "500+", label: "Brands Tracked" },
  { value: "2M+", label: "AI Queries Analyzed" },
  { value: "340%", label: "Avg Visibility Increase" },
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    await signIn("credentials", {
      email: email || "demo@zeeklabs.com",
      callbackUrl: "/dashboard",
    });
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
    setIsLoading(false);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
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
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">ZeekLabs</span>
              <span className="text-xs text-primary -mt-0.5">.ai</span>
            </div>
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

            {/* Testimonial carousel */}
            <div className="relative">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Quote className="h-8 w-8 text-primary/50 mb-4" />

                <div className="min-h-[120px]">
                  <p className="text-lg text-white leading-relaxed">
                    &quot;{testimonials[currentTestimonial].quote}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonials[currentTestimonial].author}</p>
                      <p className="text-sm text-slate-400">
                        {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTestimonial(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === currentTestimonial ? "w-6 bg-primary" : "w-2 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={prevTestimonial}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center justify-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold tracking-tight">ZeekLabs</span>
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
                onClick={handleDemoLogin}
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

            {/* Demo hint */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Try the demo</p>
                  <p className="text-sm text-muted-foreground">
                    Leave email empty to explore with a demo account
                  </p>
                </div>
              </div>
            </div>

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
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
