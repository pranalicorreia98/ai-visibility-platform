import OpenAI from "openai";

let client: OpenAI | null = null;

// Direct OpenAI API - fallback when OpenRouter credits are exhausted
// Uses API key shared with ClikHire
const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export async function callOpenAIDirect(
  prompt: string,
  model: string = "gpt-4o",
  maxTokens: number = 4096
): Promise<string> {
  const openai = getClient();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`OpenAI Direct API timeout after 60 seconds (model: ${model})`)), 60000);
  });

  console.log(`OpenAI Direct: Calling ${model}`);

  const response = await Promise.race([
    openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
    }),
    timeoutPromise,
  ]);

  console.log(`✓ OpenAI Direct ${model} succeeded`);
  return response.choices[0]?.message?.content || "";
}

export async function callOpenAIDirectWithRetry(
  prompt: string,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (const model of OPENAI_MODELS) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Trying OpenAI Direct model: ${model} (attempt ${i + 1})`);
        return await callOpenAIDirect(prompt, model);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`OpenAI Direct ${model} failed: ${lastError.message}`);

        // If rate limited (429), wait before retry
        if (lastError.message.includes("429") || lastError.message.includes("rate")) {
          console.log(`Rate limit hit, waiting before retry...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
          continue;
        }

        // If quota exceeded, don't retry same model
        if (lastError.message.includes("quota") || lastError.message.includes("insufficient")) {
          console.log(`Quota exceeded for ${model}, trying next model...`);
          break;
        }

        // For other errors, wait briefly then retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    console.log(`All retries failed for ${model}, trying next model...`);
  }

  throw lastError || new Error("Failed to call OpenAI Direct API - all models exhausted");
}

/**
 * Check if OpenAI Direct API key is configured
 */
export function isOpenAIDirectConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
