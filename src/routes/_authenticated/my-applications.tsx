import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchMyApplications, withdrawPendingApplication } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { canWithdrawApplication } from "@/lib/application-actions";

export const Route = createFileRoute("/_authenticated/my-applications")({
  head: () => ({ meta: [
    { title: "My applications — StuCollab" },
    { name: "description", content: "Review your student project applications and their current status." },
    { property: "og:title", content: "My applications — StuCollab" },
    { property: "og:description", content: "Review your student project applications and their current status." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: MyApps,
});

function MyApps() {
  const { user } = useCurrentUser();
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["my-apps", user?.id],
    queryFn: () => fetchMyApplications(user!.id),
    enabled: !!user,
  });
  const qc = useQueryClient();
  const withdrawal = useMutation({
    mutationFn: (applicationId: string) => withdrawPendingApplication(applicationId, user?.id ?? ""),
    onSuccess: (removed) => {
      if (!removed) return toast.error("This application is no longer pending");
      toast.success("Application withdrawn");
      qc.invalidateQueries({ queryKey: ["my-apps", user?.id] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      qc.invalidateQueries({ queryKey: ["my-app"] });
    },
    onError: () => toast.error("Couldn't withdraw this application. Please try again."),
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
            <article key={a.id} className="bg-white rounded-3xl p-5 border-2 border-edge hover:border-coral hover:shadow-lg transition">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-sage font-semibold mb-1">{a.post?.category}</p>
                  <h3 className="font-serif text-xl font-bold"><Link to="/posts/$postId" params={{ postId: a.post_id }} className="break-words hover:text-coral">{a.post?.title ?? "Project unavailable"}</Link></h3>
                  <p className="text-xs text-muted mt-1">Applied {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full border ${
                  a.status === "accepted" ? "bg-sage/20 text-sage border-sage/40" :
                  a.status === "rejected" ? "bg-coral/10 text-coral border-coral/30" :
                  "bg-amber/20 text-amber border-amber/40"
                }`}>{a.status}</span>
              </div>
              {a.status === "accepted" && (
                <Link to="/posts/$postId" params={{ postId: a.post_id }} className="mt-3 block text-sm font-semibold text-sage">🎉 You're in! Open the project to chat with the team lead →</Link>
              )}
              {canWithdrawApplication(a.status) && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4">
                  <p className="text-xs text-muted">Changed your mind? You can withdraw while it’s pending.</p>
                  <button
                    type="button"
                    disabled={withdrawal.isPending}
                    onClick={() => {
                      if (window.confirm("Withdraw this application? The project owner will no longer see it.")) withdrawal.mutate(a.id);
                    }}
                    className="rounded-full border-2 border-edge px-4 py-2 text-sm font-semibold text-coral transition hover:border-coral hover:bg-coral/10 disabled:opacity-50"
                  >
                    {withdrawal.isPending ? "Withdrawing…" : "Withdraw application"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}