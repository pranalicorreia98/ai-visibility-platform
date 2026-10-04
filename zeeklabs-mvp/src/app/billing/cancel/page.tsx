"use client";

import { useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            No worries! Your payment was cancelled and you haven&apos;t been charged.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <p className="text-gray-600 text-sm">
            You can try again anytime by clicking the credits badge in the header or visiting your account settings.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/dashboard/analysis")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
