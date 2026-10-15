import { describe, it, expect } from "vitest";
import { buildActivity, isNew } from "./activity";

const post = (owner: string) => ({ id: "p1", title: "T", owner_id: owner });

describe("activity feed", () => {
  it("shows applications only on posts I own", () => {
    const ev = buildActivity("me", [
      { id: "a", applicant_id: "x", status: "pending", created_at: "2026-01-02", updated_at: "2026-01-02", post: post("me") },
      { id: "b", applicant_id: "x", status: "accepted", created_at: "2026-01-03", updated_at: "2026-01-03", post: post("other") },
    ], []);
    expect(ev.map((e) => e.id)).toEqual(["in-a"]);
  });
  it("ignores my pending applications, includes decisions newest first", () => {
    const ev = buildActivity("me", [], [
      { id: "a", applicant_id: "me", status: "pending", created_at: "2026-01-01", updated_at: "2026-01-01", post: post("o") },
      { id: "b", applicant_id: "me", status: "rejected", created_at: "2026-01-01", updated_at: "2026-01-02", post: post("o") },
      { id: "c", applicant_id: "me", status: "accepted", created_at: "2026-01-01", updated_at: "2026-01-05", post: post("o") },
    ]);
    expect(ev.map((e) => e.kind)).toEqual(["accepted", "rejected"]);
  });
  it("marks events after last visit as new", () => {
    const e = { id: "x", kind: "applied" as const, at: "2026-01-05T00:00:00Z", postId: "p", postTitle: "t" };
    expect(isNew(e, "2026-01-04T00:00:00Z")).toBe(true);
    expect(isNew(e, "2026-01-06T00:00:00Z")).toBe(false);
  });
});
