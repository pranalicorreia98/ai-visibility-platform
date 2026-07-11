import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

// Correct Gemini model names (as of July 2026)
// See: https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODELS = [
  "gemini-2.5-flash",       // Latest stable flash model
  "gemini-2.5-flash-lite",  // Lighter version
  "gemini-2.5-pro",         // Pro model (may have lower rate limits)
];

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Google AI API key not configured");
    }
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
  return genAI;
}

function getModel(modelName: string): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: modelName });
}

export async function callGemini(prompt: string, modelName: string = GEMINI_MODELS[0]): Promise<string> {
  const model = getModel(modelName);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Gemini API timeout after 60 seconds (model: ${modelName})`)), 60000);
  });

  const result = await Promise.race([
    model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0, // Deterministic output - same prompt = same response
      },
    }),
    timeoutPromise
  ]);
  const response = await result.response;

  return response.text();
}

// Gemini with model fallback
export async function callGeminiWithRetry(
  prompt: string,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  // Try each model in sequence
  for (const modelName of GEMINI_MODELS) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Trying Gemini model: ${modelName} (attempt ${i + 1})`);
        const response = await callGemini(prompt, modelName);
        console.log(`✓ Gemini ${modelName} succeeded`);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`✗ Gemini ${modelName} failed: ${lastError.message}`);

        // If 404 (model not found), try next model immediately
        if (lastError.message.includes("404") || lastError.message.includes("not found")) {
          console.log(`Model ${modelName} not available, trying next model...`);
          break;
        }

        // If rate limited (429), try next model immediately (don't waste retries)
        if (lastError.message.includes("429") || lastError.message.includes("quota") || lastError.message.includes("rate")) {
          console.log(`Rate limit hit for ${modelName}, trying next model...`);
          break;
        }

        // For other errors, wait briefly then retry same model
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Failed to call Gemini API - all models exhausted");
}
