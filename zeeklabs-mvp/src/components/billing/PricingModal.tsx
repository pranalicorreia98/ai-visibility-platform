"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap, CreditCard, Building2 } from "lucide-react";
import { PLANS, type BillingInterval, type Plan, type TierKey } from "@/lib/billing/plans";
import { CREDITS_PER_ANALYSIS } from "@/lib/credits";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Display order + marketing copy for the paid tiers. Numbers (price, credits,
// limits) are pulled from the plan catalog so this never drifts from billing.
const TIER_DISPLAY: {
  tier: Exclude<TierKey, "free">;
  monthlyId: string;
  annualId: string;
  tagline: string;
  support: string;
  popular?: boolean;
}[] = [
  {
    tier: "starter",
    monthlyId: "starter_monthly",
    annualId: "starter_annual",
    tagline: "For solo founders tracking one brand",
    support: "Email support",
  },
  {
    tier: "pro",
    monthlyId: "pro_monthly",
    annualId: "pro_annual",
    tagline: "For teams monitoring a portfolio of brands",
    support: "Priority support",
    popular: true,
  },
  {
    tier: "scale",
    monthlyId: "scale_monthly",
    annualId: "scale_annual",
    tagline: "For agencies at scale",
    support: "Priority support + onboarding",
  },
];

function competitorLabel(n: number): string {
  return Number.isFinite(n) ? `${n} competitors / brand` : "Unlimited competitors / brand";
}

function featureList(monthly: Plan, support: string): string[] {
  const analyses = Math.floor(monthly.creditsPerCycle / CREDITS_PER_ANALYSIS);
  return [
    `${monthly.creditsPerCycle.toLocaleString()} credits / month`,
    `~${analyses} full brand analyses / month`,
    `${monthly.limits.brands} brand${monthly.limits.brands === 1 ? "" : "s"} tracked`,
    competitorLabel(monthly.limits.competitorsPerBrand),
    "Continuous AI visibility monitoring",
    "PDF report exports",
    support,
  ];
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // Load the caller's current plan (for the "Current plan" highlight) when opened.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/billing/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setCurrentPlanId(data.planId ?? null);
      })
      .catch(() => {
        /* non-fatal: fall back to no highlight */
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const tiers = useMemo(
    () =>
      TIER_DISPLAY.map((t) => ({
        ...t,
        monthly: PLANS[t.monthlyId],
        annual: PLANS[t.annualId],
      })),
    []
  );

  const handleCheckout = async (planId: string) => {
    setCheckoutPlanId(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout. Please try again.");
      setCheckoutPlanId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">Choose your plan</DialogTitle>
                <p className="text-sm text-white/80 mt-1">
                  Track your brand&apos;s AI visibility across ChatGPT, Gemini and Perplexity
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Monthly / Annual toggle */}
          <div className="mt-5 flex items-center justify-center">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/15 backdrop-blur-sm">
              <button
                onClick={() => setInterval("month")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  interval === "month" ? "bg-white text-indigo-700" : "text-white/80 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval("year")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  interval === "year" ? "bg-white text-indigo-700" : "text-white/80 hover:text-white"
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs font-semibold text-emerald-300">2 months free</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tier cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map(({ tier, monthly, annual, tagline, support, popular }) => {
            const perMonth = interval === "month" ? monthly.priceUsd : Math.round(annual.priceUsd / 12);
            const planId = interval === "month" ? TIER_DISPLAY.find((d) => d.tier === tier)!.monthlyId : TIER_DISPLAY.find((d) => d.tier === tier)!.annualId;
            const onThisPlan = currentPlanId === planId;
            const loading = checkoutPlanId === planId;

            return (
              <div
                key={tier}
                className={`relative p-6 rounded-xl border-2 bg-white flex flex-col ${
                  popular ? "border-indigo-500 shadow-lg" : "border-gray-200"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white text-xs px-3 py-1">Most popular</Badge>
                  </div>
                )}

                <div className="mb-4">
                  <div className="inline-flex p-2.5 rounded-xl bg-indigo-100 mb-3">
                    <Zap className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{monthly.label}</h3>
                  <p className="text-sm text-gray-500 mt-1 min-h-[2.5rem]">{tagline}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">${perMonth}</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                  {interval === "year" && (
                    <p className="text-xs text-gray-500 mt-1">billed ${annual.priceUsd.toLocaleString()}/year</p>
                  )}
                </div>

                <ul className="text-sm text-gray-600 space-y-2.5 mb-6 flex-1">
                  {featureList(monthly, support).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-xl font-semibold py-3 text-white ${
                    popular
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  onClick={() => handleCheckout(planId)}
                  disabled={loading || onThisPlan || checkoutPlanId !== null}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                      Redirecting…
                    </>
                  ) : onThisPlan ? (
                    "Current plan"
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2 text-white" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Enterprise + secure-payment note */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-200">
                <Building2 className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Enterprise</p>
                <p className="text-sm text-gray-500">
                  Custom volume, SSO, annual contracts and dedicated support.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-gray-300">
              <Link href="/contact">Contact sales</Link>
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Secure payment powered by Dodo Payments</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
