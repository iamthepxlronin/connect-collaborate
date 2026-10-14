import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Crown, Users, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile, fetchMyPosts, type Post } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/profile/$userId")({
  head: () => ({
    meta: [
      { title: "Student profile — StuCollab" },
      { name: "description", content: "Skills, projects led and projects shipped by a StuCollab student." },
      { property: "og:title", content: "Student profile — StuCollab" },
      { property: "og:description", content: "Skills, projects led and projects shipped by a StuCollab student." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfile,
});

async function fetchJoined(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("post:collaboration_posts(*)")
    .eq("applicant_id", userId)
    .eq("status", "accepted");
  if (error) throw error;
  return ((data ?? []) as unknown as { post: Post | null }[]).map((r) => r.post).filter(Boolean) as Post[];
}

function PublicProfile() {
  const { userId } = Route.useParams();
  const { user } = useCurrentUser();
  const { data: profile, isLoading } = useQuery({ queryKey: ["profile", userId], queryFn: () => fetchProfile(userId) });
  const { data: led = [] } = useQuery({ queryKey: ["led", userId], queryFn: () => fetchMyPosts(userId) });
  const { data: joined = [] } = useQuery({ queryKey: ["joined", userId], queryFn: () => fetchJoined(userId) });

  if (isLoading) return <div className="p-10 text-muted">Loading…</div>;
  if (!profile) return <div className="p-10 text-muted">Student not found.</div>;

  const initials = profile.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  const all = [...led.map((p) => ({ p, role: "Lead" as const })), ...joined.map((p) => ({ p, role: "Member" as const }))];
  const shipped = all.filter((x) => x.p.status === "completed");
  const active = all.filter((x) => x.p.status !== "completed");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border-2 border-edge p-6 lg:p-8 shadow-sm mb-8">
        <div className="flex gap-5 items-start flex-wrap">
          <div className="w-20 h-20 rounded-full bg-coral/15 text-coral flex items-center justify-center font-serif font-black text-2xl">{initials}</div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-3xl lg:text-4xl font-black">{profile.full_name}</h1>
            <p className="text-muted">{profile.department ?? "—"}</p>
            {profile.bio && <p className="mt-3 text-ink/80">{profile.bio}</p>}
          </div>
          {user?.id === profile.id && (
            <Link to="/profile/edit" className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border-2 border-edge hover:border-coral transition">
              <Pencil className="w-4 h-4" /> Edit
            </Link>
          )}
        </div>
        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {profile.skills.map((s) => <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-cream border border-edge font-medium">{s}</span>)}
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <Stat n={led.length} label="Led" />
          <Stat n={joined.length} label="Joined" />
          <Stat n={shipped.length} label="Shipped" />
        </div>
      </div>

      <Section title="Shipped projects" icon={<Trophy className="w-5 h-5 text-amber" />} items={shipped} empty="No shipped projects yet." />
      <Section title="Active projects" icon={<Users className="w-5 h-5 text-sage" />} items={active} empty="No active projects." />
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl bg-cream border border-edge p-3 text-center">
      <p className="font-serif text-2xl font-black">{n}</p>
      <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Section({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: { p: Post; role: "Lead" | "Member" }[]; empty: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">{icon} {title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(({ p, role }) => (
            <Link key={p.id} to="/posts/$postId" params={{ postId: p.id }} className="bg-white rounded-2xl border-2 border-edge p-5 hover:border-coral transition block">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${role === "Lead" ? "text-coral bg-coral/10" : "text-sage bg-sage/10"}`}>
                  {role === "Lead" && <Crown className="w-3 h-3" />} {role}
                </span>
                <span className="text-xs text-muted">{p.category}</span>
              </div>
              <p className="font-semibold mb-1">{p.title}</p>
              <p className="text-sm text-ink/70 line-clamp-2">{p.outcome_summary ?? p.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
