import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildActivity, isNew, type ActivityEvent } from "@/lib/activity";

const SEEN_KEY = "stucollab:activity-last-seen";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [
    { title: "Activity — StuCollab" },
    { name: "description", content: "New applications on your projects and decisions on your applications." },
    { property: "og:title", content: "Activity — StuCollab" },
    { property: "og:description", content: "New applications on your projects and decisions on your applications." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Activity,
});

async function fetchActivity() {
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  if (!userId) return [];
  const sel = "id, applicant_id, status, created_at, updated_at, post:collaboration_posts!applications_post_id_fkey!inner(id, title, owner_id), applicant:profiles!applications_applicant_profile_fkey(full_name)";
  const [received, mine] = await Promise.all([
    supabase.from("applications").select(sel).eq("post.owner_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("applications").select(sel).eq("applicant_id", userId).neq("status", "pending").order("updated_at", { ascending: false }).limit(50),
  ]);
  if (received.error) throw received.error;
  if (mine.error) throw mine.error;
  return buildActivity(userId, (received.data ?? []) as never, (mine.data ?? []) as never);
}

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

function Line({ e }: { e: ActivityEvent }) {
  if (e.kind === "applied") return <>
    <Link to="/profile/$userId" params={{ userId: e.personId! }} className="font-semibold text-ink hover:text-coral">{e.personName}</Link> applied to your project{" "}
    <Link to="/posts/$postId" params={{ postId: e.postId }} className="font-semibold text-ink hover:text-coral">{e.postTitle}</Link>
  </>;
  return <>
    Your application to <Link to="/posts/$postId" params={{ postId: e.postId }} className="font-semibold text-ink hover:text-coral">{e.postTitle}</Link> was{" "}
    <span className={e.kind === "accepted" ? "font-semibold text-sage" : "font-semibold text-coral"}>{e.kind}</span>
  </>;
}

function Activity() {
  const { data: events = [], isLoading } = useQuery({ queryKey: ["activity"], queryFn: fetchActivity });
  const [lastSeen, setLastSeen] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setLastSeen(localStorage.getItem(SEEN_KEY));
    return () => localStorage.setItem(SEEN_KEY, new Date().toISOString());
  }, []);

  const newCount = lastSeen === undefined ? 0 : events.filter((e) => isNew(e, lastSeen)).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-5xl font-black mb-2">Your <em className="italic text-coral">activity</em></h1>
      <p className="text-muted mb-8">
        {lastSeen === undefined || isLoading ? "\u00a0" : newCount > 0 ? `${newCount} new since your last visit.` : "Nothing new since your last visit."}
      </p>
      {isLoading ? <p className="text-muted">Loading…</p> : events.length === 0 ? (
        <div className="text-center bg-white border-2 border-dashed border-edge rounded-3xl py-16 px-6">
          <p className="text-muted mb-4">No activity yet. Post a project or apply to one and updates will show up here.</p>
          <Link to="/dashboard" className="inline-flex font-semibold text-white bg-coral px-5 py-2.5 rounded-full">Browse projects →</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const fresh = lastSeen !== undefined && isNew(e, lastSeen);
            return (
              <li key={e.id} className={`bg-white rounded-2xl px-5 py-4 border-2 flex items-start justify-between gap-4 ${fresh ? "border-coral" : "border-edge"}`}>
                <p className="text-sm text-muted leading-relaxed"><Line e={e} /></p>
                <div className="flex items-center gap-2 shrink-0">
                  {fresh && <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-coral px-2 py-0.5 rounded-full">New</span>}
                  <span className="text-xs text-muted">{ago(e.at)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
