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

  return null;
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
