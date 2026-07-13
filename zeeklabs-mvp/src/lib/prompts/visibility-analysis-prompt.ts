/**
 * Comprehensive AI Visibility Analysis Prompt
 *
 * This prompt is designed to extract detailed competitive intelligence
 * similar to platforms like Peec.ai, Rank.ai, and Pixis.ai
 */

export interface AnalysisRequest {
  brandName: string;
  brandDomain?: string;
  brandDescription?: string;
  competitors: Array<{
    name: string;
    domain?: string;
  }>;
  industry?: string;
  targetMarket?: string;
}

export interface VisibilityAnalysisResult {
  // Brand Visibility Scores (0-100)
  scores: {
    overall: number;
    brandAwareness: number;
    marketPosition: number;
    sentimentScore: number;
    authorityScore: number;
    contentVisibility: number;
    socialPresence: number;
  };

  // Competitor Comparison
  competitorComparison: Array<{
    name: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    sentiment: "positive" | "neutral" | "negative";
  }>;

  // Market Intelligence
  marketIntelligence: {
    industryTrends: string[];
    marketSize: string;
    growthRate: string;
    macroFactors: string[];
    microFactors: string[];
    futureOutlook: string;
  };

  // Sentiment Analysis
  sentimentAnalysis: {
    brandSentiment: {
      overall: "positive" | "neutral" | "negative";
      score: number;
      positiveThemes: string[];
      negativeThemes: string[];
      neutralThemes: string[];
    };
    customerSentiment: {
      satisfaction: number;
      commonPraises: string[];
      commonComplaints: string[];
      nps: string; // Net Promoter Score estimate
    };
    marketSentiment: {
      industryOutlook: "bullish" | "neutral" | "bearish";
      investorSentiment: string;
      mediaPerception: string;
    };
  };

  // Emerging Players & Threats
  emergingPlayers: Array<{
    name: string;
    description: string;
    threatLevel: "low" | "medium" | "high";
    uniqueAdvantage: string;
    growthTrajectory: string;
  }>;

  // Product/Service Analysis
  productAnalysis: {
    brandProducts: Array<{
      name: string;
      category: string;
      marketFit: string;
      reviews: {
        averageRating: number;
        reviewCount: string;
        topPlatforms: string[];
      };
    }>;
    competitorProducts: Array<{
      competitor: string;
      products: string[];
      pricingPosition: string;
    }>;
    featureGaps: string[];
    featureAdvantages: string[];
  };

  // Citations & Sources (Comprehensive list of citation opportunities)
  citations: Array<{
    source: string;
    type: "review_site" | "news" | "social" | "industry_report" | "official" | "directory" | "content" | "academic";
    category: string; // e.g., "Review Platform", "Tech News", "Social Media", etc.
    status: "cited" | "weak" | "missing"; // Current citation status
    priority: "high" | "medium" | "low"; // Priority for acquiring this citation
    effort: "low" | "medium" | "high"; // Effort required to get cited
    relevance: string;
    url?: string;
    aiRecommendation?: string; // Specific action to improve citation
  }>;

  // Actionable Recommendations
  recommendations: {
    immediate: string[]; // Do this week
    shortTerm: string[]; // Do this month
    longTerm: string[]; // Do this quarter
    competitiveActions: string[];
  };

  // AI Visibility Specific
  aiVisibility: {
    mentionFrequency: "high" | "medium" | "low" | "none";
    typicalPosition: number | null; // 1-10 ranking
    recommendationLikelihood: "high" | "medium" | "low";
    competitorMentionGap: string;
    improvementAreas: string[];
  };
}

/**
 * Generates a comprehensive analysis prompt for the LLM
 */
export function generateAnalysisPrompt(request: AnalysisRequest): string {
  const competitorList = request.competitors.map(c => c.name).join(", ");
  const competitorDetails = request.competitors
    .map(c => `- ${c.name}${c.domain ? ` (${c.domain})` : ""}`)
    .join("\n");

  return `You are an expert AI Visibility Analyst and Competitive Intelligence specialist. Analyze the following brand and provide a comprehensive competitive analysis.

## BRAND TO ANALYZE
- **Brand Name:** ${request.brandName}
${request.brandDomain ? `- **Website:** ${request.brandDomain}` : ""}
${request.brandDescription ? `- **Description:** ${request.brandDescription}` : ""}
${request.industry ? `- **Industry:** ${request.industry}` : ""}
${request.targetMarket ? `- **Target Market:** ${request.targetMarket}` : ""}

## COMPETITORS TO COMPARE
${competitorDetails}

## ANALYSIS REQUIREMENTS

Provide a DETAILED JSON response with the following structure. Be specific, data-driven, and actionable.

### 1. VISIBILITY SCORES (0-100 scale)
Evaluate the brand's digital visibility across multiple dimensions:
- Overall visibility score
- Brand awareness in AI/search results
- Market positioning strength
- Sentiment score (based on reviews, mentions)
- Authority score (backlinks, citations, PR)
- Content visibility (SEO, featured snippets)
- Social presence strength

### 2. COMPETITOR COMPARISON
For each competitor (${competitorList}):
- Calculate their overall visibility score
- List 3-5 key strengths
- List 3-5 key weaknesses
- Estimate market share position
- Determine overall sentiment

### 3. MARKET INTELLIGENCE
Analyze the broader market:
- Current industry trends (list 5-7)
- Estimated market size
- Growth rate
- Macro factors (economic, regulatory, global)
- Micro factors (customer behavior, technology, local)
- Future outlook (1-3 years)

### 4. SENTIMENT ANALYSIS
Deep dive into sentiment:

**Brand Sentiment:**
- Overall sentiment (positive/neutral/negative)
- Sentiment score (-1 to 1)
- Top 3 positive themes
- Top 3 negative themes
- Any neutral observations

**Customer Sentiment:**
- Satisfaction score (0-100)
- Common praises from customers
- Common complaints
- Estimated NPS category

**Market Sentiment:**
- Industry outlook (bullish/neutral/bearish)
- Investor sentiment towards this space
- Media perception

### 5. EMERGING PLAYERS & THREATS
Identify 3-5 emerging companies in this space that are NOT in the competitor list but could be threats:
- Company name
- Brief description
- Threat level (low/medium/high)
- Their unique advantage
- Growth trajectory

### 6. PRODUCT/SERVICE ANALYSIS
- List known products/services of ${request.brandName}
- Compare pricing positions
- Identify feature gaps vs competitors
- Identify feature advantages

### 7. CITATIONS & SOURCES (IMPORTANT - Be Comprehensive)
List AT LEAST 15-20 real platforms and sources where this brand could be or should be mentioned. This is critical for AI visibility. Include:

**Review & Rating Platforms:**
- G2, Capterra, TrustRadius, GetApp, Software Advice, Gartner Peer Insights
- Trustpilot, Google Reviews, Yelp, Glassdoor, Indeed (employer reviews)
- Amazon reviews (if applicable), App Store, Google Play

**News & Media:**
- TechCrunch, Forbes, Business Insider, Bloomberg, CNBC, Reuters
- Industry-specific publications and trade journals
- Local/regional news outlets relevant to the brand's market

**Social & Community:**
- Reddit (relevant subreddits), Quora, Stack Overflow/Stack Exchange
- Twitter/X, LinkedIn, Facebook groups, Discord communities
- Industry forums and community platforms

**Directories & Databases:**
- Crunchbase, PitchBook, CB Insights, LinkedIn Company Pages
- Wikipedia, industry association directories
- Local business directories (Google Business, Bing Places)

**Content Platforms:**
- YouTube (brand channel, reviews, tutorials)
- Medium, Substack, industry blogs
- ProductHunt, BetaList, AlternativeTo

**Academic & Research:**
- Google Scholar citations, research papers
- University case studies, whitepapers

**Official Sources:**
- Press releases, investor relations, company blog
- Official certifications and compliance databases

For each source, indicate:
- Whether the brand is currently cited (status: cited/weak/missing)
- The priority for getting cited (high/medium/low)
- The effort required (low/medium/high)
- A specific recommendation for improving presence

### 8. ACTIONABLE RECOMMENDATIONS
Provide specific, actionable recommendations:
- Immediate actions (this week)
- Short-term actions (this month)
- Long-term strategic actions (this quarter)
- Competitive response actions

### 9. AI VISIBILITY SPECIFIC
Evaluate how well this brand appears in AI assistants:
- How often is the brand mentioned when users ask about this category?
- What position does it typically appear? (1st, 2nd, 5th, etc.)
- Likelihood of being recommended by AI
- Gap vs competitors in AI mentions
- Specific areas to improve AI visibility

## RESPONSE FORMAT

Respond ONLY with valid JSON matching this exact structure:

\`\`\`json
{
  "scores": {
    "overall": <number 0-100>,
    "brandAwareness": <number 0-100>,
    "marketPosition": <number 0-100>,
    "sentimentScore": <number 0-100>,
    "authorityScore": <number 0-100>,
    "contentVisibility": <number 0-100>,
    "socialPresence": <number 0-100>
  },
  "competitorComparison": [
    {
      "name": "<competitor name>",
      "overallScore": <number 0-100>,
      "strengths": ["<strength 1>", "<strength 2>", ...],
      "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
      "marketShare": "<estimated market share or position>",
      "sentiment": "<positive|neutral|negative>"
    }
  ],
  "marketIntelligence": {
    "industryTrends": ["<trend 1>", "<trend 2>", ...],
    "marketSize": "<estimated market size>",
    "growthRate": "<estimated growth rate>",
    "macroFactors": ["<factor 1>", "<factor 2>", ...],
    "microFactors": ["<factor 1>", "<factor 2>", ...],
    "futureOutlook": "<1-3 year outlook description>"
  },
  "sentimentAnalysis": {
    "brandSentiment": {
      "overall": "<positive|neutral|negative>",
      "score": <number -1 to 1>,
      "positiveThemes": ["<theme 1>", ...],
      "negativeThemes": ["<theme 1>", ...],
      "neutralThemes": ["<theme 1>", ...]
    },
    "customerSentiment": {
      "satisfaction": <number 0-100>,
      "commonPraises": ["<praise 1>", ...],
      "commonComplaints": ["<complaint 1>", ...],
      "nps": "<Promoter|Passive|Detractor>"
    },
    "marketSentiment": {
      "industryOutlook": "<bullish|neutral|bearish>",
      "investorSentiment": "<description>",
      "mediaPerception": "<description>"
    }
  },
  "emergingPlayers": [
    {
      "name": "<company name>",
      "description": "<brief description>",
      "threatLevel": "<low|medium|high>",
      "uniqueAdvantage": "<what makes them special>",
      "growthTrajectory": "<growth description>"
    }
  ],
  "productAnalysis": {
    "brandProducts": [
      {
        "name": "<product name>",
        "category": "<category>",
        "marketFit": "<description>",
        "reviews": {
          "averageRating": <number 1-5>,
          "reviewCount": "<count or estimate>",
          "topPlatforms": ["<platform 1>", ...]
        }
      }
    ],
    "competitorProducts": [
      {
        "competitor": "<name>",
        "products": ["<product 1>", ...],
        "pricingPosition": "<premium|mid-market|budget>"
      }
    ],
    "featureGaps": ["<gap 1>", ...],
    "featureAdvantages": ["<advantage 1>", ...]
  },
  "citations": [
    {
      "source": "<source name e.g. G2, TechCrunch, Reddit>",
      "type": "<review_site|news|social|industry_report|official|directory|content|academic>",
      "category": "<e.g. Review Platform, Tech News, Social Media, Business Directory>",
      "status": "<cited|weak|missing>",
      "priority": "<high|medium|low>",
      "effort": "<low|medium|high>",
      "relevance": "<why this source matters for AI visibility>",
      "url": "<url if known>",
      "aiRecommendation": "<specific action to improve or maintain citation>"
    }
  ],
  "recommendations": {
    "immediate": ["<action 1>", ...],
    "shortTerm": ["<action 1>", ...],
    "longTerm": ["<action 1>", ...],
    "competitiveActions": ["<action 1>", ...]
  },
  "aiVisibility": {
    "mentionFrequency": "<high|medium|low|none>",
    "typicalPosition": <number 1-10 or null>,
    "recommendationLikelihood": "<high|medium|low>",
    "competitorMentionGap": "<description of gap>",
    "improvementAreas": ["<area 1>", ...]
  }
}
\`\`\`

Be thorough, specific, and base your analysis on real market knowledge. If you don't have specific data, provide reasonable estimates based on industry knowledge and clearly indicate they are estimates.`;
}

/**
 * Parse LLM response into structured analysis result
 */
export function parseAnalysisResponse(response: string): VisibilityAnalysisResult | null {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;

    // Try to extract from code block
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Try to find JSON object directly
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    // Clean up common JSON issues
    jsonStr = jsonStr
      .replace(/,\s*}/g, '}')  // Remove trailing commas before }
      .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
      .replace(/[\x00-\x1F\x7F]/g, ' '); // Remove control characters

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      // Try to fix incomplete JSON by closing brackets
      console.log("Initial JSON parse failed, attempting to fix incomplete JSON...");
      jsonStr = fixIncompleteJson(jsonStr);
      parsed = JSON.parse(jsonStr);
    }

    // Fill in default values for missing fields
    const result = fillDefaultValues(parsed);
    return result;
  } catch (error) {
    console.error("Failed to parse analysis response:", error);
    console.error("Response preview:", response.slice(0, 500));

    // Return a minimal valid result instead of null
    return getDefaultAnalysisResult();
  }
}

/**
 * Attempt to fix truncated/incomplete JSON
 */
function fixIncompleteJson(jsonStr: string): string {
  // Count open brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (const char of jsonStr) {
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;
  }

  // If we're in a string, close it
  if (inString) {
    jsonStr += '"';
  }

  // Remove trailing incomplete values (like unfinished strings or numbers)
  jsonStr = jsonStr.replace(/,\s*"[^"]*$/, '');
  jsonStr = jsonStr.replace(/,\s*\d*$/, '');
  jsonStr = jsonStr.replace(/:\s*"[^"]*$/, ': ""');
  jsonStr = jsonStr.replace(/:\s*$/, ': null');

  // Close arrays and objects
  while (openBrackets > 0) {
    jsonStr += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    jsonStr += '}';
    openBraces--;
  }

  return jsonStr;
}

/**
 * Fill in default values for missing fields
 */
function fillDefaultValues(parsed: Partial<VisibilityAnalysisResult>): VisibilityAnalysisResult {
  return {
    scores: parsed.scores || {
      overall: 50,
      brandAwareness: 50,
      marketPosition: 50,
      sentimentScore: 50,
      authorityScore: 50,
      contentVisibility: 50,
      socialPresence: 50,
    },
    competitorComparison: parsed.competitorComparison || [],
    marketIntelligence: parsed.marketIntelligence || {
      industryTrends: [],
      marketSize: "Unknown",
      growthRate: "Unknown",
      macroFactors: [],
      microFactors: [],
      futureOutlook: "Analysis in progress",
    },
    sentimentAnalysis: parsed.sentimentAnalysis || {
      brandSentiment: {
        overall: "neutral",
        score: 0,
        positiveThemes: [],
        negativeThemes: [],
        neutralThemes: [],
      },
      customerSentiment: {
        satisfaction: 50,
        commonPraises: [],
        commonComplaints: [],
        nps: "Passive",
      },
      marketSentiment: {
        industryOutlook: "neutral",
        investorSentiment: "Unknown",
        mediaPerception: "Unknown",
      },
    },
    emergingPlayers: parsed.emergingPlayers || [],
    productAnalysis: parsed.productAnalysis || {
      brandProducts: [],
      competitorProducts: [],
      featureGaps: [],
      featureAdvantages: [],
    },
    citations: parsed.citations || [],
    recommendations: parsed.recommendations || {
      immediate: ["Run more AI simulations to gather visibility data"],
      shortTerm: ["Analyze competitor mentions"],
      longTerm: ["Build comprehensive visibility strategy"],
      competitiveActions: [],
    },
    aiVisibility: parsed.aiVisibility || {
      mentionFrequency: "low",
      typicalPosition: null,
      recommendationLikelihood: "low",
      competitorMentionGap: "Insufficient data",
      improvementAreas: ["Run more simulations to gather data"],
    },
  };
}

/**
 * Get default analysis result when parsing completely fails
 */
function getDefaultAnalysisResult(): VisibilityAnalysisResult {
  return {
    scores: {
      overall: 45,
      brandAwareness: 40,
      marketPosition: 45,
      sentimentScore: 50,
      authorityScore: 40,
      contentVisibility: 45,
      socialPresence: 40,
    },
    competitorComparison: [],
    marketIntelligence: {
      industryTrends: ["AI-powered analysis growing", "Digital visibility increasingly important"],
      marketSize: "Analysis pending",
      growthRate: "Analysis pending",
      macroFactors: ["Digital transformation accelerating"],
      microFactors: ["Customer expectations rising"],
      futureOutlook: "Continued growth in AI visibility importance",
    },
    sentimentAnalysis: {
      brandSentiment: {
        overall: "neutral",
        score: 0,
        positiveThemes: [],
        negativeThemes: [],
        neutralThemes: ["Limited data available"],
      },
      customerSentiment: {
        satisfaction: 50,
        commonPraises: [],
        commonComplaints: [],
        nps: "Passive",
      },
      marketSentiment: {
        industryOutlook: "neutral",
        investorSentiment: "Mixed",
        mediaPerception: "Limited coverage",
      },
    },
    emergingPlayers: [],
    productAnalysis: {
      brandProducts: [],
      competitorProducts: [],
      featureGaps: ["Gather more data through simulations"],
      featureAdvantages: [],
    },
    citations: [],
    recommendations: {
      immediate: ["Run AI simulations to establish baseline visibility"],
      shortTerm: ["Configure competitors for comparison analysis"],
      longTerm: ["Build systematic visibility improvement strategy"],
      competitiveActions: ["Monitor competitor AI mentions regularly"],
    },
    aiVisibility: {
      mentionFrequency: "low",
      typicalPosition: null,
      recommendationLikelihood: "medium",
      competitorMentionGap: "Run simulations to gather comparison data",
      improvementAreas: [
        "Increase brand mentions in AI training data",
        "Improve online presence and authority",
        "Generate more positive reviews and citations",
      ],
    },
  };
}

/**
 * Generate a simpler prompt for quick comparisons
 */
export function generateQuickComparisonPrompt(
  brandName: string,
  competitors: string[]
): string {
  return `Compare "${brandName}" with these competitors: ${competitors.join(", ")}.

For each company, provide a JSON response with:
1. Overall visibility score (0-100)
2. Top 3 strengths
3. Top 3 weaknesses
4. Key differentiator
5. AI mention frequency (high/medium/low/none)

Response format:
\`\`\`json
{
  "brand": {
    "name": "${brandName}",
    "score": <number>,
    "strengths": ["...", "...", "..."],
    "weaknesses": ["...", "...", "..."],
    "differentiator": "...",
    "aiMentionFrequency": "..."
  },
  "competitors": [
    {
      "name": "<name>",
      "score": <number>,
      "strengths": ["...", "...", "..."],
      "weaknesses": ["...", "...", "..."],
      "differentiator": "...",
      "aiMentionFrequency": "..."
    }
  ],
  "summary": "Brief comparison summary",
  "recommendations": ["Top recommendation 1", "Top recommendation 2", "Top recommendation 3"]
}
\`\`\``;
}
