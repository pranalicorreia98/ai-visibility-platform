// Real citation extraction from AI response text — URLs and known platform
// names actually present in a response, as opposed to a static "opportunities"
// checklist that guesses at a brand's presence on third-party sites we never
// crawl. Shared by the report generator and the citation tracker page so
// both surfaces report the exact same measured citations.

export interface ExtractedCitation {
  source: string;
  type: string;
  url?: string;
}

const KNOWN_PLATFORMS: Array<{ name: string; type: string }> = [
  { name: "G2", type: "review_site" },
  { name: "Capterra", type: "review_site" },
  { name: "TrustRadius", type: "review_site" },
  { name: "Trustpilot", type: "review_site" },
  { name: "Product Hunt", type: "review_site" },
  { name: "LinkedIn", type: "social" },
  { name: "Twitter", type: "social" },
  { name: "Crunchbase", type: "industry_report" },
  { name: "Gartner", type: "industry_report" },
  { name: "Forrester", type: "industry_report" },
  { name: "Wikipedia", type: "official" },
];

export function extractCitationsFromResponse(response: string): ExtractedCitation[] {
  const citations: ExtractedCitation[] = [];

  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const urls = response.match(urlRegex) || [];

  for (const url of urls) {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      let type = "web";
      if (hostname.includes("g2") || hostname.includes("capterra") || hostname.includes("trustradius") || hostname.includes("trustpilot")) {
        type = "review_site";
      } else if (hostname.includes("linkedin") || hostname.includes("twitter") || hostname.includes("facebook")) {
        type = "social";
      } else if (hostname.includes("forbes") || hostname.includes("techcrunch") || hostname.includes("news")) {
        type = "news";
      }

      if (!citations.find((c) => c.url === url)) {
        citations.push({ source: hostname, type, url });
      }
    } catch {
      // Invalid URL, skip
    }
  }

  for (const platform of KNOWN_PLATFORMS) {
    if (response.toLowerCase().includes(platform.name.toLowerCase())) {
      if (!citations.find((c) => c.source === platform.name)) {
        citations.push({ source: platform.name, type: platform.type });
      }
    }
  }

  return citations;
}

export interface CitationWithContext extends ExtractedCitation {
  aiSystem: string;
  date: string;
  prompt: string;
}

interface SimulationLike {
  prompt: string;
  createdAt: Date;
  chatgptResponse?: string | null;
  geminiResponse?: string | null;
  perplexityResponse?: string | null;
}

/**
 * Extracts citations across a set of real simulation responses, keeping
 * which platform/prompt/date each one came from so the UI can show real
 * provenance instead of a bare source name.
 */
export function extractCitationsFromSimulations(simulations: SimulationLike[]): CitationWithContext[] {
  const results: CitationWithContext[] = [];

  for (const sim of simulations) {
    const responses: Array<{ aiSystem: string; text: string | null | undefined }> = [
      { aiSystem: "chatgpt", text: sim.chatgptResponse },
      { aiSystem: "gemini", text: sim.geminiResponse },
      { aiSystem: "perplexity", text: sim.perplexityResponse },
    ];

    for (const r of responses) {
      if (!r.text) continue;
      const citations = extractCitationsFromResponse(r.text);
      for (const c of citations) {
        if (!results.find((existing) => existing.source === c.source && existing.url === c.url)) {
          results.push({ ...c, aiSystem: r.aiSystem, date: sim.createdAt.toISOString(), prompt: sim.prompt });
        }
      }
    }
  }

  return results;
}
