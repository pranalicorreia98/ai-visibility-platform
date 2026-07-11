import OpenAI from "openai";

let client: OpenAI | null = null;

// GitHub Models available models (in order of preference)
const CHATGPT_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4.1"];

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GitHub token not configured for ChatGPT API");
    }
    client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: process.env.GITHUB_TOKEN,
    });
  }
  return client;
}

export async function callChatGPT(prompt: string, model: string = "gpt-4o"): Promise<string> {
  const openai = getClient();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("ChatGPT API timeout after 60 seconds")), 60000);
  });

  const response = await Promise.race([
    openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0, // Deterministic output - same prompt = same response
    }),
    timeoutPromise
  ]);

  return response.choices[0]?.message?.content || "";
}

// ChatGPT with model fallback: gpt-4o → gpt-4o-mini → gpt-4.1
export async function callChatGPTWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  // Try each model in sequence
  for (const model of CHATGPT_MODELS) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Trying ChatGPT model: ${model} (attempt ${i + 1})`);
        return await callChatGPT(prompt, model);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`ChatGPT ${model} failed: ${lastError.message}`);

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

  throw lastError || new Error("Failed to call ChatGPT API - all models exhausted");
}
