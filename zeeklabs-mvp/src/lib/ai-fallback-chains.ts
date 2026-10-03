// Per-provider fallback chains shared by anything that needs to run a real
// prompt against an AI platform (the Prompt Simulator and competitor
// measurement). Extracted out of api/simulate/route.ts so both call sites
// use the exact same provider logic instead of two copies drifting apart.
//
// Fallback priority for Gemini:
//   1. Google AI Studio (free tier)
//   2. OpenRouter (free credits)
//   3. Direct OpenAI API (paid, shared with ClikHire) - LAST RESORT
//
// Fallback priority for ChatGPT:
//   1. GitHub Models (free tier)
//   2. OpenRouter (free credits)
//   3. Direct OpenAI API (paid, shared with ClikHire) - LAST RESORT
import {
  callChatGPTWithRetry,
  callGeminiWithRetry,
  callPerplexityWithRetry,
  callOpenRouterChatGPTWithRetry,
  callOpenRouterGeminiWithRetry,
  callOpenAIDirectWithRetry,
  isOpenAIDirectConfigured,
} from "@/lib/ai-providers";

/**
 * Fallback chain for Gemini:
 * 1. Google AI Studio (Gemini 2.0 Flash) - primary (FREE)
 * 2. OpenRouter (Gemini 2.0 Flash free) - fallback (FREE)
 * 3. Direct OpenAI API (gpt-4o) - LAST RESORT (PAID, shared with ClikHire)
 */
export async function callGeminiWithFallbackChain(prompt: string): Promise<{ response: string; provider: string }> {
  let lastError: Error | null = null;

  // 1. Try Google AI Studio (FREE)
  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      console.log("Trying Google AI Studio (Gemini)...");
      const response = await callGeminiWithRetry(prompt);
      console.log("✓ Google AI Studio succeeded");
      return { response, provider: "gemini" };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`✗ Google AI Studio failed: ${lastError.message}`);
    }
  } else {
    console.log("Skipping Google AI Studio: API key not configured");
  }

  // 2. Try OpenRouter (FREE credits)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log("Trying OpenRouter (Gemini models)...");
      const response = await callOpenRouterGeminiWithRetry(prompt);
      console.log("✓ OpenRouter Gemini succeeded");
      return { response, provider: "gemini (via OpenRouter)" };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`✗ OpenRouter Gemini failed: ${lastError.message}`);
    }
  }

  // 3. LAST RESORT: Direct OpenAI API (PAID, shared with ClikHire)
  if (isOpenAIDirectConfigured()) {
    try {
      console.log("Trying Direct OpenAI API (paid fallback)...");
      const response = await callOpenAIDirectWithRetry(prompt);
      console.log("✓ Direct OpenAI API succeeded (paid fallback used)");
      return { response, provider: "gemini (via OpenAI fallback)" };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`✗ Direct OpenAI API failed: ${lastError.message}`);
    }
  }

  throw lastError || new Error("No Gemini providers available. Configure GOOGLE_AI_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY.");
}

/**
 * Fallback chain for ChatGPT:
 * 1. GitHub Models (GPT-4o) - primary (FREE)
 * 2. OpenRouter (GPT-4o) - fallback (FREE credits)
 * 3. Direct OpenAI API (gpt-4o) - LAST RESORT (PAID, shared with ClikHire)
 */
export async function callChatGPTWithFallbackChain(prompt: string): Promise<{ response: string; provider: string }> {
  let lastError: Error | null = null;

  // 1. Try GitHub Models (FREE)
  if (process.env.GITHUB_TOKEN) {
    try {
      console.log("Trying GitHub Models (ChatGPT)...");
      const response = await callChatGPTWithRetry(prompt);
      console.log("✓ GitHub Models succeeded");
      return { response, provider: "chatgpt" };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`✗ GitHub Models failed: ${lastError.message}`);
    }
  } else {
    console.log("Skipping GitHub Models: API key not configured");
  }

  // 2. Try OpenRouter (FREE credits)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log("Trying OpenRouter (ChatGPT models)...");
      const response = await callOpenRouterChatGPTWithRetry(prompt);
      console.log("✓ OpenRouter ChatGPT succeeded");
      return { response, provider: "chatgpt (via OpenRouter)" };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`✗ OpenRouter ChatGPT failed: ${lastError.message}`);
    }
  }

  // 3. LAST RESORT: Direct OpenAI API (PAID, shared with ClikHire)
  if (isOpenAIDirectConfigured()) {
    try {
      console.log("Trying Direct OpenAI API (paid fallback)...");
      const response = await callOpenAIDirectWithRetry(prompt);
      console.log("✓ Direct OpenAI API succeeded (paid fallback used)");
      return { response, provider: "chatgpt (via OpenAI fallback)" };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`✗ Direct OpenAI API failed: ${lastError.message}`);
    }
  }

  throw lastError || new Error("No ChatGPT providers available. Configure GITHUB_TOKEN, OPENROUTER_API_KEY, or OPENAI_API_KEY.");
}

/**
 * Perplexity AI using OpenAI-compatible API (no fallback provider).
 */
export async function callPerplexityWithFallbackChain(prompt: string): Promise<{ response: string; provider: string }> {
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      console.log("Trying Perplexity AI...");
      const response = await callPerplexityWithRetry(prompt);
      console.log("✓ Perplexity AI succeeded");
      return { response, provider: "perplexity" };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`✗ Perplexity AI failed: ${err.message}`);
      throw err;
    }
  }

  throw new Error("Perplexity API key not configured. Set PERPLEXITY_API_KEY environment variable.");
}
