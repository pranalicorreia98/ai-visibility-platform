export interface Mention {
  term: string;
  position: number;
  context: string;
  isCompetitor: boolean;
  competitorName?: string;
}

export interface Brand {
  name: string;
  alternateNames?: string | string[] | null;
  competitors?: Array<{ name: string }>;
}

// Escape special regex characters in a string to prevent regex injection
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectMentions(response: string, brand: Brand | null): Mention[] {
  if (!brand) return [];

  const mentions: Mention[] = [];
  const alternateNames = typeof brand.alternateNames === 'string'
    ? JSON.parse(brand.alternateNames) as string[]
    : (brand.alternateNames || []);
  const brandTerms = [brand.name, ...alternateNames];

  // Detect brand mentions
  for (const term of brandTerms) {
    // Escape regex special characters to prevent crashes on brand names like "C++" or "AT&T"
    const escapedTerm = escapeRegex(term);
    const regex = new RegExp(escapedTerm, "gi");
    let match;
    while ((match = regex.exec(response)) !== null) {
      mentions.push({
        term: match[0],
        position: match.index,
        context: response.slice(
          Math.max(0, match.index - 50),
          Math.min(response.length, match.index + term.length + 50)
        ),
        isCompetitor: false,
      });
    }
  }

  // Detect competitor mentions
  if (brand.competitors) {
    for (const competitor of brand.competitors) {
      // Escape regex special characters for competitor names too
      const escapedName = escapeRegex(competitor.name);
      const regex = new RegExp(escapedName, "gi");
      let match;
      while ((match = regex.exec(response)) !== null) {
        mentions.push({
          term: match[0],
          position: match.index,
          context: response.slice(
            Math.max(0, match.index - 50),
            Math.min(response.length, match.index + competitor.name.length + 50)
          ),
          isCompetitor: true,
          competitorName: competitor.name,
        });
      }
    }
  }

  return mentions;
}

export function highlightMentions(
  response: string,
  brandName: string | null,
  mentions: Mention[]
): string {
  if (!brandName || mentions.length === 0) return response;

  let highlighted = response;

  // Sort mentions by position (descending) to avoid position shifts
  const sortedMentions = [...mentions].sort((a, b) => b.position - a.position);

  for (const mention of sortedMentions) {
    const before = highlighted.slice(0, mention.position);
    const term = highlighted.slice(mention.position, mention.position + mention.term.length);
    const after = highlighted.slice(mention.position + mention.term.length);

    if (mention.isCompetitor) {
      highlighted = `${before}<mark class="bg-red-200 dark:bg-red-900">${term}</mark>${after}`;
    } else {
      highlighted = `${before}<mark class="bg-yellow-200 dark:bg-yellow-900">${term}</mark>${after}`;
    }
  }

  return highlighted;
}
