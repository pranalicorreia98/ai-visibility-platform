"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/analysis");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for subscribing to ZeekLabs Pro. Your credits have been added to your account.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-indigo-600 mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">ZeekLabs Pro</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">100 credits</p>
          <p className="text-sm text-gray-500">Added to your account</p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/analysis")}
          className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3"
        >
          Go to Dashboard
        </Button>

        <p className="mt-4 text-xs text-gray-400">
          Redirecting automatically in a few seconds...
        </p>
      </div>
    </div>
  );
}
