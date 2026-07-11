/**
 * Text utility functions for cleaning AI-generated content
 */

/**
 * Clean markdown formatting from text
 * Removes **, *, _, #, etc. and returns plain text
 */
export function cleanMarkdown(text: string): string {
  if (!text) return "";

  return text
    // Remove bold markers **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    // Remove italic markers *text* or _text_
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove headers # ## ### etc
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bullet points - or * at start of line
    .replace(/^[-*•]\s+/gm, "")
    // Remove numbered lists 1. 2. etc
    .replace(/^\d+\.\s+/gm, "")
    // Remove code blocks ```
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code `text`
    .replace(/`([^`]+)`/g, "$1")
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove remaining standalone asterisks or underscores
    .replace(/(?<!\w)[*_]+|[*_]+(?!\w)/g, "")
    // Clean up extra whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Clean an array of strings from markdown
 */
export function cleanMarkdownArray(items: string[]): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => cleanMarkdown(item));
}

/**
 * Clean all string fields in an object recursively
 */
export function cleanMarkdownInObject<T>(obj: T): T {
  if (!obj) return obj;

  if (typeof obj === "string") {
    return cleanMarkdown(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanMarkdownInObject(item)) as T;
  }

  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanMarkdownInObject(value);
    }
    return cleaned as T;
  }

  return obj;
}
