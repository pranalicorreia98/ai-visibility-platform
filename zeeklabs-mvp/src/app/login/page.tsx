"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Gift,
  CreditCard,
  Check,
  Loader2,
} from "lucide-react";
import Image from "next/image";

function LoginMessages() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  // Success messages
  if (message === "activated") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-green-700">Account activated!</p>
          <p className="text-sm text-gray-600">
            Your account is ready. Sign in below to get started.
          </p>
        </div>
      </div>
    );
  }

  if (message === "already-activated") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50">
        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          Your account is already active. Please sign in below.
        </p>
      </div>
    );
  }

  // Error messages
  if (error === "invalid-token" || error === "token-expired") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          This link is invalid or expired. Please request beta access again or sign in if you already have an account.
        </p>
      </div>
    );
  }

  if (error === "not-allowlisted") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          You need beta access or a paid subscription to sign in. Request beta access below or subscribe to get started.
        </p>
      </div>
    );
  }

  if (error === "CredentialsSignin" || error === "AccessDenied" || error === "Callback") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          You need beta access or a paid subscription to sign in. Request beta access below or wait for our paid plans.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          Something went wrong. Please try again or contact founder@zeeklabs.ai.
        </p>
      </div>
    );
  }

  return null;
}

function BetaRequestForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/beta-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setEmail("");
      }
    } catch {
      setResult({ success: false, message: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Top accent gradient */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100">
          <Gift className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Request Beta Access</h3>
          <p className="text-sm text-gray-500">Free during beta period</p>
        </div>
      </div>

      {result ? (
        <div className={`p-4 rounded-xl ${result.success ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-start gap-2.5">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${result.success ? "text-emerald-700" : "text-red-700"}`}>
              {result.message}
            </p>
          </div>
          {result.success && (
            <button
              onClick={() => setResult(null)}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              Request for another email
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-gray-50/50 placeholder:text-gray-400"
            required
          />
          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-lg shadow-gray-900/10 transition-all duration-200 press-effect"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Request Beta Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            We&apos;ll review and email you within 24 hours
          </p>
        </form>
      )}
    </div>
  );
}

function PricingPlans() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gray-100">
          <CreditCard className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Credit Packs</h3>
          <p className="text-sm text-gray-500">Pay as you go</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Starter pack */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 transition-all duration-200 hover:border-gray-300">
          <p className="text-sm font-medium text-gray-600 mb-1">10 credits</p>
          <p className="text-2xl font-bold text-gray-900">₹30<span className="text-sm font-normal text-gray-500 ml-1">one-time</span></p>
          <p className="text-xs text-gray-500 mt-1.5">Good for 1 brand analysis</p>
        </div>

        {/* Bulk pack */}
        <div className="relative p-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
          <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-medium rounded-full shadow-sm">
            Best Value
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1 mt-1">100 credits</p>
          <p className="text-2xl font-bold text-gray-900">₹299<span className="text-sm font-normal text-gray-500 ml-1">one-time</span></p>
          <p className="text-xs text-gray-500 mt-1.5">Good for 10 brand analyses</p>
        </div>
      </div>

      <div className="space-y-2.5 mb-5 py-4 px-4 bg-gray-50/80 rounded-xl">
        {[
          "10 credits = 1 full brand analysis",
          "Credits never expire",
          "ChatGPT, Gemini & Perplexity",
          "PDF reports",
          "Action recommendations",
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-indigo-600" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        disabled
        className="w-full h-12 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed font-medium"
      >
        Coming Soon
      </Button>
    </div>
  );
}

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard/analysis" });
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-5">Already have access?</h3>

      <Button
        variant="outline"
        className="w-full h-12 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 font-medium transition-all duration-200"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
        ) : (
          <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Secure sign-in via Google OAuth
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative w-full py-6 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-center">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <Image
              src="/zeeklabs-logo.svg"
              alt="zeeklabs Logo"
              width={40}
              height={40}
              className="h-10 w-10 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              zeeklabs<span className="text-indigo-600">.ai</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg animate-fade-in-up">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200/80 shadow-sm text-sm text-gray-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">AI Engine Optimization Platform</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Get started with zeeklabs
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor your brand&apos;s AI visibility across ChatGPT, Gemini & Perplexity
            </p>
          </div>

          {/* Messages */}
          <div className="mb-6">
            <Suspense fallback={null}>
              <LoginMessages />
            </Suspense>
          </div>

          {/* Main sections */}
          <div className="space-y-5">
            <BetaRequestForm />
            <PricingPlans />
            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
