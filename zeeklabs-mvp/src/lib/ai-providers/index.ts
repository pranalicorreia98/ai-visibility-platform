// Primary providers
export { callGemini, callGeminiWithRetry } from "./gemini";
export { callChatGPT, callChatGPTWithRetry } from "./chatgpt";
export { callPerplexity, callPerplexityWithRetry } from "./perplexity";

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
