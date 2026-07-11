import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import {
  callGeminiWithRetry,
  callOpenRouterGeminiWithRetry,
} from "@/lib/ai-providers";

/**
 * Generate a step-by-step execution plan for a recommended action
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, brandName, context } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // Generate the prompt for step-by-step plan
    const prompt = `You are an AI visibility and digital marketing expert. Generate a detailed step-by-step execution plan for the following action.

## ACTION TO EXECUTE
"${action}"

## BRAND CONTEXT
Brand: ${brandName || "Not specified"}
${context ? `Additional Context: ${context}` : ""}

## REQUIREMENTS
Generate a practical, actionable step-by-step plan that:
1. Can be executed by a marketing team or business owner
2. Includes specific tools, platforms, or resources to use
3. Has clear success metrics for each step
4. Is realistic and achievable

## RESPONSE FORMAT
Respond with a JSON object in this exact format:
{
  "title": "Brief title for this plan",
  "estimatedTime": "Estimated time to complete (e.g., '2-3 days', '1 week')",
  "difficulty": "easy" | "medium" | "hard",
  "steps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed description of what to do",
      "tools": ["Tool 1", "Tool 2"],
      "tips": "Pro tips or best practices",
      "successMetric": "How to know this step is complete"
    }
  ],
  "resources": [
    {
      "name": "Resource name",
      "type": "tool" | "article" | "template" | "service",
      "description": "Brief description"
    }
  ],
  "expectedOutcome": "What results to expect after completing all steps"
}

Respond ONLY with valid JSON. No markdown code blocks.`;

    let response: string;

    // Try Google AI first, then OpenRouter
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        response = await callGeminiWithRetry(prompt);
      } catch {
        if (process.env.OPENROUTER_API_KEY) {
          response = await callOpenRouterGeminiWithRetry(prompt);
        } else {
          throw new Error("No AI providers available");
        }
      }
    } else if (process.env.OPENROUTER_API_KEY) {
      response = await callOpenRouterGeminiWithRetry(prompt);
    } else {
      throw new Error("No AI providers configured");
    }

    // Parse the response
    let plan;
    try {
      // Try to extract JSON from response
      let jsonStr = response;

      // Remove markdown code blocks if present
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Find JSON object
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }

      plan = JSON.parse(jsonStr);
    } catch {
      // Return a basic structure if parsing fails
      plan = {
        title: "Execution Plan",
        estimatedTime: "1-2 weeks",
        difficulty: "medium",
        steps: [
          {
            step: 1,
            title: "Research & Preparation",
            description: action,
            tools: [],
            tips: "Start with thorough research",
            successMetric: "Clear understanding of requirements"
          }
        ],
        resources: [],
        expectedOutcome: "Improved AI visibility for your brand"
      };
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Action plan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate plan" },
      { status: 500 }
    );
  }
}
