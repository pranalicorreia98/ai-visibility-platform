// Test script to verify API keys are working
// Run with: node test-apis.js

require('dotenv').config();

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

console.log("=== API Key Test Script ===\n");

// Check if keys exist
console.log("1. Checking API keys presence:");
console.log(`   GOOGLE_AI_API_KEY: ${GOOGLE_AI_API_KEY ? `✓ Found (starts with ${GOOGLE_AI_API_KEY.substring(0, 5)}...)` : "✗ Missing"}`);
console.log(`   GITHUB_TOKEN: ${GITHUB_TOKEN ? `✓ Found (starts with ${GITHUB_TOKEN.substring(0, 5)}...)` : "✗ Missing"}`);
console.log(`   GROQ_API_KEY: ${GROQ_API_KEY ? `✓ Found (starts with ${GROQ_API_KEY.substring(0, 5)}...)` : "✗ Missing (fallback disabled)"}`);
console.log("");

// Test Gemini API
async function testGemini() {
  console.log("2. Testing Gemini API...");

  if (!GOOGLE_AI_API_KEY) {
    console.log("   ✗ Skipped - No API key");
    return false;
  }

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("   Sending test prompt...");
    const result = await model.generateContent("Say 'Hello' in one word");
    const response = await result.response;
    const text = response.text();

    console.log(`   ✓ Gemini Response: "${text.trim().substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.log(`   ✗ Gemini Error: ${error.message}`);
    return false;
  }
}

// Test ChatGPT API (via GitHub Models)
async function testChatGPT() {
  console.log("\n3. Testing ChatGPT API (GitHub Models)...");

  if (!GITHUB_TOKEN) {
    console.log("   ✗ Skipped - No GitHub token");
    return false;
  }

  try {
    const OpenAI = require("openai").default;
    const client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: GITHUB_TOKEN,
    });

    console.log("   Sending test prompt...");
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Say 'Hello' in one word" }],
      max_tokens: 50,
    });

    const text = response.choices[0]?.message?.content || "";
    console.log(`   ✓ ChatGPT Response: "${text.trim().substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.log(`   ✗ ChatGPT Error: ${error.message}`);
    return false;
  }
}

// Test Groq API (fallback)
async function testGroq() {
  console.log("\n4. Testing Groq API (Gemini fallback)...");

  if (!GROQ_API_KEY) {
    console.log("   ⚠ Skipped - No Groq API key (fallback disabled)");
    return null;
  }

  try {
    const Groq = require("groq-sdk").default;
    const client = new Groq({
      apiKey: GROQ_API_KEY,
    });

    console.log("   Sending test prompt...");
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Say 'Hello' in one word" }],
      max_tokens: 50,
    });

    const text = response.choices[0]?.message?.content || "";
    console.log(`   ✓ Groq Response: "${text.trim().substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.log(`   ✗ Groq Error: ${error.message}`);
    return false;
  }
}

// Run tests
async function runTests() {
  const geminiResult = await testGemini();
  const chatgptResult = await testChatGPT();
  const groqResult = await testGroq();

  console.log("\n=== Summary ===");
  console.log(`Gemini: ${geminiResult ? "✓ Working" : "✗ Failed"}`);
  console.log(`ChatGPT: ${chatgptResult ? "✓ Working" : "✗ Failed"}`);
  console.log(`Groq (fallback): ${groqResult === null ? "⚠ Not configured" : groqResult ? "✓ Working" : "✗ Failed"}`);

  if (chatgptResult && (geminiResult || groqResult)) {
    console.log("\n✓ Simulation should work! (ChatGPT + Gemini/Groq)");
  } else if (chatgptResult) {
    console.log("\n⚠ Only ChatGPT working. Add GROQ_API_KEY for Gemini fallback.");
  } else {
    console.log("\n✗ APIs not configured properly. Check errors above.");
  }
}

runTests();
