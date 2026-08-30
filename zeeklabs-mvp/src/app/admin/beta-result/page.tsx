"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function BetaResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const email = searchParams.get("email");

  const statusConfig = {
    approved: {
      icon: CheckCircle2,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      title: "Beta Access Approved!",
      message: `Magic link sent to ${email}. They can now access zeeklabs.ai.`,
    },
    rejected: {
      icon: XCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Request Rejected",
      message: `${email} has been notified that their request wasn't approved.`,
    },
    "already-processed": {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      title: "Already Processed",
      message: `This request for ${email} has already been processed.`,
    },
    "not-found": {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      title: "Request Not Found",
      message: `No beta request found for ${email}.`,
    },
    invalid: {
      icon: XCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Invalid Request",
      message: "The approval link is invalid or malformed.",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.invalid;
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-8 text-center`}>
          <Icon className={`h-16 w-16 ${config.iconColor} mx-auto mb-4`} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h1>
          <p className="text-gray-600 mb-6">{config.message}</p>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BetaResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      }
    >
      <BetaResultContent />
    </Suspense>
  );
}
