import { describe, it, expect } from "vitest";
import { daysUntil, deadlineLabel } from "./deadline";
const now = new Date(2026, 9, 14);
describe("deadline", () => {
  it("counts days", () => expect(daysUntil("2026-10-16", now)).toBe(2));
  it("today", () => expect(deadlineLabel(daysUntil("2026-10-14", now))?.text).toBe("Closes today"));
  it("hides beyond a week", () => expect(deadlineLabel(8)).toBeNull());
  it("3 days is urgent, 5 is not", () => { expect(deadlineLabel(3)?.urgent).toBe(true); expect(deadlineLabel(5)?.urgent).toBe(false); });
});
