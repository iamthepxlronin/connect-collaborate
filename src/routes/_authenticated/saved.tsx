import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/stucollab-api";
import { SaveButton, useSavedIds } from "@/components/save-button";
import { DeadlineBadge } from "@/components/deadline-badge";
import { daysUntil } from "@/lib/deadline";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [
    { title: "Saved projects — StuCollab" },
    { name: "description", content: "Projects you bookmarked to revisit on StuCollab." },
    { property: "og:title", content: "Saved projects — StuCollab" },
    { property: "og:description", content: "Projects you bookmarked to revisit on StuCollab." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Saved,
});

function Saved() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });
  const { data: ids = [] } = useSavedIds();
  const saved = posts
    .filter((p) => ids.includes(p.id))
    .sort((a, b) => (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-5xl font-black mb-2">Saved <em className="italic text-coral">projects</em></h1>
      <p className="text-muted mb-8">Closest deadlines first, so you don't miss your chance to apply.</p>
      {isLoading ? <p className="text-muted">Loading…</p> : saved.length === 0 ? (
        <div className="text-center bg-white border-2 border-dashed border-edge rounded-3xl py-16 px-6">
          <p className="text-muted mb-4">Nothing saved yet. Tap the bookmark on any project to keep it here.</p>
          <Link to="/dashboard" className="inline-flex font-semibold text-white bg-coral px-5 py-2.5 rounded-full">Browse projects →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {saved.map((p) => (
            <Link key={p.id} to="/posts/$postId" params={{ postId: p.id }} className="bg-white rounded-3xl p-6 border-2 border-edge hover:border-coral transition flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sage">{p.category}</span>
                <div className="flex items-center gap-2"><DeadlineBadge deadline={p.status === "open" ? p.deadline : null} /><SaveButton postId={p.id} /></div>
              </div>
              <h3 className="font-serif text-2xl font-bold">{p.title}</h3>
              {p.status !== "open" && <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-cream text-muted">No longer accepting applicants ({p.status})</span>}
              <p className="text-xs text-muted">by <span className="font-semibold text-ink">{p.owner?.full_name ?? "Unknown"}</span></p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
