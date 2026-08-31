function splitListSegment(segment: string): string[] {
  return segment
    .split(/,|\band\b|\bor\b/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function findBrandIndexInSegments(segments: string[], brandName: string): number | null {
  const lower = brandName.toLowerCase();
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].toLowerCase().includes(lower)) return i + 1;
  }
  return null;
}

/**
 * Detects a ranking implied by explicit prose language when no numbered or
 * bulleted list is present — e.g. "I recommend X over Y", "Top choices are
 * X, Y, and Z", "X is the best option, followed by Y". Returns null when no
 * ranking language is found; never guesses a position.
 */
// Matches "rest of sentence": any run of characters up to a period/!/? that
// is itself followed by whitespace or end-of-string (a real sentence
// terminator), a newline, or the end of input. Deliberately does NOT stop at
// a mid-word period like the one in "Monday.com", unlike a plain
// `[^.!?]+` character class would.
const REST_OF_SENTENCE = "[^\\n]+?(?=[.!?](?:\\s|$)|\\n|$)";

function detectProseRankPosition(response: string, brandName: string): number | null {
  // Split on sentence boundaries (lookbehind keeps the terminator with the
  // preceding sentence). Only splits on a terminator followed by whitespace,
  // so it won't break on a mid-word period like "Monday.com".
  const sentences = response.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    // "recommend X over Y [over Z...]"
    const overMatch = sentence.match(new RegExp(`\\brecommend(?:s|ed|ing)?\\s+(${REST_OF_SENTENCE})`, "i"));
    if (overMatch && /\bover\b/i.test(overMatch[1])) {
      const segments = overMatch[1].split(/\bover\b/i).flatMap(splitListSegment);
      const idx = findBrandIndexInSegments(segments, brandName);
      if (idx !== null) return idx;
    }

    // "Top choices/best options are/include: X, Y, Z"
    const listMatch = sentence.match(
      new RegExp(
        `\\b(?:top choices?|best options?|top picks?|best picks?|top recommendations?)\\s*(?:are|include|includes|is|:)\\s*(${REST_OF_SENTENCE})`,
        "i"
      )
    );
    if (listMatch) {
      const segments = splitListSegment(listMatch[1]);
      const idx = findBrandIndexInSegments(segments, brandName);
      if (idx !== null) return idx;
    }

    // "X is the best option, followed by Y[, Z...]"
    const followedMatch = sentence.match(
      new RegExp(
        `(${REST_OF_SENTENCE}?)\\s+is\\s+(?:the\\s+)?(?:best|top|#1|number one)[^\\n]*?,?\\s*followed by\\s+(${REST_OF_SENTENCE})`,
        "i"
      )
    );
    if (followedMatch) {
      const segments = [...splitListSegment(followedMatch[1]), ...splitListSegment(followedMatch[2])];
      const idx = findBrandIndexInSegments(segments, brandName);
      if (idx !== null) return idx;
    }
  }

  return null;
}

export function detectPosition(response: string, brandName: string | null): number | null {
  if (!brandName) return null;

  const lines = response.split("\n");
  const listPatterns = [
    /^(\d+)[.)\-]\s*(.+)/, // "1. Item" or "1) Item" or "1- Item"
    /^\*\s*(\d+)[.)\-]?\s*(.+)/, // "* 1. Item"
    /^[-•]\s*(.+)/, // "- Item" or "• Item" (will check position in list)
  ];

  let bulletPosition = 0;
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check numbered patterns
    const numberedMatch = trimmedLine.match(listPatterns[0]);
    if (numberedMatch) {
      if (trimmedLine.toLowerCase().includes(brandName.toLowerCase())) {
        return parseInt(numberedMatch[1]);
      }
    }

    // Check bullet patterns (count position)
    const bulletMatch = trimmedLine.match(listPatterns[2]);
    if (bulletMatch) {
      bulletPosition++;
      if (trimmedLine.toLowerCase().includes(brandName.toLowerCase())) {
        return bulletPosition;
      }
    } else if (!trimmedLine) {
      bulletPosition = 0; // Reset for new list
    }
  }

  // No numbered/bulleted list matched — fall back to explicit ranking
  // language in prose. Still returns null (not a guessed position) when
  // nothing matches.
  return detectProseRankPosition(response, brandName);
}

export function findCompetitorPositions(
  response: string,
  competitors: Array<{ name: string }>
): Record<string, number | null> {
  const positions: Record<string, number | null> = {};

  for (const competitor of competitors) {
    positions[competitor.name] = detectPosition(response, competitor.name);
  }

  return positions;
}
