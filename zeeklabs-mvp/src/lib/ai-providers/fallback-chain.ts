/**
 * Unified Fallback Chain Provider
 *
 * Priority order:
 * 1. OpenRouter (free credits) - tries multiple models via their fallback system
 * 2. Direct Gemini API (free tier from Google AI Studio)
 * 3. Direct OpenAI API (shared with ClikHire - paid but available)
 *
 * This ensures zeeklabs can run with zero cost most of the time,
 * falling back to paid APIs only when free options are exhausted.
 */

import { callOpenRouterFamily, callOpenRouterAuto } from "./openrouter";
import { callGeminiWithRetry } from "./gemini";
import { callOpenAIDirectWithRetry, isOpenAIDirectConfigured } from "./openai-direct";

export type FallbackProvider = "openrouter" | "gemini" | "openai";

interface FallbackResult {
  content: string;
  provider: FallbackProvider;
  model?: string;
}

/**
 * Check if an error indicates quota/credit exhaustion
 */
function isQuotaError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes("quota") ||
    msg.includes("insufficient") ||
    msg.includes("credit") ||
    msg.includes("402") ||
    msg.includes("exceeded") ||
    msg.includes("billing") ||
    msg.includes("payment required")
  );
}

/**
 * Check if an error indicates rate limiting (temporary)
 */
function isRateLimitError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests");
}

/**
 * Call LLM with automatic fallback chain
 *
 * @param prompt - The prompt to send
 * @param options - Configuration options
 * @returns Result with content and provider used
 */
export async function callWithFallback(
  prompt: string,
  options: {
    /** Preferred model family for OpenRouter: 'gemini' | 'chatgpt' | 'auto' */
    family?: "gemini" | "chatgpt" | "auto";
    /** Maximum tokens for response */
    maxTokens?: number;
    /** Enable web search grounding (OpenRouter only) */
    webSearch?: boolean;
    /** Skip specific providers */
    skip?: FallbackProvider[];
  } = {}
): Promise<FallbackResult> {
  const { family = "gemini", maxTokens = 3500, webSearch = false, skip = [] } = options;

  const errors: Array<{ provider: FallbackProvider; error: Error }> = [];

  // 1. Try OpenRouter first (free credits + smart routing)
  if (!skip.includes("openrouter") && process.env.OPENROUTER_API_KEY) {
    try {
      console.log(`[Fallback Chain] Trying OpenRouter (${family})...`);

      let result;
      if (family === "auto") {
        result = await callOpenRouterAuto(prompt, maxTokens, { webSearch });
      } else {
        result = await callOpenRouterFamily(prompt, family, maxTokens, { webSearch });
      }

      return {
        content: result.content,
        provider: "openrouter",
        model: result.modelUsed,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ provider: "openrouter", error: err });

      if (isQuotaError(err)) {
        console.log(`[Fallback Chain] OpenRouter credits exhausted, trying Gemini...`);
      } else if (isRateLimitError(err)) {
        console.log(`[Fallback Chain] OpenRouter rate limited, trying Gemini...`);
      } else {
        console.log(`[Fallback Chain] OpenRouter failed: ${err.message}, trying Gemini...`);
      }
    }
  }

  // 2. Try Direct Gemini API (free tier from Google AI Studio)
  if (!skip.includes("gemini") && process.env.GOOGLE_AI_API_KEY) {
    try {
      console.log(`[Fallback Chain] Trying Direct Gemini API...`);
      const content = await callGeminiWithRetry(prompt);
      return {
        content,
        provider: "gemini",
        model: "gemini-2.5-flash",
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ provider: "gemini", error: err });

      if (isQuotaError(err)) {
        console.log(`[Fallback Chain] Gemini quota exhausted, trying OpenAI...`);
      } else if (isRateLimitError(err)) {
        console.log(`[Fallback Chain] Gemini rate limited, trying OpenAI...`);
      } else {
        console.log(`[Fallback Chain] Gemini failed: ${err.message}, trying OpenAI...`);
      }
    }
  }

  // 3. Try Direct OpenAI API (shared with ClikHire)
  if (!skip.includes("openai") && isOpenAIDirectConfigured()) {
    try {
      console.log(`[Fallback Chain] Trying Direct OpenAI API...`);
      const content = await callOpenAIDirectWithRetry(prompt);
      return {
        content,
        provider: "openai",
        model: "gpt-4o",
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ provider: "openai", error: err });
      console.log(`[Fallback Chain] OpenAI failed: ${err.message}`);
    }
  }

  // All providers failed
  const errorSummary = errors
    .map((e) => `${e.provider}: ${e.error.message}`)
    .join("; ");

  throw new Error(`[Fallback Chain] All providers failed. Errors: ${errorSummary}`);
}

/**
 * Convenience function for Gemini-preferred calls
 */
export async function callGeminiWithFallback(
  prompt: string,
  options: { maxTokens?: number; webSearch?: boolean } = {}
): Promise<FallbackResult> {
  return callWithFallback(prompt, { ...options, family: "gemini" });
}

/**
 * Convenience function for ChatGPT-preferred calls
 */
export async function callChatGPTWithFallback(
  prompt: string,
  options: { maxTokens?: number; webSearch?: boolean } = {}
): Promise<FallbackResult> {
  return callWithFallback(prompt, { ...options, family: "chatgpt" });
}

/**
 * Convenience function for auto-routed calls
 */
export async function callAutoWithFallback(
  prompt: string,
  options: { maxTokens?: number; webSearch?: boolean } = {}
): Promise<FallbackResult> {
  return callWithFallback(prompt, { ...options, family: "auto" });
}

/**
 * Check which providers are configured
 */
export function getConfiguredProviders(): FallbackProvider[] {
  const providers: FallbackProvider[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    providers.push("openrouter");
  }
  if (process.env.GOOGLE_AI_API_KEY) {
    providers.push("gemini");
  }
  if (isOpenAIDirectConfigured()) {
    providers.push("openai");
  }

  return providers;
}
