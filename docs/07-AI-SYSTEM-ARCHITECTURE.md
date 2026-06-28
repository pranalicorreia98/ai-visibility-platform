# 7. AI System Architecture

## 7.1 Overview

This document details the AI and Machine Learning architecture for the AI Visibility Platform. The system leverages multiple AI providers, custom ML models, and intelligent pipelines to monitor, analyze, and optimize brand visibility across AI systems.

---

## 7.2 AI Architecture Overview

### 7.2.1 High-Level AI System Design

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AI SYSTEM ARCHITECTURE                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                  AI GATEWAY LAYER                                            │   │
│  │                                                                                              │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │
│  │  │   OpenAI    │ │  Anthropic  │ │   Google    │ │ Perplexity  │ │  Microsoft  │           │   │
│  │  │   GPT-4     │ │   Claude    │ │   Gemini    │ │    pplx     │ │   Copilot   │           │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │   │
│  │                                                                                              │   │
│  │  Features:                                                                                   │   │
│  │  • Unified API interface          • Rate limiting per provider                              │   │
│  │  • Automatic failover             • Cost tracking                                           │   │
│  │  • Response caching               • Model version management                                │   │
│  │                                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                  ML PROCESSING LAYER                                         │   │
│  │                                                                                              │   │
│  │  ┌───────────────────────────────┐  ┌───────────────────────────────┐                       │   │
│  │  │     NLP PIPELINE              │  │     SCORING ENGINE            │                       │   │
│  │  │                               │  │                               │                       │   │
│  │  │  ┌─────────────────────────┐  │  │  ┌─────────────────────────┐  │                       │   │
│  │  │  │  Entity Recognition    │  │  │  │  Visibility Scoring    │  │                       │   │
│  │  │  │  (Brand Detection)     │  │  │  │  Algorithm             │  │                       │   │
│  │  │  └─────────────────────────┘  │  │  └─────────────────────────┘  │                       │   │
│  │  │                               │  │                               │                       │   │
│  │  │  ┌─────────────────────────┐  │  │  ┌─────────────────────────┐  │                       │   │
│  │  │  │  Sentiment Analysis    │  │  │  │  Trend Prediction      │  │                       │   │
│  │  │  │  (Fine-tuned BERT)     │  │  │  │  (Prophet + ML)        │  │                       │   │
│  │  │  └─────────────────────────┘  │  │  └─────────────────────────┘  │                       │   │
│  │  │                               │  │                               │                       │   │
│  │  │  ┌─────────────────────────┐  │  │  ┌─────────────────────────┐  │                       │   │
│  │  │  │  Citation Extraction   │  │  │  │  Competitive Analysis  │  │                       │   │
│  │  │  │  (Custom NER Model)    │  │  │  │  Engine                │  │                       │   │
│  │  │  └─────────────────────────┘  │  │  └─────────────────────────┘  │                       │   │
│  │  │                               │  │                               │                       │   │
│  │  │  ┌─────────────────────────┐  │  │  ┌─────────────────────────┐  │                       │   │
│  │  │  │  Topic Classification  │  │  │  │  Recommendation        │  │                       │   │
│  │  │  │  (Zero-shot)           │  │  │  │  Engine                │  │                       │   │
│  │  │  └─────────────────────────┘  │  │  └─────────────────────────┘  │                       │   │
│  │  │                               │  │                               │                       │   │
│  │  └───────────────────────────────┘  └───────────────────────────────┘                       │   │
│  │                                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                  VECTOR & EMBEDDING LAYER                                    │   │
│  │                                                                                              │   │
│  │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐                   │   │
│  │  │     EMBEDDING GENERATION        │  │     VECTOR DATABASE             │                   │   │
│  │  │                                 │  │     (Pinecone / pgvector)       │                   │   │
│  │  │  • OpenAI text-embedding-3-large│  │                                 │                   │   │
│  │  │  • Cohere embed-v3              │  │  • Semantic search              │                   │   │
│  │  │  • Custom fine-tuned embeddings │  │  • Similarity matching          │                   │   │
│  │  │                                 │  │  • Clustering                   │                   │   │
│  │  └─────────────────────────────────┘  └─────────────────────────────────┘                   │   │
│  │                                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                  MODEL SERVING LAYER                                         │   │
│  │                                                                                              │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐                  │   │
│  │  │  Model Registry     │  │  Model Serving      │  │  Model Monitoring   │                  │   │
│  │  │  (MLflow)           │  │  (TorchServe)       │  │  (Evidently AI)     │                  │   │
│  │  │                     │  │                     │  │                     │                  │   │
│  │  │  • Version control  │  │  • GPU inference    │  │  • Data drift       │                  │   │
│  │  │  • Experiment track │  │  • Auto-scaling     │  │  • Model drift      │                  │   │
│  │  │  • A/B deployment   │  │  • Batching         │  │  • Performance      │                  │   │
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘                  │   │
│  │                                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7.3 External AI Provider Integration

### 7.3.1 Provider Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AI PROVIDER CONFIGURATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OPENAI                                                                    │
│  ──────                                                                     │
│  Models:                                                                   │
│  • gpt-4-turbo (primary for monitoring)                                   │
│  • gpt-4o (for fast analysis)                                             │
│  • gpt-3.5-turbo (fallback, cost optimization)                           │
│  • text-embedding-3-large (embeddings)                                    │
│                                                                             │
│  Rate Limits:                                                              │
│  • TPM (Tokens per minute): 800,000                                       │
│  • RPM (Requests per minute): 10,000                                      │
│                                                                             │
│  Configuration:                                                            │
│  {                                                                         │
│    "provider": "openai",                                                   │
│    "api_version": "2024-01-01",                                            │
│    "default_model": "gpt-4-turbo",                                         │
│    "temperature": 0.3,                                                     │
│    "max_tokens": 2000,                                                     │
│    "timeout_ms": 60000,                                                    │
│    "retry_config": {                                                       │
│      "max_attempts": 3,                                                    │
│      "backoff_multiplier": 2                                               │
│    }                                                                       │
│  }                                                                         │
│                                                                             │
│  ANTHROPIC                                                                 │
│  ─────────                                                                  │
│  Models:                                                                   │
│  • claude-3-opus (complex analysis)                                       │
│  • claude-3-sonnet (balanced)                                             │
│  • claude-3-haiku (fast, cost-effective)                                  │
│                                                                             │
│  Rate Limits:                                                              │
│  • TPM: 400,000                                                            │
│  • RPM: 4,000                                                              │
│                                                                             │
│  GOOGLE                                                                    │
│  ──────                                                                     │
│  Models:                                                                   │
│  • gemini-1.5-pro (primary)                                               │
│  • gemini-1.5-flash (fast)                                                │
│                                                                             │
│  Rate Limits:                                                              │
│  • QPM (Queries per minute): 360                                          │
│  • RPM: 1,000                                                              │
│                                                                             │
│  PERPLEXITY                                                                │
│  ──────────                                                                 │
│  Models:                                                                   │
│  • pplx-70b-online (web-grounded)                                         │
│  • pplx-7b-online (fast)                                                  │
│                                                                             │
│  Special Features:                                                         │
│  • Real-time web search integration                                       │
│  • Citation sources included                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3.2 AI Gateway Implementation

```typescript
// AI Gateway Service Implementation

interface AIProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  models: string[];
  rateLimits: {
    tokensPerMinute: number;
    requestsPerMinute: number;
  };
  timeout: number;
  retryConfig: {
    maxAttempts: number;
    backoffMultiplier: number;
  };
}

interface AIRequest {
  provider: string;
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

interface AIResponse {
  id: string;
  provider: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latencyMs: number;
  cached: boolean;
}

class AIGatewayService {
  private providers: Map<string, AIProvider>;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private rateLimiters: Map<string, RateLimiter>;
  private cache: ResponseCache;

  async query(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true, latencyMs: Date.now() - startTime };
    }

    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(request.provider);
    if (circuitBreaker?.isOpen()) {
      // Try fallback provider
      const fallback = this.selectFallbackProvider(request.provider);
      if (fallback) {
        request.provider = fallback;
      } else {
        throw new ServiceUnavailableError(`Provider ${request.provider} unavailable`);
      }
    }

    // Check rate limits
    const rateLimiter = this.rateLimiters.get(request.provider);
    await rateLimiter?.acquire(request.metadata?.workspaceId);

    try {
      const provider = this.providers.get(request.provider);
      const response = await provider.complete(request);

      // Track usage for billing
      await this.trackUsage(request, response);

      // Cache successful response
      await this.cache.set(cacheKey, response, this.getCacheTTL(request));

      circuitBreaker?.recordSuccess();

      return {
        ...response,
        cached: false,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      circuitBreaker?.recordFailure();
      throw error;
    }
  }

  private selectFallbackProvider(failedProvider: string): string | null {
    const fallbackOrder: Record<string, string[]> = {
      'openai': ['anthropic', 'google'],
      'anthropic': ['openai', 'google'],
      'google': ['openai', 'anthropic'],
      'perplexity': ['openai'],
    };

    const fallbacks = fallbackOrder[failedProvider] || [];
    for (const fallback of fallbacks) {
      if (!this.circuitBreakers.get(fallback)?.isOpen()) {
        return fallback;
      }
    }
    return null;
  }

  private async trackUsage(request: AIRequest, response: AIResponse): Promise<void> {
    await this.usageTracker.record({
      workspaceId: request.metadata?.workspaceId,
      provider: request.provider,
      model: request.model,
      tokens: response.usage.totalTokens,
      cost: response.cost,
      timestamp: new Date(),
    });
  }
}
```

---

## 7.4 NLP Pipeline

### 7.4.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NLP PROCESSING PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT: AI Response Text                                                   │
│  ───────────────────────                                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 1: PREPROCESSING                                             │   │
│  │                                                                       │   │
│  │  • Text normalization (encoding, whitespace)                         │   │
│  │  • Language detection                                                │   │
│  │  • Sentence segmentation                                             │   │
│  │  • Token count estimation                                            │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 2: ENTITY RECOGNITION                                        │   │
│  │                                                                       │   │
│  │  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │   │
│  │  │  Brand Detection  │  │  Competitor       │  │  Product/       │  │   │
│  │  │  (Custom NER)     │  │  Detection        │  │  Feature NER    │  │   │
│  │  └───────────────────┘  └───────────────────┘  └─────────────────┘  │   │
│  │                                                                       │   │
│  │  Output: List of entities with positions and confidence scores      │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 3: CITATION EXTRACTION                                       │   │
│  │                                                                       │   │
│  │  • Identify citation patterns ("According to X", "X recommends")    │   │
│  │  • Extract citation context (surrounding sentences)                 │   │
│  │  • Classify citation type (mention, recommendation, comparison)     │   │
│  │  • Link citations to detected entities                              │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 4: SENTIMENT ANALYSIS                                        │   │
│  │                                                                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Document-Level Sentiment                                      │  │   │
│  │  │  • Overall tone of response                                    │  │   │
│  │  │  • Confidence score                                            │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Entity-Level Sentiment                                        │  │   │
│  │  │  • Sentiment per brand/entity mention                         │  │   │
│  │  │  • Aspect-based sentiment                                     │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 5: TOPIC & INTENT CLASSIFICATION                            │   │
│  │                                                                       │   │
│  │  • Topic classification (zero-shot or fine-tuned)                   │   │
│  │  • Intent detection (informational, transactional, comparative)    │   │
│  │  • Category mapping                                                 │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 6: EMBEDDING GENERATION                                      │   │
│  │                                                                       │   │
│  │  • Generate embeddings for semantic search                          │   │
│  │  • Store in vector database                                         │   │
│  │  • Link to structured data                                          │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  OUTPUT: Structured Analysis Result                                        │
│  ──────────────────────────────────────                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.4.2 Entity Recognition Model

```python
# Custom NER Model for Brand Detection

from transformers import AutoModelForTokenClassification, AutoTokenizer
import torch

class BrandEntityRecognizer:
    """
    Custom NER model fine-tuned for brand/company detection
    Base model: microsoft/deberta-v3-base
    Fine-tuned on: Custom brand mention dataset
    """

    def __init__(self, model_path: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForTokenClassification.from_pretrained(model_path)
        self.model.eval()

        self.label_map = {
            0: 'O',
            1: 'B-BRAND',
            2: 'I-BRAND',
            3: 'B-PRODUCT',
            4: 'I-PRODUCT',
            5: 'B-COMPETITOR',
            6: 'I-COMPETITOR',
            7: 'B-FEATURE',
            8: 'I-FEATURE',
        }

    def extract_entities(self, text: str) -> list[dict]:
        """Extract brand and related entities from text."""
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            return_offsets_mapping=True
        )

        offset_mapping = inputs.pop("offset_mapping")[0]

        with torch.no_grad():
            outputs = self.model(**inputs)

        predictions = torch.argmax(outputs.logits, dim=2)[0]

        entities = []
        current_entity = None

        for idx, (pred, offset) in enumerate(zip(predictions, offset_mapping)):
            label = self.label_map[pred.item()]

            if label.startswith('B-'):
                if current_entity:
                    entities.append(current_entity)
                current_entity = {
                    'type': label[2:],
                    'start': offset[0].item(),
                    'end': offset[1].item(),
                    'text': text[offset[0]:offset[1]],
                    'confidence': torch.softmax(outputs.logits[0, idx], dim=0)[pred].item()
                }
            elif label.startswith('I-') and current_entity:
                if label[2:] == current_entity['type']:
                    current_entity['end'] = offset[1].item()
                    current_entity['text'] = text[current_entity['start']:current_entity['end']]
            else:
                if current_entity:
                    entities.append(current_entity)
                    current_entity = None

        if current_entity:
            entities.append(current_entity)

        return self._merge_and_filter(entities, text)

    def _merge_and_filter(self, entities: list, text: str) -> list:
        """Merge adjacent entities and filter low-confidence ones."""
        filtered = [e for e in entities if e['confidence'] >= 0.7]

        # Merge adjacent same-type entities
        merged = []
        for entity in filtered:
            if merged and merged[-1]['type'] == entity['type']:
                gap = entity['start'] - merged[-1]['end']
                if gap <= 2:  # Allow small gaps
                    merged[-1]['end'] = entity['end']
                    merged[-1]['text'] = text[merged[-1]['start']:merged[-1]['end']]
                    merged[-1]['confidence'] = min(merged[-1]['confidence'], entity['confidence'])
                    continue
            merged.append(entity)

        return merged
```

### 7.4.3 Sentiment Analysis Model

```python
# Fine-tuned Sentiment Analysis for Brand Context

from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
import numpy as np

class BrandSentimentAnalyzer:
    """
    Sentiment analysis fine-tuned for brand/product context
    Base model: cardiffnlp/twitter-roberta-base-sentiment-latest
    Fine-tuned on: Brand mention sentiment dataset
    """

    def __init__(self, model_path: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        self.model.eval()

        self.labels = ['negative', 'neutral', 'positive']

    def analyze(self, text: str, entity_spans: list[tuple] = None) -> dict:
        """
        Analyze sentiment of text with optional entity-level analysis.

        Args:
            text: Input text
            entity_spans: List of (start, end) tuples for entity-level sentiment

        Returns:
            Document and entity-level sentiment scores
        """
        # Document-level sentiment
        doc_sentiment = self._analyze_text(text)

        result = {
            'document': doc_sentiment,
            'entities': []
        }

        # Entity-level sentiment
        if entity_spans:
            for start, end in entity_spans:
                context = self._extract_context(text, start, end)
                entity_sentiment = self._analyze_text(context)
                result['entities'].append({
                    'span': (start, end),
                    'text': text[start:end],
                    'context': context,
                    **entity_sentiment
                })

        return result

    def _analyze_text(self, text: str) -> dict:
        """Analyze sentiment of a text segment."""
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512
        )

        with torch.no_grad():
            outputs = self.model(**inputs)

        probs = torch.softmax(outputs.logits, dim=1)[0].numpy()

        return {
            'sentiment': self.labels[np.argmax(probs)],
            'score': float(probs[2] - probs[0]),  # -1 to 1 scale
            'confidence': float(np.max(probs)),
            'probabilities': {
                label: float(prob)
                for label, prob in zip(self.labels, probs)
            }
        }

    def _extract_context(self, text: str, start: int, end: int, window: int = 100) -> str:
        """Extract context around an entity for sentiment analysis."""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)

        # Adjust to sentence boundaries if possible
        while context_start > 0 and text[context_start] not in '.!?\n':
            context_start -= 1
        while context_end < len(text) and text[context_end] not in '.!?\n':
            context_end += 1

        return text[context_start:context_end].strip()
```

---

## 7.5 Visibility Scoring Engine

### 7.5.1 Scoring Algorithm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      VISIBILITY SCORING ALGORITHM                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OVERALL VISIBILITY SCORE (0-100)                                          │
│  ─────────────────────────────────                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Score = (W1 × Citation) + (W2 × Sentiment) + (W3 × Recommend)      │   │
│  │          + (W4 × Coverage) + (W5 × Position) + (W6 × Trend)         │   │
│  │                                                                       │   │
│  │  Where:                                                              │   │
│  │  W1 = 0.25 (Citation Frequency)                                     │   │
│  │  W2 = 0.20 (Sentiment Score)                                        │   │
│  │  W3 = 0.20 (Recommendation Rate)                                    │   │
│  │  W4 = 0.15 (AI System Coverage)                                     │   │
│  │  W5 = 0.10 (Position in Response)                                   │   │
│  │  W6 = 0.10 (Trend Direction)                                        │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMPONENT CALCULATIONS                                                    │
│  ──────────────────────                                                     │
│                                                                             │
│  1. CITATION FREQUENCY SCORE (0-100)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  citation_rate = mentions / total_queries                           │   │
│  │  normalized_rate = min(1.0, citation_rate / industry_benchmark)     │   │
│  │  recency_factor = decay_function(days_since_mention)                │   │
│  │                                                                       │   │
│  │  Citation_Score = normalized_rate × 100 × recency_factor            │   │
│  │                                                                       │   │
│  │  Industry Benchmarks:                                                │   │
│  │  • Tech products: 15% mention rate                                  │   │
│  │  • Services: 10% mention rate                                       │   │
│  │  • B2B: 8% mention rate                                             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  2. SENTIMENT SCORE (0-100)                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  positive_ratio = positive_mentions / total_mentions                │   │
│  │  negative_ratio = negative_mentions / total_mentions                │   │
│  │  weighted_sentiment = Σ(sentiment_score × confidence)               │   │
│  │                                                                       │   │
│  │  Sentiment_Score = 50 + (weighted_sentiment × 50)                   │   │
│  │                                                                       │   │
│  │  Scale: 0 = All negative, 50 = Neutral, 100 = All positive          │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  3. RECOMMENDATION RATE (0-100)                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  direct_recommendations = count("best", "recommend", "top choice")  │   │
│  │  comparison_wins = favorable_comparisons / total_comparisons        │   │
│  │  feature_highlights = positive_feature_mentions / total_features    │   │
│  │                                                                       │   │
│  │  Recommend_Score = (0.5 × direct_rec_rate + 0.3 × comparison_wins   │   │
│  │                    + 0.2 × feature_highlights) × 100                │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  4. AI SYSTEM COVERAGE (0-100)                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  systems_present = count(systems where brand_mentioned)             │   │
│  │  total_systems = count(monitored_ai_systems)                        │   │
│  │  consistency_score = variance(mention_rate_per_system)              │   │
│  │                                                                       │   │
│  │  Coverage_Score = (systems_present / total_systems) × 80            │   │
│  │                 + (1 - consistency_score) × 20                      │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  5. POSITION SCORE (0-100)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  first_mention_positions = [position for each mention]              │   │
│  │  avg_position = mean(first_mention_positions)                       │   │
│  │  position_factor = 1 - (avg_position / max_response_length)        │   │
│  │                                                                       │   │
│  │  Position_Score = position_factor × 100                             │   │
│  │                                                                       │   │
│  │  Higher score = Mentioned earlier in responses                      │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  6. TREND SCORE (0-100)                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  current_metrics = metrics from last 7 days                         │   │
│  │  previous_metrics = metrics from 7-14 days ago                      │   │
│  │  trend_direction = (current - previous) / previous                  │   │
│  │                                                                       │   │
│  │  Trend_Score = 50 + (trend_direction × 50)                          │   │
│  │  Clamped to [0, 100]                                                │   │
│  │                                                                       │   │
│  │  50 = Stable, >50 = Improving, <50 = Declining                      │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.5.2 Scoring Implementation

```python
# Visibility Scoring Engine Implementation

from dataclasses import dataclass
from typing import List, Dict
import numpy as np

@dataclass
class VisibilityComponents:
    citation_score: float
    sentiment_score: float
    recommendation_score: float
    coverage_score: float
    position_score: float
    trend_score: float

@dataclass
class VisibilityScore:
    overall_score: float
    components: VisibilityComponents
    breakdown: Dict[str, float]
    ai_system_scores: Dict[str, float]
    confidence: float
    sample_size: int

class VisibilityScoringEngine:
    """
    Engine for calculating brand visibility scores across AI systems.
    """

    # Component weights (must sum to 1.0)
    WEIGHTS = {
        'citation': 0.25,
        'sentiment': 0.20,
        'recommendation': 0.20,
        'coverage': 0.15,
        'position': 0.10,
        'trend': 0.10,
    }

    # Industry benchmarks for citation rates
    BENCHMARKS = {
        'tech': 0.15,
        'services': 0.10,
        'b2b': 0.08,
        'ecommerce': 0.12,
        'default': 0.10,
    }

    def calculate_score(
        self,
        brand_id: str,
        monitoring_results: List[dict],
        citations: List[dict],
        period_days: int = 30,
        industry: str = 'default'
    ) -> VisibilityScore:
        """Calculate comprehensive visibility score for a brand."""

        if not monitoring_results:
            return self._empty_score()

        # Calculate individual components
        citation_score = self._calculate_citation_score(
            monitoring_results, citations, industry
        )
        sentiment_score = self._calculate_sentiment_score(citations)
        recommendation_score = self._calculate_recommendation_score(citations)
        coverage_score = self._calculate_coverage_score(monitoring_results)
        position_score = self._calculate_position_score(citations)
        trend_score = self._calculate_trend_score(
            monitoring_results, citations, period_days
        )

        components = VisibilityComponents(
            citation_score=citation_score,
            sentiment_score=sentiment_score,
            recommendation_score=recommendation_score,
            coverage_score=coverage_score,
            position_score=position_score,
            trend_score=trend_score,
        )

        # Calculate weighted overall score
        overall_score = (
            self.WEIGHTS['citation'] * citation_score +
            self.WEIGHTS['sentiment'] * sentiment_score +
            self.WEIGHTS['recommendation'] * recommendation_score +
            self.WEIGHTS['coverage'] * coverage_score +
            self.WEIGHTS['position'] * position_score +
            self.WEIGHTS['trend'] * trend_score
        )

        # Calculate per-AI-system scores
        ai_system_scores = self._calculate_per_system_scores(
            monitoring_results, citations
        )

        # Calculate confidence based on sample size
        confidence = self._calculate_confidence(len(monitoring_results))

        return VisibilityScore(
            overall_score=round(overall_score, 2),
            components=components,
            breakdown={
                'citation': round(self.WEIGHTS['citation'] * citation_score, 2),
                'sentiment': round(self.WEIGHTS['sentiment'] * sentiment_score, 2),
                'recommendation': round(self.WEIGHTS['recommendation'] * recommendation_score, 2),
                'coverage': round(self.WEIGHTS['coverage'] * coverage_score, 2),
                'position': round(self.WEIGHTS['position'] * position_score, 2),
                'trend': round(self.WEIGHTS['trend'] * trend_score, 2),
            },
            ai_system_scores=ai_system_scores,
            confidence=confidence,
            sample_size=len(monitoring_results),
        )

    def _calculate_citation_score(
        self,
        results: List[dict],
        citations: List[dict],
        industry: str
    ) -> float:
        """Calculate citation frequency score."""
        total_queries = len(results)
        queries_with_mention = len([r for r in results if r.get('brand_mentioned')])

        if total_queries == 0:
            return 0.0

        citation_rate = queries_with_mention / total_queries
        benchmark = self.BENCHMARKS.get(industry, self.BENCHMARKS['default'])

        # Normalize against benchmark
        normalized_rate = min(1.0, citation_rate / benchmark)

        # Apply recency decay for citations
        recency_factor = self._calculate_recency_factor(citations)

        return normalized_rate * 100 * recency_factor

    def _calculate_sentiment_score(self, citations: List[dict]) -> float:
        """Calculate sentiment score from citations."""
        if not citations:
            return 50.0  # Neutral baseline

        # Weighted average of sentiment scores
        weighted_sum = sum(
            c.get('sentiment_score', 0) * c.get('confidence_score', 1.0)
            for c in citations
        )
        total_weight = sum(c.get('confidence_score', 1.0) for c in citations)

        if total_weight == 0:
            return 50.0

        avg_sentiment = weighted_sum / total_weight  # -1 to 1 scale
        return 50 + (avg_sentiment * 50)  # Convert to 0-100

    def _calculate_recommendation_score(self, citations: List[dict]) -> float:
        """Calculate recommendation rate score."""
        if not citations:
            return 0.0

        direct_recs = len([c for c in citations if c.get('is_recommendation')])
        comparison_wins = len([
            c for c in citations
            if c.get('citation_type') == 'comparison' and
               c.get('sentiment') == 'positive'
        ])
        total_comparisons = len([
            c for c in citations if c.get('citation_type') == 'comparison'
        ])

        rec_rate = direct_recs / len(citations)
        win_rate = comparison_wins / total_comparisons if total_comparisons > 0 else 0

        return (0.6 * rec_rate + 0.4 * win_rate) * 100

    def _calculate_coverage_score(self, results: List[dict]) -> float:
        """Calculate AI system coverage score."""
        systems = set(r.get('ai_provider') for r in results)
        monitored_systems = {'openai', 'anthropic', 'google', 'perplexity', 'microsoft'}

        coverage = len(systems.intersection(monitored_systems)) / len(monitored_systems)

        # Calculate consistency across systems
        system_mention_rates = {}
        for system in systems:
            system_results = [r for r in results if r.get('ai_provider') == system]
            mentions = len([r for r in system_results if r.get('brand_mentioned')])
            system_mention_rates[system] = mentions / len(system_results) if system_results else 0

        if system_mention_rates:
            rates = list(system_mention_rates.values())
            consistency = 1 - np.std(rates) if len(rates) > 1 else 1.0
        else:
            consistency = 0

        return coverage * 80 + consistency * 20

    def _calculate_position_score(self, citations: List[dict]) -> float:
        """Calculate position score based on where brand appears in responses."""
        if not citations:
            return 0.0

        positions = [c.get('position_in_response', 0.5) for c in citations]
        avg_position = np.mean(positions)

        # Earlier position = higher score (assuming position is 0-1)
        return (1 - avg_position) * 100

    def _calculate_trend_score(
        self,
        results: List[dict],
        citations: List[dict],
        period_days: int
    ) -> float:
        """Calculate trend score comparing recent vs previous period."""
        from datetime import datetime, timedelta

        now = datetime.utcnow()
        mid_point = now - timedelta(days=period_days // 2)

        recent_mentions = len([
            r for r in results
            if r.get('brand_mentioned') and
               datetime.fromisoformat(r['time']) >= mid_point
        ])
        older_mentions = len([
            r for r in results
            if r.get('brand_mentioned') and
               datetime.fromisoformat(r['time']) < mid_point
        ])

        if older_mentions == 0:
            return 50.0 if recent_mentions == 0 else 75.0

        trend = (recent_mentions - older_mentions) / older_mentions
        trend_score = 50 + (trend * 50)

        return max(0, min(100, trend_score))

    def _calculate_per_system_scores(
        self,
        results: List[dict],
        citations: List[dict]
    ) -> Dict[str, float]:
        """Calculate visibility score per AI system."""
        systems = set(r.get('ai_provider') for r in results)
        scores = {}

        for system in systems:
            system_results = [r for r in results if r.get('ai_provider') == system]
            system_citations = [c for c in citations if c.get('source') == system]

            if system_results:
                mention_rate = len([r for r in system_results if r.get('brand_mentioned')]) / len(system_results)
                sentiment = np.mean([c.get('sentiment_score', 0) for c in system_citations]) if system_citations else 0
                scores[system] = round(mention_rate * 60 + (sentiment + 1) / 2 * 40, 2)
            else:
                scores[system] = 0

        return scores

    def _calculate_confidence(self, sample_size: int) -> float:
        """Calculate confidence level based on sample size."""
        # Confidence increases with sample size, asymptotically approaching 1.0
        return min(1.0, sample_size / 100)

    def _calculate_recency_factor(self, citations: List[dict]) -> float:
        """Apply decay for older citations."""
        from datetime import datetime, timedelta

        if not citations:
            return 1.0

        now = datetime.utcnow()
        decay_half_life = 7  # Days for 50% decay

        total_weight = 0
        for citation in citations:
            detected_at = datetime.fromisoformat(citation['detected_at'])
            days_old = (now - detected_at).days
            weight = 0.5 ** (days_old / decay_half_life)
            total_weight += weight

        return total_weight / len(citations) if citations else 1.0

    def _empty_score(self) -> VisibilityScore:
        """Return empty score when no data available."""
        return VisibilityScore(
            overall_score=0,
            components=VisibilityComponents(0, 50, 0, 0, 0, 50),
            breakdown={k: 0 for k in self.WEIGHTS},
            ai_system_scores={},
            confidence=0,
            sample_size=0,
        )
```

---

## 7.6 Content Analysis & Optimization

### 7.6.1 Content Analysis Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONTENT ANALYSIS PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT: User Content (Website, Blog, Documentation)                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STAGE 1: CONTENT EXTRACTION                                        │   │
│  │                                                                       │   │
│  │  • HTML parsing and cleaning                                        │   │
│  │  • Text extraction from various formats                             │   │
│  │  • Structure analysis (headings, lists, paragraphs)                │   │
│  │  • Metadata extraction                                              │   │
│  └────────────────────────────────────────────────────────────────────┬┘   │
│                                                                        │    │
│  ┌────────────────────────────────────────────────────────────────────▼┐   │
│  │  STAGE 2: SEMANTIC ANALYSIS                                         │   │
│  │                                                                       │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                   │   │
│  │  │  Topic Extraction   │  │  Entity Extraction  │                   │   │
│  │  │  (LDA + BERT)       │  │  (NER)              │                   │   │
│  │  └─────────────────────┘  └─────────────────────┘                   │   │
│  │                                                                       │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                   │   │
│  │  │  Keyword Extraction │  │  Readability Score  │                   │   │
│  │  │  (YAKE + TextRank)  │  │  (Flesch-Kincaid)   │                   │   │
│  │  └─────────────────────┘  └─────────────────────┘                   │   │
│  └────────────────────────────────────────────────────────────────────┬┘   │
│                                                                        │    │
│  ┌────────────────────────────────────────────────────────────────────▼┐   │
│  │  STAGE 3: AI OPTIMIZATION ANALYSIS                                  │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  GEO SCORE CALCULATION                                          │ │   │
│  │  │                                                                   │ │   │
│  │  │  • Clarity Score (0-100)                                        │ │   │
│  │  │    - Sentence structure complexity                              │ │   │
│  │  │    - Technical jargon usage                                     │ │   │
│  │  │    - Ambiguity detection                                        │ │   │
│  │  │                                                                   │ │   │
│  │  │  • Structure Score (0-100)                                      │ │   │
│  │  │    - Information hierarchy                                      │ │   │
│  │  │    - Logical flow                                               │ │   │
│  │  │    - Schema markup presence                                     │ │   │
│  │  │                                                                   │ │   │
│  │  │  • Completeness Score (0-100)                                   │ │   │
│  │  │    - Topic coverage                                             │ │   │
│  │  │    - FAQ coverage                                               │ │   │
│  │  │    - Feature documentation                                      │ │   │
│  │  │                                                                   │ │   │
│  │  │  • Authority Score (0-100)                                      │ │   │
│  │  │    - Citation presence                                          │ │   │
│  │  │    - Expert terminology                                         │ │   │
│  │  │    - Data/statistics usage                                      │ │   │
│  │  │                                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────────────────┬┘   │
│                                                                        │    │
│  ┌────────────────────────────────────────────────────────────────────▼┐   │
│  │  STAGE 4: RECOMMENDATION GENERATION                                 │   │
│  │                                                                       │   │
│  │  Using LLM to generate specific, actionable recommendations:        │   │
│  │                                                                       │   │
│  │  • Content gaps to fill                                             │   │
│  │  • Structure improvements                                            │   │
│  │  • Clarity enhancements                                              │   │
│  │  • Authority building suggestions                                    │   │
│  │  • AI-friendly formatting tips                                       │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  OUTPUT: Optimization Report with Prioritized Recommendations              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7.7 Model Training & MLOps

### 7.7.1 Training Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MODEL TRAINING PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DATA COLLECTION                                                    │   │
│  │                                                                       │   │
│  │  Sources:                                                            │   │
│  │  • AI monitoring responses (labeled by analysts)                    │   │
│  │  • User feedback on citation accuracy                               │   │
│  │  • Manually annotated brand mentions                                │   │
│  │  • Synthetic data generation                                        │   │
│  │                                                                       │   │
│  │  Volume:                                                             │   │
│  │  • NER Model: 50,000+ labeled entities                              │   │
│  │  • Sentiment: 100,000+ labeled sentences                            │   │
│  │  • Citation: 20,000+ labeled citations                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DATA PROCESSING                                                    │   │
│  │                                                                       │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │   Clean   │─▶│   Split   │─▶│ Augment   │─▶│ Validate  │        │   │
│  │  │   Data    │  │ Train/Val │  │   Data    │  │   Data    │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  │                                                                       │   │
│  │  Augmentation Techniques:                                           │   │
│  │  • Back translation                                                 │   │
│  │  • Synonym replacement                                              │   │
│  │  • Entity swapping                                                  │   │
│  │  • Sentence shuffling                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MODEL TRAINING                                                     │   │
│  │                                                                       │   │
│  │  Infrastructure:                                                    │   │
│  │  • AWS SageMaker Training Jobs                                      │   │
│  │  • GPU: ml.g5.2xlarge (NVIDIA A10G)                                │   │
│  │  • Distributed training for large models                           │   │
│  │                                                                       │   │
│  │  Hyperparameter Tuning:                                             │   │
│  │  • Bayesian optimization                                            │   │
│  │  • Early stopping                                                   │   │
│  │  • Learning rate scheduling                                         │   │
│  │                                                                       │   │
│  │  Experiment Tracking:                                               │   │
│  │  • MLflow for metrics                                               │   │
│  │  • DVC for data versioning                                          │   │
│  │  • Weights & Biases integration                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MODEL EVALUATION                                                   │   │
│  │                                                                       │   │
│  │  Metrics:                                                           │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  NER Model                                                     │  │   │
│  │  │  • Precision: >= 0.92                                          │  │   │
│  │  │  • Recall: >= 0.88                                             │  │   │
│  │  │  • F1-Score: >= 0.90                                           │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Sentiment Model                                               │  │   │
│  │  │  • Accuracy: >= 0.88                                           │  │   │
│  │  │  • Macro F1: >= 0.85                                           │  │   │
│  │  │  • Cohen's Kappa: >= 0.80                                      │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Citation Model                                                │  │   │
│  │  │  • Precision: >= 0.90                                          │  │   │
│  │  │  • Recall: >= 0.85                                             │  │   │
│  │  │  • MAP@5: >= 0.75                                              │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MODEL DEPLOYMENT                                                   │   │
│  │                                                                       │   │
│  │  Deployment Strategy:                                               │   │
│  │  • Canary deployment (5% → 25% → 50% → 100%)                       │   │
│  │  • Shadow mode testing                                              │   │
│  │  • Automatic rollback on degradation                               │   │
│  │                                                                       │   │
│  │  Serving:                                                           │   │
│  │  • TorchServe on EKS                                               │   │
│  │  • Model batching for efficiency                                   │   │
│  │  • GPU auto-scaling                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.7.2 Model Registry

```yaml
# MLflow Model Registry Configuration

models:
  brand-ner-v1:
    name: brand-entity-recognizer
    stage: Production
    version: 3.2.1
    framework: pytorch
    base_model: microsoft/deberta-v3-base
    metrics:
      precision: 0.934
      recall: 0.912
      f1: 0.923
    artifacts:
      - model.pt
      - tokenizer/
      - config.json
    serving:
      instance_type: ml.g4dn.xlarge
      min_instances: 2
      max_instances: 10
      batch_size: 32

  sentiment-analyzer-v1:
    name: brand-sentiment-analyzer
    stage: Production
    version: 2.1.0
    framework: pytorch
    base_model: cardiffnlp/twitter-roberta-base-sentiment-latest
    metrics:
      accuracy: 0.891
      macro_f1: 0.867
    artifacts:
      - model.pt
      - tokenizer/
      - config.json
    serving:
      instance_type: ml.g4dn.xlarge
      min_instances: 2
      max_instances: 8
      batch_size: 64

  citation-extractor-v1:
    name: citation-extractor
    stage: Production
    version: 1.5.0
    framework: pytorch
    base_model: bert-base-uncased
    metrics:
      precision: 0.915
      recall: 0.878
    serving:
      instance_type: ml.g4dn.xlarge
      min_instances: 1
      max_instances: 5
      batch_size: 16
```

---

## 7.8 Vector Database & Embeddings

### 7.8.1 Embedding Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMBEDDING ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  EMBEDDING MODELS                                                          │
│  ────────────────                                                           │
│                                                                             │
│  Primary: OpenAI text-embedding-3-large                                    │
│  • Dimensions: 3072                                                        │
│  • Best for: Semantic similarity, citation matching                        │
│  • Cost: $0.00013 per 1K tokens                                           │
│                                                                             │
│  Secondary: Cohere embed-english-v3.0                                      │
│  • Dimensions: 1024                                                        │
│  • Best for: Fast retrieval, clustering                                   │
│  • Cost: $0.0001 per 1K tokens                                            │
│                                                                             │
│  Local: all-MiniLM-L6-v2 (Sentence Transformers)                          │
│  • Dimensions: 384                                                         │
│  • Best for: Real-time processing, high volume                            │
│  • Cost: Infrastructure only                                               │
│                                                                             │
│  VECTOR DATABASE (pgvector)                                                │
│  ──────────────────────────                                                 │
│                                                                             │
│  Schema:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CREATE TABLE embeddings (                                          │   │
│  │    id UUID PRIMARY KEY,                                             │   │
│  │    content_type VARCHAR(50),  -- 'citation', 'content', 'prompt'   │   │
│  │    source_id UUID,                                                  │   │
│  │    workspace_id UUID,                                               │   │
│  │    text TEXT,                                                       │   │
│  │    embedding VECTOR(3072),                                          │   │
│  │    metadata JSONB,                                                  │   │
│  │    created_at TIMESTAMPTZ                                          │   │
│  │  );                                                                 │   │
│  │                                                                       │   │
│  │  CREATE INDEX ON embeddings                                         │   │
│  │    USING ivfflat (embedding vector_cosine_ops)                     │   │
│  │    WITH (lists = 100);                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USE CASES                                                                 │
│  ─────────                                                                  │
│                                                                             │
│  1. Similar Citation Search                                                │
│     • Find citations similar to a given citation                           │
│     • Cluster related brand mentions                                       │
│                                                                             │
│  2. Content Matching                                                       │
│     • Match user content to AI responses                                  │
│     • Identify content gaps                                               │
│                                                                             │
│  3. Competitive Analysis                                                   │
│     • Find similar competitor mentions                                    │
│     • Compare brand positioning                                           │
│                                                                             │
│  4. Prompt Optimization                                                    │
│     • Find effective prompts by similarity                                │
│     • Cluster prompts by intent                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7.9 AI Cost Management

### 7.9.1 Cost Tracking & Optimization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AI COST MANAGEMENT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  COST TRACKING                                                             │
│  ─────────────                                                              │
│                                                                             │
│  Per-Request Tracking:                                                     │
│  • Provider + Model                                                        │
│  • Token usage (prompt + completion)                                      │
│  • Cost calculation                                                        │
│  • Workspace attribution                                                   │
│                                                                             │
│  Cost Calculation:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Provider  │ Model          │ Input/1K  │ Output/1K │ Est. Monthly  │   │
│  ├────────────┼────────────────┼───────────┼───────────┼───────────────┤   │
│  │  OpenAI    │ gpt-4-turbo    │ $0.01     │ $0.03     │ $25,000       │   │
│  │  OpenAI    │ gpt-4o         │ $0.005    │ $0.015    │ $15,000       │   │
│  │  OpenAI    │ gpt-3.5-turbo  │ $0.0005   │ $0.0015   │ $2,000        │   │
│  │  Anthropic │ claude-3-opus  │ $0.015    │ $0.075    │ $20,000       │   │
│  │  Anthropic │ claude-3-sonnet│ $0.003    │ $0.015    │ $8,000        │   │
│  │  Google    │ gemini-1.5-pro │ $0.0025   │ $0.0075   │ $5,000        │   │
│  │  Perplexity│ pplx-70b-online│ $0.001    │ $0.001    │ $3,000        │   │
│  │            │                │           │           │               │   │
│  │  Embeddings│ text-embed-3   │ $0.00013  │ N/A       │ $2,000        │   │
│  │            │                │           │           │               │   │
│  │  TOTAL EST.│                │           │           │ $80,000/mo    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  OPTIMIZATION STRATEGIES                                                   │
│  ───────────────────────                                                    │
│                                                                             │
│  1. Response Caching                                                       │
│     • Cache identical prompts                                              │
│     • TTL: 1 hour for monitoring queries                                  │
│     • Expected savings: 20-30%                                            │
│                                                                             │
│  2. Model Selection                                                        │
│     • Use smaller models for simple tasks                                 │
│     • Route by complexity                                                 │
│     • Expected savings: 15-25%                                            │
│                                                                             │
│  3. Prompt Optimization                                                    │
│     • Minimize prompt token usage                                         │
│     • Use few-shot over lengthy instructions                              │
│     • Expected savings: 10-20%                                            │
│                                                                             │
│  4. Batching                                                               │
│     • Batch similar requests                                              │
│     • Reduce API call overhead                                            │
│     • Expected savings: 5-10%                                             │
│                                                                             │
│  5. Provider Arbitrage                                                     │
│     • Route to cheaper providers when acceptable                          │
│     • Use fallbacks strategically                                         │
│     • Expected savings: 10-15%                                            │
│                                                                             │
│  BUDGET CONTROLS                                                           │
│  ───────────────                                                            │
│                                                                             │
│  • Daily budget alerts per workspace                                       │
│  • Automatic throttling at 80% of limit                                   │
│  • Hard stop at 100% of limit                                             │
│  • Executive alerts for unusual spend                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0*
*Last Updated: 2026-06-28*
*Next Review: 2026-07-28*
