import { describe, expect, it } from "vitest";
import { canWithdrawApplication, postRequiresSkill } from "./application-actions";

describe("application withdrawal", () => {
  it("allows withdrawal only while an application is pending", () => {
    expect(canWithdrawApplication("pending")).toBe(true);
    expect(canWithdrawApplication("accepted")).toBe(false);
    expect(canWithdrawApplication("rejected")).toBe(false);
  });
});

describe("skill filter", () => {
  it("matches required skills without case sensitivity", () => {
    expect(postRequiresSkill(["React", "SQL"], "react")).toBe(true);
    expect(postRequiresSkill(["React", "SQL"], "Python")).toBe(false);
    expect(postRequiresSkill(["React"], "")).toBe(true);
  });
});