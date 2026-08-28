/**
 * Wires up the brand-monitoring scan that previously had no scheduler
 * calling it: runs runMonitoringPass() in-process every 15 minutes.
 *
 * This is the "scheduler-check.js" process from the deployment plan
 * (docs/AWS-DEPLOYMENT-PLAN-MVP.md, §3) — under pm2/crontab in production,
 * or just `npm run scheduler:check` locally.
 */
import { runMonitoringPass } from "../src/lib/monitoring-runner";

const INTERVAL_MS = 15 * 60 * 1000;

async function tick(): Promise<void> {
  try {
    const { brandsProcessed, timestamp } = await runMonitoringPass();
    console.log(`[scheduler-check] ${timestamp}: processed ${brandsProcessed} brand(s)`);
  } catch (error) {
    console.error("[scheduler-check] run failed:", error);
  }
}

console.log(`scheduler-check started, running every ${INTERVAL_MS / 60000} minutes`);
tick();
setInterval(tick, INTERVAL_MS);
