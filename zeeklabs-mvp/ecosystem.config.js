// pm2 process definitions for the EC2 box (docs/AWS-DEPLOYMENT-PLAN-MVP.md §3).
// Both processes load env vars from .env in this directory (Next.js and
// Prisma/tsx both do this automatically - see scripts/dev-db.ts's sibling
// scripts for the same pattern).
module.exports = {
  apps: [
    {
      name: "web-bff",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: __dirname,
      env: { NODE_ENV: "production", PORT: 3000 },
    },
    {
      name: "analysis-worker",
      script: "node_modules/.bin/tsx",
      args: "scripts/analysis-worker.ts",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
    {
      name: "scheduler-check",
      script: "node_modules/.bin/tsx",
      args: "scripts/scheduler-check.ts",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
  ],
};
