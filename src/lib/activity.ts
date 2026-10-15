export type ActivityEvent = {
  id: string;
  kind: "applied" | "accepted" | "rejected";
  at: string;
  postId: string;
  postTitle: string;
  personId?: string;
  personName?: string;
};

type RawApp = {
  id: string;
  applicant_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  post: { id: string; title: string; owner_id: string } | null;
  applicant?: { full_name: string } | null;
};

/** Merge applications to my posts + decisions on my applications into one newest-first feed. */
export function buildActivity(userId: string, received: RawApp[], mine: RawApp[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const a of received) {
    if (!a.post || a.post.owner_id !== userId || a.applicant_id === userId) continue;
    events.push({ id: `in-${a.id}`, kind: "applied", at: a.created_at, postId: a.post.id, postTitle: a.post.title, personId: a.applicant_id, personName: a.applicant?.full_name || "Someone" });
  }
  for (const a of mine) {
    if (!a.post || a.applicant_id !== userId) continue;
    if (a.status !== "accepted" && a.status !== "rejected") continue;
    events.push({ id: `out-${a.id}`, kind: a.status, at: a.updated_at, postId: a.post.id, postTitle: a.post.title });
  }
  return events.sort((x, y) => y.at.localeCompare(x.at));
}

export function isNew(event: ActivityEvent, lastSeen: string | null) {
  return !lastSeen || event.at > lastSeen;
}
