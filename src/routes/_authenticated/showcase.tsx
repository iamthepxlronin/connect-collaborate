import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Github, ExternalLink } from "lucide-react";
import { fetchPosts } from "@/lib/stucollab-api";

export const Route = createFileRoute("/_authenticated/showcase")({
  head: () => ({
    meta: [
      { title: "Shipped on StuCollab — Showcase" },
      { name: "description", content: "Projects student teams finished and shipped together on StuCollab." },
      { property: "og:title", content: "Shipped on StuCollab — Showcase" },
      { property: "og:description", content: "Projects student teams finished and shipped together on StuCollab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Showcase,
});

function Showcase() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });
  const shipped = posts
    .filter((p) => p.status === "completed")
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber mb-2 flex items-center gap-1.5">
          <Trophy className="w-4 h-4" /> Hall of fame
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-black">Shipped on StuCollab</h1>
        <p className="text-muted mt-2">Real projects student teams finished together.</p>
      </div>

      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : shipped.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-edge p-10 text-center">
          <p className="font-serif text-2xl font-bold mb-2">Nothing shipped yet</p>
          <p className="text-muted text-sm">When a team finishes a project, it lands here. Be the first.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shipped.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl border-2 border-amber/50 p-6 flex flex-col shadow-sm">
              <span className="self-start inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber bg-amber/15 px-2.5 py-1 rounded-full mb-3">
                <Trophy className="w-3 h-3" /> Shipped
              </span>
              <Link to="/posts/$postId" params={{ postId: p.id }} className="font-serif text-xl font-bold hover:text-coral transition mb-2">
                {p.title}
              </Link>
              <p className="text-sm text-ink/80 line-clamp-3 mb-3 flex-1">{p.outcome_summary ?? p.description}</p>
              <p className="text-xs text-muted mb-4">Led by {p.owner ? <Link to="/profile/$userId" params={{ userId: p.owner.id }} className="font-semibold text-ink hover:text-coral">{p.owner.full_name}</Link> : "—"}</p>
              <div className="flex flex-wrap gap-2">
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-ink text-paper hover:opacity-90">
                    <Github className="w-3.5 h-3.5" /> Code
                  </a>
                )}
                {p.demo_url && (
                  <a href={p.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-edge hover:bg-cream">
                    <ExternalLink className="w-3.5 h-3.5" /> Live demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
