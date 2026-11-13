import { describe, expect, it } from "vitest";
import { canWithdrawApplication } from "./application-actions";

describe("application withdrawal", () => {
  it("allows withdrawal only while an application is pending", () => {
    expect(canWithdrawApplication("pending")).toBe(true);
    expect(canWithdrawApplication("accepted")).toBe(false);
    expect(canWithdrawApplication("rejected")).toBe(false);
  });
});