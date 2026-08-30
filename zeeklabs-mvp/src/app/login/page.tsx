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
  Sparkles,
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
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-indigo-100">
          <Gift className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Request Beta Access</h3>
          <p className="text-sm text-gray-500">Free during beta period</p>
        </div>
      </div>

      {result ? (
        <div className={`p-4 rounded-xl ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
              {result.message}
            </p>
          </div>
          {result.success && (
            <button
              onClick={() => setResult(null)}
              className="mt-3 text-sm text-indigo-600 hover:underline"
            >
              Request for another email
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
            required
          />
          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-gray-100">
          <CreditCard className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Subscribe</h3>
          <p className="text-sm text-gray-500">Coming soon</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Yearly Plan */}
        <div className="relative p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/50">
          <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">
            Save 40%
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Yearly</p>
          <p className="text-2xl font-bold text-gray-900">₹299<span className="text-sm font-normal text-gray-500">/mo</span></p>
          <p className="text-xs text-gray-500">Billed ₹3,588/year</p>
        </div>

        {/* Monthly Plan */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
          <p className="text-sm font-medium text-gray-600 mb-1 mt-2">Monthly</p>
          <p className="text-2xl font-bold text-gray-900">₹499<span className="text-sm font-normal text-gray-500">/mo</span></p>
          <p className="text-xs text-gray-500">Billed monthly</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {[
          "5 brands",
          "8 competitors per brand",
          "ChatGPT, Gemini & Perplexity",
          "PDF reports",
          "Action recommendations",
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        disabled
        className="w-full h-11 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        Coming Soon
      </Button>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    await signIn("credentials", {
      email,
      callbackUrl: "/dashboard/analysis",
    });
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard/analysis" });
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim()) {
      handleEmailLogin();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Already have access?</h3>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-500">or</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <Button
            onClick={handleEmailLogin}
            disabled={isLoading || !email.trim()}
            className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50/50 via-white to-white">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-center">
          <Link href="/home" className="flex items-center gap-2.5">
            <Image
              src="/zeeklabs-logo.svg"
              alt="zeeklabs Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              zeeklabs<span className="text-indigo-600">.ai</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-lg">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm text-indigo-700">
              <Sparkles className="h-4 w-4" />
              <span>AI Visibility Platform</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Get Started with zeeklabs
            </h1>
            <p className="text-gray-600">
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
          <div className="space-y-4">
            <BetaRequestForm />
            <PricingPlans />
            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
