/**
 * Create the 6 ZeekLabs subscription products in Dodo, deterministically.
 *
 * Why a script (not the dashboard): real-money products — a wrong price means a
 * customer is actually charged wrong. This creates all six with exact prices in
 * one shot, no clicking.
 *
 * Prices mirror src/lib/billing/plans.ts (docs/PRICING_STRATEGY.md):
 *   Starter $49 / $490   Pro $149 / $1,490   Scale $399 / $3,990
 *
 * Usage (LIVE) — put the key in a gitignored .env.local (recommended, keeps it out
 * of shell history):
 *   .env.local:  DODO_PAYMENTS_API_KEY=<LIVE key>
 *                DODO_PAYMENTS_ENV=live_mode
 *   then:        npx tsx scripts/create-live-products.ts            # dry run
 *                npx tsx scripts/create-live-products.ts --confirm  # create
 * ...or pass inline in your own terminal:
 *   DODO_PAYMENTS_API_KEY=<LIVE key> DODO_PAYMENTS_ENV=live_mode \
 *     npx tsx scripts/create-live-products.ts --confirm
 *
 * Without --confirm it DRY-RUNS: prints exactly what it would create, creates nothing.
 * Run ONCE against an empty Live catalog — re-running creates duplicates.
 * The API key is read from the environment and never hard-coded. Product ids it
 * prints are NOT secret (they go into plans.ts, same as the test ids).
 */
import { config } from "dotenv";
import DodoPayments from "dodopayments";

// Load a gitignored .env.local (then .env) if present; real env vars still win.
config({ path: ".env.local" });
config();

type Interval = "Month" | "Year";

// $ amounts from plans.ts, in the currency's smallest denomination (cents).
const PLANS: { key: string; name: string; cents: number; interval: Interval }[] = [
  { key: "starter_monthly", name: "ZeekLabs Starter (Monthly)", cents: 4_900, interval: "Month" },
  { key: "starter_annual", name: "ZeekLabs Starter (Annual)", cents: 49_000, interval: "Year" },
  { key: "pro_monthly", name: "ZeekLabs Pro (Monthly)", cents: 14_900, interval: "Month" },
  { key: "pro_annual", name: "ZeekLabs Pro (Annual)", cents: 149_000, interval: "Year" },
  { key: "scale_monthly", name: "ZeekLabs Scale (Monthly)", cents: 39_900, interval: "Month" },
  { key: "scale_annual", name: "ZeekLabs Scale (Annual)", cents: 399_000, interval: "Year" },
];

async function main() {
  const confirm = process.argv.includes("--confirm");
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const environment = (process.env.DODO_PAYMENTS_ENV as "test_mode" | "live_mode") ?? "live_mode";

  if (!apiKey) {
    throw new Error("Set DODO_PAYMENTS_API_KEY (the LIVE key) in the environment before running.");
  }

  console.log(`\nMode: ${environment}   ${confirm ? "CREATE" : "DRY-RUN (pass --confirm to create)"}\n`);
  for (const p of PLANS) {
    console.log(`  ${p.key.padEnd(16)}  ${p.name.padEnd(28)}  $${(p.cents / 100).toFixed(0)}/${p.interval}`);
  }
  console.log("");

  if (!confirm) {
    console.log("Dry run — nothing created. Re-run with --confirm to create these 6 products.\n");
    return;
  }

  const client = new DodoPayments({ bearerToken: apiKey, environment });
  const ids: Record<string, string> = {};

  for (const p of PLANS) {
    const product = await client.products.create({
      name: p.name,
      tax_category: "saas",
      price: {
        type: "recurring_price",
        currency: "USD",
        price: p.cents,
        payment_frequency_count: 1,
        payment_frequency_interval: p.interval,
        subscription_period_count: 1,
        subscription_period_interval: p.interval,
      },
    });
    ids[p.key] = product.product_id;
    console.log(`  created  ${p.key.padEnd(16)} -> ${product.product_id}`);
  }

  console.log("\nPaste this into DODO_TEST_PRODUCT_IDS in src/lib/billing/plans.ts:\n");
  console.log(
    Object.entries(ids)
      .map(([k, v]) => `  ${k}: "${v}",`)
      .join("\n")
  );
  console.log("");
}

main().catch((e) => {
  console.error("\nFAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
