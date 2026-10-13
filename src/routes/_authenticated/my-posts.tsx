import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { fetchMyPosts } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/my-posts")({
  head: () => ({ meta: [{ title: "My projects — StuCollab" }] }),
  component: MyPosts,
});

function MyPosts() {
  const { user } = useCurrentUser();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["my-posts", user?.id],
    queryFn: () => fetchMyPosts(user!.id),
    enabled: !!user,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl font-black">My <em className="italic text-coral">projects</em></h1>
          <p className="text-muted mt-1">Manage projects you've posted.</p>
        </div>
        <Link to="/posts/new" className="inline-flex items-center gap-2 font-semibold text-white bg-coral px-5 py-2.5 rounded-full hover:-translate-y-0.5 transition">
          <Plus className="w-4 h-4" /> New project
        </Link>
      </div>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-edge rounded-3xl py-16 text-center">
          <p className="text-muted mb-4">You haven't posted anything yet.</p>
          <Link to="/posts/new" className="font-semibold text-coral hover:underline">Post your first project →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map((p) => (
            <Link key={p.id} to="/posts/$postId" params={{ postId: p.id }} className="bg-white rounded-3xl p-6 border-2 border-edge hover:border-coral hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sage">{p.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "open" ? "bg-sage/15 text-sage" : p.status === "completed" ? "bg-amber/15 text-amber" : "bg-cream text-muted"}`}>{p.status}</span>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{p.title}</h3>
              <p className="text-sm text-muted line-clamp-2">{p.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}