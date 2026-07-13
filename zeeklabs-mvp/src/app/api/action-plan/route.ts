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

    // Extract detailed context
    const {
      industry,
      domain,
      competitors,
      currentScore,
      platformScores,
      sentiment,
      weaknesses,
    } = context || {};

    // Build competitor context string
    const competitorContext = competitors?.length
      ? `Key Competitors: ${competitors.map((c: { name: string }) => c.name).join(", ")}`
      : "";

    // Build platform performance context
    const platformContext = platformScores
      ? `Platform Performance:
   - ChatGPT Score: ${platformScores.chatgpt || 0}/100
   - Gemini Score: ${platformScores.gemini || 0}/100
   - Perplexity Score: ${platformScores.perplexity || 0}/100`
      : "";

    // Build sentiment context
    const sentimentContext = sentiment
      ? `Sentiment Analysis:
   - Positive: ${sentiment.positive || 0}%
   - Neutral: ${sentiment.neutral || 0}%
   - Negative: ${sentiment.negative || 0}%`
      : "";

    // Build weaknesses context
    const weaknessContext = weaknesses?.length
      ? `Known Weaknesses: ${weaknesses.join("; ")}`
      : "";

    // Generate the prompt for step-by-step plan
    const prompt = `You are an expert AI visibility consultant and digital marketing strategist. Generate a HIGHLY SPECIFIC and ACTIONABLE step-by-step execution plan tailored specifically for this brand.

## ACTION TO EXECUTE
"${action}"

## BRAND DETAILS
Brand Name: ${brandName || "Not specified"}
${domain ? `Website: ${domain}` : ""}
${industry ? `Industry: ${industry}` : ""}
${competitorContext}

## CURRENT AI VISIBILITY STATUS
${currentScore !== undefined ? `Overall AI Visibility Score: ${currentScore}/100` : ""}
${platformContext}
${sentimentContext}
${weaknessContext}

## CRITICAL REQUIREMENTS
You MUST generate a plan that is:
1. **SPECIFIC TO ${brandName?.toUpperCase() || "THIS BRAND"}** - Reference the brand by name in steps. Include specific examples relevant to their industry.
2. **IMMEDIATELY ACTIONABLE** - Each step should be something they can do TODAY with exact instructions.
3. **CONCRETE WITH EXAMPLES** - Provide actual sample content, templates, or scripts they can use/adapt.
4. **TOOL-SPECIFIC** - Name exact tools/platforms with step-by-step usage instructions.
5. **MEASURABLE** - Include specific metrics and KPIs to track progress.

## RESPONSE FORMAT
Respond with a JSON object in this exact format:
{
  "title": "Brief title for this plan (include brand name)",
  "estimatedTime": "Estimated time to complete (e.g., '2-3 days', '1 week')",
  "difficulty": "easy" | "medium" | "hard",
  "steps": [
    {
      "step": 1,
      "title": "Step title (be specific)",
      "description": "DETAILED description with SPECIFIC instructions for ${brandName || "the brand"}. Include actual examples, sample content, or templates they can use. Reference their industry and competitors where relevant.",
      "tools": ["Specific Tool 1 with version/link", "Specific Tool 2"],
      "tips": "Pro tips specific to ${brandName || "this brand"}'s situation and industry",
      "successMetric": "Specific, measurable outcome (e.g., 'Published 3 blog posts optimized for AI citations' not 'Content created')"
    }
  ],
  "resources": [
    {
      "name": "Resource name",
      "type": "tool" | "article" | "template" | "service",
      "description": "How this specifically helps ${brandName || "the brand"}"
    }
  ],
  "expectedOutcome": "Specific, measurable results ${brandName || "the brand"} should expect (include realistic metrics)"
}

## CRITICAL FORMATTING RULES
- DO NOT use any markdown formatting like **bold**, *italics*, or ### headers in text content
- DO NOT use numbered lists like "1. " "2. " inside description text - write in natural flowing paragraphs
- Use plain text only - the UI will handle all formatting and styling
- Keep descriptions as clear flowing paragraphs, not bulleted or numbered lists
- Use commas and semicolons to separate items instead of bullet points
- Example of WRONG format: "**Step 1:** Do this. **Step 2:** Do that."
- Example of CORRECT format: "First, do this specific action. Then, proceed to do that next action."

Remember: Generic advice is NOT helpful. Every step must be customized for ${brandName || "this specific brand"}'s situation.

Respond ONLY with valid JSON. No markdown code blocks. No markdown formatting in any text fields.`;

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

    // Helper function to clean markdown from text
    const cleanMarkdown = (text: string): string => {
      if (!text) return text;
      return text
        // Remove bold markdown **text** or __text__
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        // Remove italic markdown *text* or _text_
        .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
        .replace(/(?<!_)_([^_]+)_(?!_)/g, '$1')
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove inline code backticks
        .replace(/`([^`]+)`/g, '$1')
        // Clean up numbered list patterns at start "1. **Title:**" -> "Title:"
        .replace(/^\d+\.\s*\*\*([^*]+)\*\*:?\s*/gm, '$1: ')
        // Clean up bullet points
        .replace(/^[\-\*]\s+/gm, '')
        // Clean up multiple spaces
        .replace(/\s{2,}/g, ' ')
        .trim();
    };

    // Clean all text fields in the plan
    const cleanPlanText = (plan: Record<string, unknown>): Record<string, unknown> => {
      if (plan.title) plan.title = cleanMarkdown(plan.title as string);
      if (plan.expectedOutcome) plan.expectedOutcome = cleanMarkdown(plan.expectedOutcome as string);

      if (Array.isArray(plan.steps)) {
        plan.steps = plan.steps.map((step: Record<string, unknown>) => ({
          ...step,
          title: cleanMarkdown(step.title as string || ''),
          description: cleanMarkdown(step.description as string || ''),
          tips: cleanMarkdown(step.tips as string || ''),
          successMetric: cleanMarkdown(step.successMetric as string || ''),
        }));
      }

      if (Array.isArray(plan.resources)) {
        plan.resources = plan.resources.map((resource: Record<string, unknown>) => ({
          ...resource,
          name: cleanMarkdown(resource.name as string || ''),
          description: cleanMarkdown(resource.description as string || ''),
        }));
      }

      return plan;
    };

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

      // Clean any markdown formatting from the plan
      plan = cleanPlanText(plan);
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
