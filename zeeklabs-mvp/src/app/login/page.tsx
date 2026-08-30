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
} from "lucide-react";
import Image from "next/image";

function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // No error - show nothing
  if (!error) return null;

  // Pending approval - show friendly signup success message
  if (error === "pending" || error === "CredentialsSignin") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50">
        <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-indigo-700">
            Thanks for your interest!
          </p>
          <p className="text-sm text-gray-600">
            We&apos;ve notified our team about your signup request. Once your account is approved,
            you&apos;ll receive a confirmation email to log in.
          </p>
        </div>
      </div>
    );
  }

  // Rejected user
  if (error === "rejected") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          Your account request was not approved. If you believe this is an error,
          please contact us at founder@zeeklabs.ai.
        </p>
      </div>
    );
  }

  // OAuth error (Google login denied for non-approved users)
  if (error === "AccessDenied" || error === "Callback") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50">
        <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-indigo-700">
            Thanks for your interest!
          </p>
          <p className="text-sm text-gray-600">
            We&apos;ve notified our team about your signup request. Once your account is approved,
            you&apos;ll receive a confirmation email to log in.
          </p>
        </div>
      </div>
    );
  }

  // Generic/unknown error
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
      <p className="text-sm text-gray-700">
        Something went wrong. Please try again or contact founder@zeeklabs.ai.
      </p>
    </div>
  );
}

export default function LoginPage() {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50/50 via-white to-white">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="max-w-md mx-auto flex items-center justify-center">
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
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm text-indigo-700">
                <Sparkles className="h-4 w-4" />
                <span>AI Visibility Platform</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Get Started
              </h1>
              <p className="text-gray-600">
                Sign in or create your account
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <Suspense fallback={null}>
                <LoginErrorBanner />
              </Suspense>

              {/* Google login */}
              <Button
                variant="outline"
                className="w-full h-12 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-500">
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
                  onKeyDown={handleKeyDown}
                  className="h-12 text-base rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />

                <Button
                  className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
                  onClick={handleEmailLogin}
                  disabled={isLoading || !email.trim()}
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
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Features list */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">What you&apos;ll get:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "AI visibility tracking",
                    "Brand monitoring",
                    "Competitor analysis",
                    "Action recommendations",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
