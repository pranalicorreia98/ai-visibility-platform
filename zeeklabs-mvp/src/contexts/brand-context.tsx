"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";

// Storage keys for persisting data
const SELECTED_BRAND_KEY = "zeeklabs_selected_brand_id";
const VISIBILITY_CACHE_KEY = "zeeklabs_visibility_cache";
const MENTIONS_CACHE_KEY = "zeeklabs_mentions_cache";
const ANALYSIS_CACHE_KEY = "zeeklabs_analysis_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Types
export interface Brand {
  id: string;
  name: string;
  domain?: string;
  competitors: Array<{ id: string; name: string; domain?: string }>;
}

export interface VisibilityData {
  score: {
    overall: number;
    chatgpt: number;
    gemini: number;
    perplexity: number;
  };
  mentions: {
    total: number;
    chatgpt: number;
    gemini: number;
    perplexity: number;
  };
  sentiment: {
    average: number;
    positive: number;
    neutral: number;
    negative: number;
  };
  simulations: number;
  trend: Array<{
    date: string;
    chatgpt: number;
    gemini: number;
    perplexity: number;
    total: number;
  }>;
}

export interface Mention {
  id: string;
  brandId: string;
  aiSystem: string;
  prompt: string;
  response: string;
  context: string;
  sentiment: number | null;
  position: number | null;
  isCompetitor: boolean;
  competitorName?: string;
  createdAt: string;
}

// Analysis result interface (matches the one in analysis page)
export interface AnalysisResult {
  scores: {
    overall: number;
    brandAwareness: number;
    marketPosition: number;
    sentimentScore: number;
    authorityScore: number;
    contentVisibility: number;
    socialPresence: number;
  };
  competitorComparison: Array<{
    name: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
    sentiment: "positive" | "neutral" | "negative";
  }>;
  marketIntelligence: {
    industryTrends: string[];
    marketSize: string;
    growthRate: string;
    macroFactors: string[];
    microFactors: string[];
    futureOutlook: string;
  };
  sentimentAnalysis: {
    brandSentiment: {
      overall: string;
      score: number;
      positiveThemes: string[];
      negativeThemes: string[];
      neutralThemes: string[];
    };
    customerSentiment: {
      satisfaction: number;
      commonPraises: string[];
      commonComplaints: string[];
      nps: string;
    };
    marketSentiment: {
      industryOutlook: string;
      investorSentiment: string;
      mediaPerception: string;
    };
  };
  emergingPlayers: Array<{
    name: string;
    description: string;
    threatLevel: string;
    uniqueAdvantage: string;
    growthTrajectory: string;
  }>;
  productAnalysis: {
    featureGaps: string[];
    featureAdvantages: string[];
  };
  citations: Array<{
    source: string;
    type: string;
    relevance: string;
    url?: string;
  }>;
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    competitiveActions: string[];
  };
  aiVisibility: {
    mentionFrequency: string;
    typicalPosition: number | null;
    recommendationLikelihood: string;
    competitorMentionGap: string;
    improvementAreas: string[];
  };
}

interface BrandContextValue {
  // Brand state
  brands: Brand[];
  selectedBrandId: string;
  selectedBrand: Brand | null;
  setSelectedBrandId: (id: string) => void;

  // Visibility data
  visibilityData: VisibilityData | null;
  recentMentions: Mention[];

  // Analysis data (persisted across navigation)
  analysisData: AnalysisResult | null;
  setAnalysisData: (data: AnalysisResult | null) => void;

  // Loading states
  loading: boolean;
  visibilityLoading: boolean;

  // Actions
  refreshData: () => Promise<void>;
  refreshVisibilityData: (forceRefresh?: boolean) => Promise<void>;
  fetchBrands: () => Promise<void>;
  invalidateVisibilityCache: () => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

// Get stored brand ID from localStorage (client-side only)
function getStoredBrandId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(SELECTED_BRAND_KEY) || "";
  } catch {
    return "";
  }
}

// Store brand ID in localStorage
function storeBrandId(id: string) {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(SELECTED_BRAND_KEY, id);
    } else {
      localStorage.removeItem(SELECTED_BRAND_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

// Cache visibility data in sessionStorage
function cacheVisibilityData(brandId: string, data: VisibilityData) {
  if (typeof window === "undefined") return;
  try {
    const cache = {
      data,
      timestamp: Date.now(),
      brandId,
    };
    sessionStorage.setItem(VISIBILITY_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
}

function getCachedVisibilityData(brandId: string): VisibilityData | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(VISIBILITY_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp, brandId: cachedBrandId } = JSON.parse(cached);

    // Check if cache is for the same brand and not expired
    if (cachedBrandId === brandId && Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

// Cache mentions data in sessionStorage
function cacheMentionsData(brandId: string, data: Mention[]) {
  if (typeof window === "undefined") return;
  try {
    const cache = {
      data,
      timestamp: Date.now(),
      brandId,
    };
    sessionStorage.setItem(MENTIONS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
}

function getCachedMentionsData(brandId: string): Mention[] | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(MENTIONS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp, brandId: cachedBrandId } = JSON.parse(cached);

    // Check if cache is for the same brand and not expired
    if (cachedBrandId === brandId && Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

// Cache analysis data in sessionStorage
function cacheAnalysisData(brandId: string, data: AnalysisResult) {
  if (typeof window === "undefined") return;
  try {
    const cache = {
      data,
      timestamp: Date.now(),
      brandId,
    };
    sessionStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
}

function getCachedAnalysisData(brandId: string): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(ANALYSIS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp, brandId: cachedBrandId } = JSON.parse(cached);

    // Check if cache is for the same brand and not expired (30 min TTL for analysis)
    const ANALYSIS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for analysis
    if (cachedBrandId === brandId && Date.now() - timestamp < ANALYSIS_CACHE_TTL) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

// Clear cache for a brand (call after analysis runs)
function invalidateCache() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(VISIBILITY_CACHE_KEY);
    sessionStorage.removeItem(MENTIONS_CACHE_KEY);
    // Note: We don't clear analysis cache here - it's cleared separately
  } catch {
    // Ignore
  }
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandIdState] = useState<string>("");
  const [visibilityData, setVisibilityData] = useState<VisibilityData | null>(null);
  const [recentMentions, setRecentMentions] = useState<Mention[]>([]);
  const [analysisData, setAnalysisDataState] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Track the previous brand ID to detect changes
  const prevBrandIdRef = useRef<string>("");
  // Track current brand ID for refresh functions (avoids stale closure issues)
  const currentBrandIdRef = useRef<string>("");

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || null;

  // Custom setter that also persists to localStorage
  const setSelectedBrandId = useCallback((id: string) => {
    setSelectedBrandIdState(id);
    storeBrandId(id);
  }, []);

  // Custom setter for analysis data that also caches it
  const setAnalysisData = useCallback((data: AnalysisResult | null) => {
    setAnalysisDataState(data);
    if (data && currentBrandIdRef.current) {
      cacheAnalysisData(currentBrandIdRef.current, data);
    }
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedId = getStoredBrandId();
    if (storedId) {
      setSelectedBrandIdState(storedId);
      // Also load cached analysis data
      const cachedAnalysis = getCachedAnalysisData(storedId);
      if (cachedAnalysis) {
        setAnalysisDataState(cachedAnalysis);
      }
    }
    setInitialized(true);
  }, []);

  // Fetch brands on mount
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/brands");
      if (response.ok) {
        const data = await response.json();
        setBrands(data);

        // Get stored brand ID
        const storedId = getStoredBrandId();

        // Check if stored ID exists in fetched brands
        const storedBrandExists = data.some((b: Brand) => b.id === storedId);

        setSelectedBrandIdState((currentId) => {
          // If we have a stored ID that exists in brands, use it
          if (storedId && storedBrandExists) {
            return storedId;
          }
          // If current selection exists in brands, keep it
          if (currentId && data.some((b: Brand) => b.id === currentId)) {
            return currentId;
          }
          // Otherwise, select first brand
          if (data.length > 0) {
            const newId = data[0].id;
            storeBrandId(newId);
            return newId;
          }
          return "";
        });
      }
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch visibility data when brand changes (with caching)
  const fetchVisibilityData = useCallback(async (brandId: string, forceRefresh = false) => {
    if (!brandId) return;

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedVisibility = getCachedVisibilityData(brandId);
      const cachedMentions = getCachedMentionsData(brandId);

      if (cachedVisibility && cachedMentions) {
        // Use cached data immediately
        setVisibilityData(cachedVisibility);
        setRecentMentions(cachedMentions);
        return;
      }

      // If we have visibility data in state for the same brand, keep it while loading
      // This prevents the flash of empty content
    }

    try {
      setVisibilityLoading(true);

      // Fetch visibility metrics and mentions in parallel
      const [visRes, mentionsRes] = await Promise.all([
        fetch(`/api/visibility?brandId=${brandId}&days=30`),
        fetch(`/api/mentions?brandId=${brandId}&limit=10`)
      ]);

      if (visRes.ok) {
        const data = await visRes.json();
        setVisibilityData(data);
        cacheVisibilityData(brandId, data);
      }
      // Don't reset to null on failure - keep existing data

      if (mentionsRes.ok) {
        const data = await mentionsRes.json();
        const mentions = Array.isArray(data) ? data : [];
        setRecentMentions(mentions);
        cacheMentionsData(brandId, mentions);
      }
      // Don't reset to empty on failure - keep existing data
    } catch (err) {
      console.error("Failed to fetch visibility data:", err);
      // Don't reset on error - keep existing data to prevent flicker
    } finally {
      setVisibilityLoading(false);
    }
  }, []);

  // Keep the ref updated with latest brand ID
  useEffect(() => {
    currentBrandIdRef.current = selectedBrandId;
  }, [selectedBrandId]);

  // Refresh visibility data only (uses ref to get latest brand ID)
  const refreshVisibilityData = useCallback(async (forceRefresh = false) => {
    const brandId = currentBrandIdRef.current;
    if (brandId) {
      if (forceRefresh) {
        invalidateCache();
      }
      await fetchVisibilityData(brandId, forceRefresh);
    }
  }, [fetchVisibilityData]);

  // Expose cache invalidation
  const invalidateVisibilityCache = useCallback(() => {
    invalidateCache();
  }, []);

  // Refresh all data for current brand
  const refreshData = useCallback(async () => {
    await fetchBrands();
    const brandId = currentBrandIdRef.current;
    if (brandId) {
      await fetchVisibilityData(brandId);
    }
  }, [fetchBrands, fetchVisibilityData]);

  // Initial fetch - wait for initialization
  useEffect(() => {
    if (initialized) {
      fetchBrands();
    }
  }, [initialized, fetchBrands]);

  // Fetch visibility when brand changes
  useEffect(() => {
    if (selectedBrandId && selectedBrandId !== prevBrandIdRef.current) {
      const previousBrandId = prevBrandIdRef.current;
      prevBrandIdRef.current = selectedBrandId;

      // Only clear old data if we're switching to a different brand
      // This prevents clearing when navigating between pages with same brand
      if (previousBrandId && previousBrandId !== selectedBrandId) {
        // Check if we have cached data for the new brand
        const cachedVisibility = getCachedVisibilityData(selectedBrandId);
        const cachedMentions = getCachedMentionsData(selectedBrandId);
        const cachedAnalysis = getCachedAnalysisData(selectedBrandId);

        if (cachedVisibility) {
          setVisibilityData(cachedVisibility);
        }
        if (cachedMentions) {
          setRecentMentions(cachedMentions);
        }
        if (cachedAnalysis) {
          setAnalysisDataState(cachedAnalysis);
        } else {
          // Clear analysis data if switching to a brand without cached analysis
          setAnalysisDataState(null);
        }
      }

      // Fetch (will use cache if available)
      fetchVisibilityData(selectedBrandId);
    }
  }, [selectedBrandId, fetchVisibilityData]);

  const value: BrandContextValue = {
    brands,
    selectedBrandId,
    selectedBrand,
    setSelectedBrandId,
    visibilityData,
    recentMentions,
    analysisData,
    setAnalysisData,
    loading,
    visibilityLoading,
    refreshData,
    refreshVisibilityData,
    fetchBrands,
    invalidateVisibilityCache,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
