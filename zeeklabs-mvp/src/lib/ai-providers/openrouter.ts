import OpenAI from "openai";

let client: OpenAI | null = null;

// OpenRouter models - ONLY OpenAI and Google models
// See: https://openrouter.ai/docs/models
// Using correct model identifiers for OpenRouter
const OPENROUTER_CHATGPT_MODELS = [
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-4-turbo",
];

const OPENROUTER_GEMINI_MODELS = [
  "google/gemini-2.0-flash-001",       // Fast, reliable
  "google/gemini-2.5-flash:free",      // Free tier
  "google/gemini-flash-1.5",           // Fallback
];

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

export async function callOpenRouter(prompt: string, model: string, maxTokens: number = 3500): Promise<string> {
  const openrouter = getClient();

  // 45 second timeout - enough for analysis but still fast fallback
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`OpenRouter API timeout after 45 seconds (model: ${model})`)), 45000);
  });

  const response = await Promise.race([
    openrouter.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0, // Deterministic output - same prompt = same response
    }),
    timeoutPromise
  ]);

  return response.choices[0]?.message?.content || "";
}

// OpenRouter ChatGPT (OpenAI models only) with model fallback
export async function callOpenRouterChatGPTWithRetry(
  prompt: string,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (const model of OPENROUTER_CHATGPT_MODELS) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Trying OpenRouter ChatGPT model: ${model} (attempt ${i + 1})`);
        const response = await callOpenRouter(prompt, model);
        console.log(`✓ OpenRouter ${model} succeeded`);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`✗ OpenRouter ${model} failed: ${lastError.message}`);

        // If timeout, 404, or rate limited, skip to next model immediately
        if (lastError.message.includes("timeout") ||
            lastError.message.includes("404") || lastError.message.includes("429") ||
            lastError.message.includes("rate") || lastError.message.includes("quota") ||
            lastError.message.includes("credit")) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Failed to call OpenRouter ChatGPT - all models exhausted");
}

// OpenRouter Gemini (Google models only) with model fallback
export async function callOpenRouterGeminiWithRetry(
  prompt: string,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (const model of OPENROUTER_GEMINI_MODELS) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Trying OpenRouter Gemini model: ${model} (attempt ${i + 1})`);
        const response = await callOpenRouter(prompt, model);
        console.log(`✓ OpenRouter ${model} succeeded`);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`✗ OpenRouter ${model} failed: ${lastError.message}`);

        // If timeout, 404, or rate limited, skip to next model immediately
        if (lastError.message.includes("timeout") ||
            lastError.message.includes("404") || lastError.message.includes("429") ||
            lastError.message.includes("rate") || lastError.message.includes("quota") ||
            lastError.message.includes("credit")) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Failed to call OpenRouter Gemini - all models exhausted");
}

// Legacy export for backwards compatibility
export async function callOpenRouterWithRetry(prompt: string): Promise<string> {
  return callOpenRouterGeminiWithRetry(prompt);
}
