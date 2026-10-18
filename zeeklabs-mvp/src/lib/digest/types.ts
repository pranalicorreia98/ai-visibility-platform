// Digest email types

export interface EngineMentions {
  engine: "chatgpt" | "gemini" | "perplexity";
  previous: number;
  current: number;
  delta: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface CompetitorMovement {
  name: string;
  previousRank: number | null;
  currentRank: number | null;
  direction: "up" | "down" | "new" | "dropped" | "same";
}

export interface BrandDiff {
  brandId: string;
  brandName: string;

  // Overall score
  previousScore: number;
  currentScore: number;
  scoreDelta: number;

  // Mentions by engine
  mentions: EngineMentions[];

  // Sentiment shift
  sentiment: {
    previous: SentimentBreakdown;
    current: SentimentBreakdown;
  };

  // Competitor changes
  competitorMovement: CompetitorMovement[];

  // Top recommendations
  recommendations: string[];
}

export interface DigestData {
  userId: string;
  userName: string;
  userEmail: string;
  brands: BrandDiff[];
  periodStart: Date;
  periodEnd: Date;
}

export interface DigestResult {
  userId: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BatchResult {
  processed: number;
  sent: number;
  skipped: number;
  errors: string[];
}
