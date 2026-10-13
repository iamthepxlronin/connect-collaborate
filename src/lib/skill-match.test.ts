import { describe, it, expect } from "vitest";
import { skillMatch } from "./skill-match";

describe("skillMatch", () => {
  it("is 50% when user has 2 of 4 required skills", () => {
    expect(skillMatch(["React", "Python"], ["React", "Python", "SQL", "Figma"])).toBe(50);
  });
  it("is 0% with no overlap", () => {
    expect(skillMatch(["Java"], ["React"])).toBe(0);
  });
  it("is null when the post needs no skills", () => {
    expect(skillMatch(["React"], [])).toBeNull();
  });
});
