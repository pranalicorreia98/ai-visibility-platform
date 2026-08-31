import OpenAI from "openai";

let client: OpenAI | null = null;

// ============================================================================
// SMART MODEL ROUTING via OpenRouter
// ============================================================================
// OpenRouter handles model fallbacks SERVER-SIDE when using the `models` array.
// This means: no more manual retry loops, automatic handling of deprecated models,
// and the router will try each model in order on failures (404, rate limits, etc.)
//
// Additionally, we use "openrouter/auto" for intelligent routing that:
// - Automatically selects the best model based on task type
// - Uses community spending data (updated every 7 days) to pick optimal models
// - Handles new model releases automatically
//
// See: https://openrouter.ai/docs/guides/routing/model-fallbacks
// See: https://openrouter.ai/docs/guides/routing/routers/auto-router
// ============================================================================

// Model families with fallbacks - OpenRouter tries each in order
// Using wildcards where possible for automatic version updates
const MODEL_CONFIGS = {
  // Auto router - let OpenRouter pick the best model automatically
  auto: {
    models: ["openrouter/auto"],
    description: "Auto-router selects best model based on task type"
  },

  // Gemini family - fast, good for analysis
  gemini: {
    models: [
      "google/gemini-2.5-flash",        // Primary - fast and reliable
      "google/gemini-2.5-pro",          // Fallback - more capable
      "google/gemini-pro-1.5",          // Legacy fallback
    ],
    description: "Google Gemini models"
  },

  // OpenAI/ChatGPT family
  chatgpt: {
    models: [
      "openai/gpt-4o",                  // Primary - best balance
      "openai/gpt-4o-mini",             // Cheaper fallback
      "openai/gpt-4-turbo",             // Legacy fallback
    ],
    description: "OpenAI GPT models"
  },

  // Claude family (via OpenRouter)
  claude: {
    models: [
      "anthropic/claude-sonnet-4",      // Primary - good balance
      "anthropic/claude-3.5-sonnet",    // Fallback
      "anthropic/claude-3-haiku",       // Cheap fallback
    ],
    description: "Anthropic Claude models"
  }
} as const;

type ModelFamily = keyof typeof MODEL_CONFIGS;

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not configured");
    }
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "Zeek.ai"
      }
    });
  }
  return client;
}

/**
 * Core OpenRouter call using NATIVE model fallbacks.
 * OpenRouter handles fallbacks server-side - no manual retry loops needed.
 *
 * When using the `models` array, OpenRouter will:
 * - Try each model in order
 * - Automatically fallback on 404 (model unavailable), rate limits, downtime
 * - Bill only for the model that actually succeeds
 */
export interface OpenRouterCallOptions {
  /**
   * Attaches OpenRouter's web search plugin (Exa-backed) so the model
   * answers grounded in live search results instead of training data alone —
   * cuts down on the LLM inventing market intel/citations/competitor facts
   * for content that's supposed to be a real-world answer, not a guess.
   * See: https://openrouter.ai/docs/features/web-search
   */
  webSearch?: boolean;
}

export async function callOpenRouterWithFallbacks(
  prompt: string,
  models: string[],
  maxTokens: number = 3500,
  options?: OpenRouterCallOptions
): Promise<{ content: string; modelUsed: string }> {
  const openrouter = getClient();

  // 60 second timeout - allows time for fallbacks
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`OpenRouter API timeout after 60 seconds`)), 60000);
  });

  console.log(`OpenRouter: Calling with fallback chain [${models.join(" -> ")}]${options?.webSearch ? " (web search on)" : ""}`);

  const response = await Promise.race([
    openrouter.chat.completions.create({
      // @ts-expect-error - OpenRouter accepts 'models' array for fallbacks
      models: models,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
      ...(options?.webSearch && { plugins: [{ id: "web" }] }),
    }),
    timeoutPromise
  ]) as OpenAI.Chat.Completions.ChatCompletion;

  const modelUsed = response.model || models[0];
  console.log(`✓ OpenRouter succeeded using: ${modelUsed}`);

  return {
    content: response.choices[0]?.message?.content || "",
    modelUsed
  };
}

/**
 * Call OpenRouter with Auto Router - intelligently selects best model.
 * Uses community spending data to pick optimal model for the task.
 * Stays up-to-date with new model releases automatically.
 */
export async function callOpenRouterAuto(
  prompt: string,
  maxTokens: number = 3500,
  options?: {
    costTier?: "low" | "medium" | "high" | "xhigh" | "max";
    allowedModels?: string[];  // e.g., ["google/*", "anthropic/*"]
  } & OpenRouterCallOptions
): Promise<{ content: string; modelUsed: string }> {
  const openrouter = getClient();

  console.log(`OpenRouter Auto: Letting router select best model (tier: ${options?.costTier || "default"})${options?.webSearch ? " (web search on)" : ""}`);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`OpenRouter Auto timeout after 60 seconds`)), 60000);
  });

  // Build plugins config: auto-router tuning and/or the web search plugin,
  // each as a separate entry in the plugins array.
  const plugins: Array<Record<string, unknown>> = [];
  if (options?.costTier || options?.allowedModels) {
    plugins.push({
      id: "auto-router",
      ...(options?.costTier && { cost_tier: options.costTier }),
      ...(options?.allowedModels && { allowed_models: options.allowedModels }),
    });
  }
  if (options?.webSearch) {
    plugins.push({ id: "web" });
  }

  const response = await Promise.race([
    openrouter.chat.completions.create({
      model: "openrouter/auto",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
      ...(plugins.length > 0 && { plugins })
    }),
    timeoutPromise
  ]) as OpenAI.Chat.Completions.ChatCompletion;

  const modelUsed = response.model || "openrouter/auto";
  console.log(`✓ OpenRouter Auto selected: ${modelUsed}`);

  return {
    content: response.choices[0]?.message?.content || "",
    modelUsed
  };
}

/**
 * Call OpenRouter with a specific model family (gemini, chatgpt, claude).
 * Uses OpenRouter's native fallback chain for resilience.
 */
export async function callOpenRouterFamily(
  prompt: string,
  family: ModelFamily = "gemini",
  maxTokens: number = 3500,
  options?: OpenRouterCallOptions
): Promise<{ content: string; modelUsed: string }> {
  const config = MODEL_CONFIGS[family];
  console.log(`OpenRouter ${family}: ${config.description}`);
  return callOpenRouterWithFallbacks(prompt, [...config.models], maxTokens, options);
}

// ============================================================================
// LEGACY EXPORTS - For backwards compatibility
// These wrap the new smart routing functions
// ============================================================================

export async function callOpenRouter(prompt: string, model: string, maxTokens: number = 3500): Promise<string> {
  const { content } = await callOpenRouterWithFallbacks(prompt, [model], maxTokens);
  return content;
}

export async function callOpenRouterChatGPTWithRetry(prompt: string): Promise<string> {
  const { content } = await callOpenRouterFamily(prompt, "chatgpt");
  return content;
}

export async function callOpenRouterGeminiWithRetry(prompt: string): Promise<string> {
  const { content } = await callOpenRouterFamily(prompt, "gemini");
  return content;
}

export async function callOpenRouterWithRetry(prompt: string): Promise<string> {
  return callOpenRouterGeminiWithRetry(prompt);
}
