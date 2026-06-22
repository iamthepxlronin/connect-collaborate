import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMyApplications } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/my-applications")({
  head: () => ({ meta: [{ title: "My applications — StuCollab" }] }),
  component: MyApps,
});

function MyApps() {
  const { user } = useCurrentUser();
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["my-apps", user?.id],
    queryFn: () => fetchMyApplications(user!.id),
    enabled: !!user,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-black mb-2">My <em className="italic text-sage">applications</em></h1>
      <p className="text-muted mb-8">Projects you've applied to.</p>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-edge rounded-3xl py-16 text-center">
          <p className="text-muted mb-4">You haven't applied to anything yet.</p>
          <Link to="/dashboard" className="font-semibold text-coral hover:underline">Browse projects →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <Link key={a.id} to="/posts/$postId" params={{ postId: a.post_id }} className="block bg-white rounded-3xl p-5 border-2 border-edge hover:border-coral hover:shadow-lg transition">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-sage font-semibold mb-1">{a.post?.category}</p>
                  <h3 className="font-serif text-xl font-bold truncate">{a.post?.title}</h3>
                  <p className="text-xs text-muted mt-1">Applied {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full border ${
                  a.status === "accepted" ? "bg-sage/20 text-sage border-sage/40" :
                  a.status === "rejected" ? "bg-coral/10 text-coral border-coral/30" :
                  "bg-amber/20 text-amber border-amber/40"
                }`}>{a.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}