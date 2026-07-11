import { prisma } from "./prisma";

type Provider = "gemini" | "chatgpt" | "perplexity";

const LIMITS: Record<Provider, { daily: number; perMinute: number }> = {
  gemini: { daily: 100, perMinute: 15 },
  chatgpt: { daily: 100, perMinute: 15 },
  perplexity: { daily: 100, perMinute: 15 },
};

export async function checkRateLimit(provider: Provider): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  const usage = await prisma.apiUsage.findUnique({
    where: { provider_date: { provider, date: today } },
  });

  const limit = LIMITS[provider];
  if (!limit) return true;

  // Check daily limit
  if (usage && usage.requestCount >= limit.daily) {
    return false;
  }

  // Check per-minute limit (simple implementation) - disabled for development
  // if (usage?.lastRequestAt) {
  //   const timeSinceLastRequest = Date.now() - usage.lastRequestAt.getTime();
  //   const minInterval = 60000 / limit.perMinute;
  //   if (timeSinceLastRequest < minInterval) {
  //     await new Promise((resolve) =>
  //       setTimeout(resolve, minInterval - timeSinceLastRequest)
  //     );
  //   }
  // }

  return true;
}

export async function recordUsage(provider: Provider): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  await prisma.apiUsage.upsert({
    where: { provider_date: { provider, date: today } },
    create: {
      provider,
      date: today,
      requestCount: 1,
      lastRequestAt: new Date(),
    },
    update: {
      requestCount: { increment: 1 },
      lastRequestAt: new Date(),
    },
  });
}

export async function getRemainingQuota(provider: Provider): Promise<{
  used: number;
  remaining: number;
  limit: number;
}> {
  const today = new Date().toISOString().split("T")[0];

  const usage = await prisma.apiUsage.findUnique({
    where: { provider_date: { provider, date: today } },
  });

  const limit = LIMITS[provider].daily;
  const used = usage?.requestCount || 0;

  return {
    used,
    remaining: Math.max(0, limit - used),
    limit,
  };
}

export async function getTotalRemainingQuota(): Promise<{
  used: number;
  remaining: number;
  limit: number;
}> {
  const geminiQuota = await getRemainingQuota("gemini");
  const chatgptQuota = await getRemainingQuota("chatgpt");
  const perplexityQuota = await getRemainingQuota("perplexity");

  return {
    used: geminiQuota.used + chatgptQuota.used + perplexityQuota.used,
    remaining: geminiQuota.remaining + chatgptQuota.remaining + perplexityQuota.remaining,
    limit: geminiQuota.limit + chatgptQuota.limit + perplexityQuota.limit,
  };
}
