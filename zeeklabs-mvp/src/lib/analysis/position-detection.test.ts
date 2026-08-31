import { describe, it, expect } from "vitest";
import { detectPosition, findCompetitorPositions } from "./position-detection";

describe("detectPosition — list-based", () => {
  it("detects a numbered list position", () => {
    expect(detectPosition("1. HubSpot\n2. Salesforce\n3. Zoho", "Salesforce")).toBe(2);
  });

  it("detects a bulleted list position", () => {
    expect(detectPosition("- HubSpot\n- Salesforce\n- Zoho", "Zoho")).toBe(3);
  });

  it("returns null when the brand is not in the list", () => {
    expect(detectPosition("1. HubSpot\n2. Salesforce", "Zoho")).toBeNull();
  });

  it("returns null (not a fabricated position) for plain prose with no ranking language", () => {
    expect(detectPosition("HubSpot is a good option. Salesforce is also widely used.", "HubSpot")).toBeNull();
  });
});

describe("detectPosition — prose ranking language", () => {
  it("detects 'recommend X over Y' as X=1, Y=2", () => {
    const text = "I recommend HubSpot over Salesforce and Zoho for small teams.";
    expect(detectPosition(text, "HubSpot")).toBe(1);
    expect(detectPosition(text, "Salesforce")).toBe(2);
    expect(detectPosition(text, "Zoho")).toBe(3);
  });

  it("detects 'Top choices are X, Y, Z' ordering", () => {
    const text = "Top choices are Notion, ClickUp, and Asana for project management.";
    expect(detectPosition(text, "Notion")).toBe(1);
    expect(detectPosition(text, "ClickUp")).toBe(2);
    expect(detectPosition(text, "Asana")).toBe(3);
  });

  it("detects 'X is the best option, followed by Y' ordering, including names with periods", () => {
    const text = "Asana is the best option, followed by Monday.com and Trello.";
    expect(detectPosition(text, "Asana")).toBe(1);
    expect(detectPosition(text, "Monday.com")).toBe(2);
    expect(detectPosition(text, "Trello")).toBe(3);
  });

  it("returns null when brand name is null", () => {
    expect(detectPosition("Top choices are X, Y, Z.", null)).toBeNull();
  });
});

describe("findCompetitorPositions", () => {
  it("returns a position per competitor, null for those not found", () => {
    const text = "1. HubSpot\n2. Salesforce";
    const result = findCompetitorPositions(text, [{ name: "HubSpot" }, { name: "Zoho" }]);
    expect(result).toEqual({ HubSpot: 1, Zoho: null });
  });
});
