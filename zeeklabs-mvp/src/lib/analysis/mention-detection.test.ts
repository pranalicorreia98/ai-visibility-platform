import { describe, it, expect } from "vitest";
import { detectMentions } from "./mention-detection";

describe("detectMentions — regex-escape safety", () => {
  it("does not crash and correctly matches a brand name containing regex special characters ('C++')", () => {
    const response = "C++ is a popular systems programming language.";
    const mentions = detectMentions(response, { name: "C++" });
    expect(mentions).toHaveLength(1);
    expect(mentions[0].term).toBe("C++");
    expect(mentions[0].isCompetitor).toBe(false);
  });

  it("does not crash and correctly matches a brand name containing an ampersand ('AT&T')", () => {
    const response = "AT&T offers wireless plans nationwide.";
    const mentions = detectMentions(response, { name: "AT&T" });
    expect(mentions).toHaveLength(1);
    expect(mentions[0].term).toBe("AT&T");
  });

  it("handles brand names with parentheses without throwing", () => {
    expect(() => detectMentions("Some text mentioning Acme (Inc).", { name: "Acme (Inc)" })).not.toThrow();
  });
});

describe("detectMentions — brand vs competitor tagging", () => {
  it("tags brand mentions as isCompetitor: false", () => {
    const mentions = detectMentions("MyBrand is great.", { name: "MyBrand" });
    expect(mentions[0].isCompetitor).toBe(false);
  });

  it("tags competitor mentions as isCompetitor: true with the competitor name", () => {
    const mentions = detectMentions("MyBrand and CompetitorX are both good.", {
      name: "MyBrand",
      competitors: [{ name: "CompetitorX" }],
    });
    const competitorMention = mentions.find((m) => m.isCompetitor);
    expect(competitorMention).toBeDefined();
    expect(competitorMention?.competitorName).toBe("CompetitorX");
  });

  it("returns an empty array when brand is null", () => {
    expect(detectMentions("Some text", null)).toEqual([]);
  });

  it("finds multiple mentions of the same term", () => {
    const mentions = detectMentions("HubSpot is great. I really like HubSpot.", { name: "HubSpot" });
    expect(mentions).toHaveLength(2);
  });
});
