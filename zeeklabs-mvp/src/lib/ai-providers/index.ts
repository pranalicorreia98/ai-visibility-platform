// Primary providers
export { callGemini, callGeminiWithRetry } from "./gemini";
export { callChatGPT, callChatGPTWithRetry } from "./chatgpt";
export { callPerplexity, callPerplexityWithRetry } from "./perplexity";

// Direct OpenAI API (fallback, shared with ClikHire)
export { callOpenAIDirect, callOpenAIDirectWithRetry, isOpenAIDirectConfigured } from "./openai-direct";

// OpenRouter - Smart routing with automatic fallbacks
// See: https://openrouter.ai/docs/guides/routing
export {
  // New smart routing functions
  callOpenRouterAuto,          // Auto-router: intelligent model selection
  callOpenRouterFamily,        // Call a model family with fallbacks
  callOpenRouterWithFallbacks, // Custom fallback chain
  // Legacy exports (backwards compatible)
  callOpenRouter,
  callOpenRouterChatGPTWithRetry,
  callOpenRouterGeminiWithRetry,
  callOpenRouterWithRetry
} from "./openrouter";

// Unified Fallback Chain - tries free providers first, then paid
// Priority: OpenRouter (free) → Direct Gemini (free) → Direct OpenAI (paid)
export {
  callWithFallback,
  callGeminiWithFallback,
  callChatGPTWithFallback,
  callAutoWithFallback,
  getConfiguredProviders,
  type FallbackProvider
} from "./fallback-chain";
