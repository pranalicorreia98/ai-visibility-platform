import OpenAI from "openai";

let client: OpenAI | null = null;

// Perplexity available models (in order of preference)
const PERPLEXITY_MODELS = [
  "llama-3.1-sonar-large-128k-online",
  "llama-3.1-sonar-small-128k-online",
  "llama-3.1-sonar-huge-128k-online",
];

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error("Perplexity API key not configured");
    }
    // Perplexity uses OpenAI-compatible API
    client = new OpenAI({
      baseURL: "https://api.perplexity.ai",
      apiKey: process.env.PERPLEXITY_API_KEY,
    });
  }
  return client;
}

export async function callPerplexity(
  prompt: string,
  model: string = "llama-3.1-sonar-large-128k-online"
): Promise<string> {
  const openai = getClient();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Perplexity API timeout after 60 seconds")), 60000);
  });

  const response = await Promise.race([
    openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0, // Deterministic output
    }),
    timeoutPromise,
  ]);

  return response.choices[0]?.message?.content || "";
}

// Perplexity with model fallback
export async function callPerplexityWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  // Try each model in sequence
  for (const model of PERPLEXITY_MODELS) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Trying Perplexity model: ${model} (attempt ${i + 1})`);
        return await callPerplexity(prompt, model);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Perplexity ${model} failed: ${lastError.message}`);

        // If rate limited, wait before retry
        if (lastError.message.includes("429") || lastError.message.includes("rate")) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
        } else {
          // For non-rate-limit errors, try next model immediately
          break;
        }
      }
    }
    console.log(`All retries failed for ${model}, trying next model...`);
  }

  throw lastError || new Error("Failed to call Perplexity API - all models exhausted");
}
