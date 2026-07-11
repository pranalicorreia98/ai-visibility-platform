export interface RecommendationTemplate {
  category: "entity" | "content" | "authority" | "technical" | "community";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  effort: string;
  timeline: string;
  expectedImpact: string;
  condition: (context: RecommendationContext) => boolean;
  actionUrl?: string;
  guideUrl?: string;
}

export interface RecommendationContext {
  visibilityScore: number;
  chatgptScore: number;
  geminiScore: number;
  totalMentions: number;
  avgSentiment: number;
  hasG2Profile: boolean;
  hasLinkedIn: boolean;
  hasCrunchbase: boolean;
  hasGoogleBusiness: boolean;
  hasFAQ: boolean;
  competitorCount: number;
  avgCompetitorScore: number;
}

export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  // HIGH PRIORITY - Entity Presence
  {
    category: "entity",
    priority: "high",
    title: "Claim your G2 profile",
    description: "G2 is one of the most cited software review platforms by AI systems. Having a presence here significantly increases your chances of being mentioned in AI responses about your industry.",
    effort: "2 hours",
    timeline: "2-3 weeks for results",
    expectedImpact: "+5-8% visibility",
    condition: (ctx) => ctx.visibilityScore < 90,
    actionUrl: "https://www.g2.com/products/new",
  },
  {
    category: "entity",
    priority: "high",
    title: "Complete LinkedIn Company Page",
    description: "LinkedIn profiles are frequently referenced by AI systems when providing company information. Ensure your About section is complete with key product details, achievements, and industry keywords.",
    effort: "1-2 hours",
    timeline: "1-2 weeks for indexing",
    expectedImpact: "+3-5% visibility",
    condition: (ctx) => ctx.visibilityScore < 85,
    actionUrl: "https://www.linkedin.com/company/setup/new/",
  },
  {
    category: "entity",
    priority: "high",
    title: "Create Crunchbase profile",
    description: "Crunchbase is a key data source for AI systems when answering business and startup queries. A complete profile helps establish your entity in AI knowledge graphs.",
    effort: "1 hour",
    timeline: "1-2 weeks for indexing",
    expectedImpact: "+4-6% visibility",
    condition: (ctx) => ctx.visibilityScore < 80,
    actionUrl: "https://www.crunchbase.com/add-new",
  },
  {
    category: "entity",
    priority: "high",
    title: "Set up Google Business Profile",
    description: "Google Business profiles are heavily weighted by AI systems for local and service queries. Verify and complete your profile with accurate business information.",
    effort: "30 minutes",
    timeline: "1-2 weeks",
    expectedImpact: "+3-5% visibility",
    condition: (ctx) => ctx.visibilityScore < 85,
    actionUrl: "https://business.google.com/create",
  },

  // HIGH PRIORITY - Content
  {
    category: "content",
    priority: "high",
    title: "Add FAQ section to your website",
    description: "FAQ content is 30% more likely to be cited by AI systems. Add 10-15 common questions with direct, concise answers. Structure them with proper schema markup for maximum visibility.",
    effort: "4-6 hours",
    timeline: "1-2 weeks for indexing",
    expectedImpact: "+10-15% AI citation rate",
    condition: (ctx) => ctx.visibilityScore < 75,
  },
  {
    category: "content",
    priority: "high",
    title: "Create comparison pages vs competitors",
    description: "AI systems frequently reference comparison content when users ask 'X vs Y' questions. Create honest, detailed comparison pages for each main competitor highlighting your differentiators.",
    effort: "4-8 hours per page",
    timeline: "2-4 weeks for results",
    expectedImpact: "+8-12% visibility for comparison queries",
    condition: (ctx) => ctx.competitorCount > 0,
  },
  {
    category: "content",
    priority: "high",
    title: "Publish industry thought leadership",
    description: "Create in-depth articles, guides, and research that position your brand as an industry expert. AI systems prioritize authoritative content sources.",
    effort: "8-12 hours",
    timeline: "4-6 weeks for indexing",
    expectedImpact: "+10-15% authority score",
    condition: (ctx) => ctx.visibilityScore < 70,
  },

  // MEDIUM PRIORITY - Authority
  {
    category: "authority",
    priority: "medium",
    title: "Get featured in industry publications",
    description: "Being mentioned in reputable industry publications like TechCrunch, Forbes, or industry-specific sites significantly boosts your authority in AI systems. Pitch stories, contribute guest posts, or seek expert quotes.",
    effort: "10-20 hours",
    timeline: "4-8 weeks",
    expectedImpact: "+10-15% visibility",
    condition: (ctx) => ctx.visibilityScore < 80,
  },
  {
    category: "authority",
    priority: "medium",
    title: "Collect more customer reviews",
    description: "AI systems weight review quantity and recency heavily. Launch a review collection campaign targeting G2, Capterra, and Trustpilot. Aim for 20+ recent reviews.",
    effort: "Ongoing",
    timeline: "4-8 weeks",
    expectedImpact: "+5-10% visibility",
    condition: (ctx) => ctx.visibilityScore < 85,
  },
  {
    category: "authority",
    priority: "medium",
    title: "Build quality backlinks",
    description: "Backlinks from authoritative domains signal credibility to AI systems. Focus on guest posting, partnerships, and creating linkable assets like reports and tools.",
    effort: "Ongoing",
    timeline: "2-3 months",
    expectedImpact: "+8-12% authority score",
    condition: (ctx) => ctx.visibilityScore < 75,
  },

  // MEDIUM PRIORITY - Community
  {
    category: "community",
    priority: "medium",
    title: "Start Reddit engagement",
    description: "Reddit discussions are frequently cited by AI systems. Participate authentically in relevant subreddits (r/SaaS, r/startups, r/entrepreneur, or industry-specific). Answer questions and share expertise without being promotional.",
    effort: "2 hours/week ongoing",
    timeline: "4-8 weeks for results",
    expectedImpact: "+8-12% visibility",
    condition: (ctx) => ctx.visibilityScore < 70,
    actionUrl: "https://www.reddit.com",
  },
  {
    category: "community",
    priority: "medium",
    title: "Launch on Product Hunt",
    description: "Product Hunt launches create significant backlinks and discussions that AI systems reference. Plan a coordinated launch with assets, hunter, and community support.",
    effort: "10-20 hours",
    timeline: "1-2 weeks post-launch",
    expectedImpact: "+10-15% visibility",
    condition: (ctx) => ctx.visibilityScore < 65,
    actionUrl: "https://www.producthunt.com/posts/new",
  },
  {
    category: "community",
    priority: "medium",
    title: "Answer questions on Quora",
    description: "Quora answers are indexed and cited by AI systems. Find relevant questions in your industry and provide detailed, helpful answers that naturally mention your brand where relevant.",
    effort: "2-3 hours/week",
    timeline: "3-4 weeks",
    expectedImpact: "+5-8% visibility",
    condition: (ctx) => ctx.visibilityScore < 75,
    actionUrl: "https://www.quora.com",
  },

  // TECHNICAL
  {
    category: "technical",
    priority: "medium",
    title: "Add Organization schema markup",
    description: "Schema.org markup helps AI systems understand your business entity. Implement Organization, Product, FAQ, Review, and Breadcrumb schemas on your website.",
    effort: "2-4 hours",
    timeline: "1-2 weeks for processing",
    expectedImpact: "+2-5% visibility",
    condition: (ctx) => ctx.visibilityScore < 90,
  },
  {
    category: "technical",
    priority: "low",
    title: "Optimize meta descriptions",
    description: "Update meta descriptions to provide direct, concise answers to common queries. AI systems often use these for quick factual responses about your product.",
    effort: "2-3 hours",
    timeline: "1-2 weeks",
    expectedImpact: "+2-3% visibility",
    condition: (ctx) => ctx.visibilityScore < 95,
  },
  {
    category: "technical",
    priority: "low",
    title: "Improve page load speed",
    description: "Faster sites are prioritized in search and AI indexing. Optimize images, use CDN, and minimize JavaScript for better crawling and indexing.",
    effort: "4-8 hours",
    timeline: "1-2 weeks",
    expectedImpact: "+1-3% visibility",
    condition: (ctx) => ctx.visibilityScore < 90,
  },

  // SENTIMENT IMPROVEMENT
  {
    category: "authority",
    priority: "high",
    title: "Address negative sentiment",
    description: "Your brand shows negative sentiment in AI responses. Review recent customer feedback, identify patterns, and proactively address common complaints. Respond to negative reviews professionally.",
    effort: "Varies",
    timeline: "4-8 weeks",
    expectedImpact: "+10-20% sentiment improvement",
    condition: (ctx) => ctx.avgSentiment < -0.1,
  },

  // LOW VISIBILITY EMERGENCY
  {
    category: "entity",
    priority: "high",
    title: "Establish basic web presence",
    description: "Your visibility is very low. Immediately ensure your website has clear product descriptions, proper metadata, About page, Contact information, and basic SEO fundamentals.",
    effort: "8-16 hours",
    timeline: "2-4 weeks",
    expectedImpact: "+20-30% visibility",
    condition: (ctx) => ctx.visibilityScore < 40,
  },

  // ADDITIONAL RECOMMENDATIONS
  {
    category: "content",
    priority: "medium",
    title: "Create video content",
    description: "YouTube is the second largest search engine and AI systems reference video content. Create product demos, tutorials, and explainer videos with optimized titles and descriptions.",
    effort: "10-20 hours",
    timeline: "4-6 weeks",
    expectedImpact: "+5-10% visibility",
    condition: (ctx) => ctx.visibilityScore < 80,
    actionUrl: "https://www.youtube.com",
  },
  {
    category: "content",
    priority: "low",
    title: "Start a company blog",
    description: "Regular blog content with industry insights, how-tos, and news helps build topical authority. Aim for 2-4 posts per month with proper keyword research.",
    effort: "4-8 hours/month",
    timeline: "2-3 months",
    expectedImpact: "+5-8% visibility",
    condition: (ctx) => ctx.visibilityScore < 85,
  },
  {
    category: "authority",
    priority: "medium",
    title: "Get listed in industry directories",
    description: "Submit your company to relevant software directories, industry associations, and business listings. These create authoritative backlinks and entity signals.",
    effort: "4-6 hours",
    timeline: "2-4 weeks",
    expectedImpact: "+3-5% visibility",
    condition: (ctx) => ctx.visibilityScore < 75,
  },
  {
    category: "community",
    priority: "low",
    title: "Host webinars or events",
    description: "Online events create content, backlinks, and discussions that AI systems can reference. Partner with industry influencers for maximum reach.",
    effort: "15-25 hours",
    timeline: "6-8 weeks",
    expectedImpact: "+5-8% visibility",
    condition: (ctx) => ctx.visibilityScore < 70,
  },
];

export function generateRecommendations(context: RecommendationContext): RecommendationTemplate[] {
  // Filter recommendations based on conditions
  const applicable = RECOMMENDATION_TEMPLATES.filter((template) => template.condition(context));

  // Sort by priority
  const sorted = applicable.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Return top 15 recommendations for comprehensive action plan
  return sorted.slice(0, 15);
}
