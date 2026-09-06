// Shared "organic vs biased" classification, used everywhere brand presence
// is scored from Mention rows. A prompt that explicitly asks about the
// brand by name ("Tell me about X", "Analyze X") artificially inflates
// presence/position — the brand is trivially "found" because the question
// named it, not because the AI recalled it unprompted. Excluding these
// keeps every scoring surface (dashboard, reports) measuring the same
// thing: unprompted, organic visibility.
//
// Previously only defined in api/reports/generate/route.ts, so the report
// excluded biased prompts but api/visibility/route.ts (the dashboard) did
// not — the two could disagree sharply on a brand's score/rank whenever a
// self-referential "Visibility Analysis for X" prompt was the only data
// point on record (as with a just-onboarded brand).
export function isBiasedPrompt(prompt: string, brandName: string): boolean {
  const normalizedPrompt = prompt.toLowerCase();
  const normalizedBrand = brandName.toLowerCase();

  const biasedPatterns = [
    `visibility analysis for ${normalizedBrand}`,
    `analyze ${normalizedBrand}`,
    `tell me about ${normalizedBrand}`,
    `what is ${normalizedBrand}`,
    `competitor analysis: ${normalizedBrand}`,
    `competitor ${normalizedBrand}`,
  ];

  return biasedPatterns.some((pattern) => normalizedPrompt.includes(pattern));
}

// Simulation.promptType values that must never count toward the *organic*
// score, regardless of what the prompt text says: "competitor_comparison"
// (deliberately names the brand + competitors) and "manual_test" (a
// user-typed ad-hoc prompt run from the Prompt Lab/simulator). Both are real
// AI calls worth showing the user, but neither is a measurement of
// unprompted recall, and manual_test in particular would otherwise let a
// user game their own score by typing a leading prompt until one "hits."
// null/undefined/"organic" (the schema default) all count as organic.
export function isOrganicPromptType(promptType: string | null | undefined): boolean {
  return !promptType || promptType === "organic";
}
