import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Mail, MessageCircle, Calendar, Tag, Users, Crown, Share2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPost, fetchApplicationsForPost, fetchMyApplicationForPost, fetchAcceptedTeam, type Profile } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { waLink, firstName } from "@/lib/whatsapp";

export const Route = createFileRoute("/_authenticated/posts/$postId")({
  head: () => ({ meta: [{ title: "Project — StuCollab" }] }),
  component: PostDetail,
});

function PostDetail() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useCurrentUser();

  const { data: post, isLoading } = useQuery({ queryKey: ["post", postId], queryFn: () => fetchPost(postId) });
  const { data: myApp } = useQuery({
    queryKey: ["my-app", postId, user?.id],
    queryFn: () => fetchMyApplicationForPost(postId, user!.id),
    enabled: !!user,
  });

  const isOwner = !!(user && post && user.id === post.owner_id);
  const accepted = myApp?.status === "accepted";

  const { data: apps = [] } = useQuery({
    queryKey: ["apps", postId],
    queryFn: () => fetchApplicationsForPost(postId),
    enabled: isOwner,
  });

  const { data: team = [] } = useQuery({
    queryKey: ["team", postId],
    queryFn: () => fetchAcceptedTeam(postId),
  });
  const canSeeContacts = isOwner || accepted;

  const [message, setMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [justAccepted, setJustAccepted] = useState<Profile | null>(null);

  async function apply() {
    if (!user) return;
    setApplying(true);
    const { error } = await supabase.from("applications").insert({
      post_id: postId,
      applicant_id: user.id,
      message,
    });
    setApplying(false);
    if (error) return toast.error(error.message);
    toast.success("Application sent");
    qc.invalidateQueries({ queryKey: ["my-app", postId] });
  }

  async function decide(appId: string, status: "accepted" | "rejected") {
    const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
    if (error) return toast.error(error.message);
    toast.success(`Application ${status}`);
    if (status === "accepted") {
      const a = apps.find((x) => x.id === appId);
      if (a) setJustAccepted(a.applicant);
    }
    qc.invalidateQueries({ queryKey: ["apps", postId] });
    qc.invalidateQueries({ queryKey: ["team", postId] });
  }

  function shareToWhatsApp() {
    if (!post) return;
    const skills = post.required_skills.slice(0, 4).join(", ");
    const text = `Hey guys! 👋 I'm building "${post.title}" on StuCollab${skills ? ` and need people with ${skills}` : ""}. Check it out and apply here: ${window.location.origin}/posts/${post.id}`;
    window.open(waLink(null, text), "_blank", "noopener");
  }

  async function closePost() {
    const { error } = await supabase.from("collaboration_posts").update({ status: "closed" }).eq("id", postId);
    if (error) return toast.error(error.message);
    toast.success("Project closed");
    qc.invalidateQueries({ queryKey: ["post", postId] });
  }

  async function deletePost() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const { error } = await supabase.from("collaboration_posts").delete().eq("id", postId);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    navigate({ to: "/my-posts" });
  }

  if (isLoading) return <div className="p-10 text-center text-muted">Loading…</div>;
  if (!post) return <div className="p-10 text-center text-muted">Project not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>

      <div className="bg-white rounded-3xl border-2 border-edge p-6 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-sage bg-sage/10 px-3 py-1 rounded-full">{post.category}</span>
          {post.status === "closed" && <span className="text-xs font-semibold uppercase text-muted bg-cream px-3 py-1 rounded-full">Closed</span>}
          <span className="text-xs text-muted">Posted {new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl font-black mb-4 leading-tight">{post.title}</h1>
        <p className="text-ink/80 leading-relaxed whitespace-pre-wrap mb-6">{post.description}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {post.project_type && <Meta icon={Tag} label="Project type" value={post.project_type} />}
          {post.deadline && <Meta icon={Calendar} label="Deadline" value={new Date(post.deadline).toLocaleDateString()} />}
        </div>

        {post.required_skills.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-muted mb-2">Required skills</p>
            <div className="flex flex-wrap gap-2">
              {post.required_skills.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-cream border border-edge font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-edge pt-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted mb-1">Posted by</p>
            <p className="font-semibold">{post.owner?.full_name}</p>
            {post.owner?.department && <p className="text-sm text-muted">{post.owner.department}</p>}
          </div>
          {accepted && post.owner && (post.owner.contact_email || post.owner.contact_whatsapp) && (
            <div className="bg-sage/10 border-2 border-sage/40 rounded-2xl p-4 text-sm space-y-1.5">
              <p className="font-semibold text-sage mb-1">You're in! Contact details:</p>
              {post.owner.contact_email && (
                <a href={`mailto:${post.owner.contact_email}`} className="flex items-center gap-2 hover:underline">
                  <Mail className="w-4 h-4" /> {post.owner.contact_email}
                </a>
              )}
              {post.owner.contact_whatsapp && (
                <a href={`https://wa.me/${post.owner.contact_whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                  <MessageCircle className="w-4 h-4" /> {post.owner.contact_whatsapp}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-3xl border-2 border-edge p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-sage" /> Confirmed team
          </h2>
          <span className="text-sm text-muted">
            {team.length + 1} {team.length + 1 === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {post.owner && <MemberCard profile={post.owner} lead showContact={canSeeContacts && !isOwner} />}
          {team.map((m) => (
            <MemberCard key={m.id} profile={m.applicant} showContact={canSeeContacts && m.applicant.id !== user?.id} />
          ))}
        </div>
        {team.length === 0 && (
          <p className="text-sm text-muted mt-4">No collaborators confirmed yet — be the first to join.</p>
        )}
        {!canSeeContacts && team.length > 0 && (
          <p className="text-xs text-muted mt-4">Contact details are only visible to confirmed team members.</p>
        )}
      </div>

      {isOwner && (
        <div className="mt-8 bg-white rounded-3xl border-2 border-edge p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-serif text-2xl font-bold">Applications ({apps.length})</h2>
            <div className="flex gap-2">
              {post.status === "open" && (
                <button onClick={closePost} className="px-4 py-2 text-sm rounded-full border-2 border-edge hover:bg-cream font-semibold transition">
                  Close project
                </button>
              )}
              <button onClick={deletePost} className="px-4 py-2 text-sm rounded-full border-2 border-edge text-coral hover:bg-coral/10 font-semibold transition">
                Delete
              </button>
            </div>
          </div>
          {apps.length === 0 ? (
            <p className="text-muted text-sm">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {apps.map((a) => (
                <div key={a.id} className="border-2 border-edge rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div>
                      <p className="font-semibold">{a.applicant.full_name}</p>
                      <p className="text-xs text-muted">{a.applicant.department ?? "—"} · {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.applicant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {a.applicant.skills.slice(0, 6).map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-cream border border-edge">{s}</span>
                      ))}
                    </div>
                  )}
                  {a.message && <p className="text-sm text-ink/80 whitespace-pre-wrap mb-3">{a.message}</p>}
                  {a.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => decide(a.id, "accepted")} className="px-4 py-1.5 text-sm rounded-full bg-sage text-white font-semibold hover:opacity-90 transition">
                        Accept
                      </button>
                      <button onClick={() => decide(a.id, "rejected")} className="px-4 py-1.5 text-sm rounded-full border-2 border-edge font-semibold hover:bg-cream transition">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isOwner && post.status === "open" && (
        <div className="mt-8 bg-white rounded-3xl border-2 border-edge p-6 lg:p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold mb-4">Apply to this project</h2>
          {myApp ? (
            <div className="flex items-center gap-3">
              <StatusBadge status={myApp.status} />
              <p className="text-sm text-muted">Your application is {myApp.status}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Tell the owner why you're a great fit (optional)…"
                className="w-full px-4 py-3 border-2 border-edge rounded-2xl bg-white focus:outline-none focus:border-coral transition"
              />
              <button onClick={apply} disabled={applying} className="font-semibold text-white bg-coral px-6 py-3 rounded-full hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(232,93,58,0.3)] transition disabled:opacity-60">
                {applying ? "Sending…" : "Send application"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberCard({ profile, lead, showContact }: { profile: Profile; lead?: boolean; showContact: boolean }) {
  const initials = profile.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return (
    <div className="border-2 border-edge rounded-2xl p-4 flex gap-3">
      <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${lead ? "bg-coral/15 text-coral" : "bg-sage/15 text-sage"}`}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold truncate">{profile.full_name}</p>
          {lead && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-coral bg-coral/10 px-2 py-0.5 rounded-full">
              <Crown className="w-3 h-3" /> Lead
            </span>
          )}
        </div>
        <p className="text-xs text-muted truncate">{profile.department ?? "—"}</p>
        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.skills.slice(0, 4).map((s) => (
              <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-cream border border-edge">{s}</span>
            ))}
          </div>
        )}
        {showContact && (profile.contact_email || profile.contact_whatsapp) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.contact_whatsapp && (
              <a href={`https://wa.me/${profile.contact_whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-sage bg-sage/10 px-2.5 py-1 rounded-full hover:bg-sage/20 transition">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </a>
            )}
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`} className="inline-flex items-center gap-1 text-xs font-semibold text-ink bg-cream px-2.5 py-1 rounded-full hover:bg-edge transition">
                <Mail className="w-3 h-3" /> Email
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-cream/40 rounded-2xl p-3 border border-edge">
      <Icon className="w-4 h-4 text-muted" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "accepted" | "rejected" }) {
  const map = {
    pending: "bg-amber/20 text-amber border-amber/40",
    accepted: "bg-sage/20 text-sage border-sage/40",
    rejected: "bg-coral/10 text-coral border-coral/30",
  } as const;
  return <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${map[status]}`}>{status}</span>;
}