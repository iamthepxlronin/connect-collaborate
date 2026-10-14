import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Mail, MessageCircle, Calendar, Tag, Users, Crown, Share2, X, Trophy, Github, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPost, fetchApplicationsForPost, fetchMyApplicationForPost, fetchAcceptedTeam, type Profile } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { waLink, firstName } from "@/lib/whatsapp";

const optionalUrl = z.string().trim().max(300).refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), "Links must start with http:// or https://");
const shipSchema = z.object({
  outcome_summary: z.string().trim().min(20, "Summary must be at least 20 characters").max(500, "Summary must be under 500 characters"),
  github_url: optionalUrl,
  demo_url: optionalUrl,
});

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
  const [shipOpen, setShipOpen] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [shipForm, setShipForm] = useState({ outcome_summary: "", github_url: "", demo_url: "" });

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

  async function shipProject(e: React.FormEvent) {
    e.preventDefault();
    const parsed = shipSchema.safeParse(shipForm);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setShipping(true);
    const { error } = await supabase
      .from("collaboration_posts")
      .update({
        status: "completed",
        outcome_summary: parsed.data.outcome_summary,
        github_url: parsed.data.github_url || null,
        demo_url: parsed.data.demo_url || null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", postId);
    setShipping(false);
    if (error) return toast.error(error.message);
    toast.success("Shipped! 🏆 Your project is now in the showcase.");
    setShipOpen(false);
    qc.invalidateQueries({ queryKey: ["post", postId] });
    qc.invalidateQueries({ queryKey: ["posts"] });
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
          {post.status === "completed" && <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-amber bg-amber/15 px-3 py-1 rounded-full"><Trophy className="w-3 h-3" /> Shipped</span>}
          <span className="text-xs text-muted">Posted {new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl font-black mb-4 leading-tight">{post.title}</h1>
        <p className="text-ink/80 leading-relaxed whitespace-pre-wrap mb-6">{post.description}</p>

        {post.status === "completed" && (
          <div className="mb-6 bg-amber/10 border-2 border-amber/40 rounded-2xl p-5">
            <p className="font-serif text-xl font-bold mb-1 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber" /> Shipped on StuCollab</p>
            {post.completed_at && <p className="text-xs text-muted mb-2">Completed {new Date(post.completed_at).toLocaleDateString()}</p>}
            {post.outcome_summary && <p className="text-sm text-ink/80 whitespace-pre-wrap mb-4">{post.outcome_summary}</p>}
            <div className="flex flex-wrap gap-2">
              {post.github_url && (
                <a href={post.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-ink text-paper font-semibold hover:opacity-90"><Github className="w-4 h-4" /> View code</a>
              )}
              {post.demo_url && (
                <a href={post.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border-2 border-edge bg-white font-semibold hover:bg-cream"><ExternalLink className="w-4 h-4" /> Live demo</a>
              )}
            </div>
          </div>
        )}

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
            <Link to="/profile/$userId" params={{ userId: post.owner_id }} className="font-semibold hover:text-coral transition">{post.owner?.full_name}</Link>
            {post.owner?.department && <p className="text-sm text-muted">{post.owner.department}</p>}
          </div>
          <button onClick={shareToWhatsApp} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border-2 border-sage/50 text-sage font-semibold hover:bg-sage/10 transition">
            <Share2 className="w-4 h-4" /> Share to WhatsApp
          </button>
        </div>

        {accepted && post.owner && (
          <div className="mt-6 bg-sage/10 border-2 border-sage/40 rounded-2xl p-5">
            <p className="font-serif text-xl font-bold text-sage mb-1">You're in! 🎉</p>
            <p className="text-sm text-ink/80 mb-4">{firstName(post.owner.full_name)} accepted you. Introduce yourself now while the team is active.</p>
            <div className="flex flex-wrap gap-2">
              {post.owner.contact_whatsapp && (
                <a
                  href={waLink(post.owner.contact_whatsapp, `Hey ${firstName(post.owner.full_name)}! 👋 Thanks for accepting me to "${post.title}" on StuCollab. Excited to get started — when can we talk?`)}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sage text-white font-semibold hover:opacity-90 transition"
                >
                  <MessageCircle className="w-4 h-4" /> Chat with team lead on WhatsApp
                </a>
              )}
              {post.owner.contact_email && (
                <a href={`mailto:${post.owner.contact_email}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-edge bg-white font-semibold hover:bg-cream transition">
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {justAccepted && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setJustAccepted(null)}>
          <div className="bg-white rounded-3xl border-2 border-edge p-6 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setJustAccepted(null)} className="absolute top-4 right-4 text-muted hover:text-ink" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <p className="font-serif text-2xl font-black mb-2">{firstName(justAccepted.full_name)} is on your team! 🚀</p>
            <p className="text-sm text-muted mb-5">Don't let the momentum die — say hi while they're active.</p>
            {justAccepted.contact_whatsapp ? (
              <a
                href={waLink(justAccepted.contact_whatsapp, `Hey ${firstName(justAccepted.full_name)}! 👋 I just accepted your application for "${post.title}" on StuCollab. Welcome to the team — let's connect!`)}
                target="_blank" rel="noreferrer"
                onClick={() => setJustAccepted(null)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-sage text-white font-semibold hover:opacity-90 transition"
              >
                <MessageCircle className="w-4 h-4" /> Say hi on WhatsApp
              </a>
            ) : (
              <p className="text-sm text-muted">They haven't added a WhatsApp number{justAccepted.contact_email ? ` — reach them at ${justAccepted.contact_email}` : ""}.</p>
            )}
            <button onClick={() => setJustAccepted(null)} className="w-full mt-2 py-2 text-sm text-muted hover:text-ink">Maybe later</button>
          </div>
        </div>
      )}

      {shipOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setShipOpen(false)}>
          <form onSubmit={shipProject} className="bg-white rounded-3xl border-2 border-edge p-6 max-w-md w-full relative space-y-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setShipOpen(false)} className="absolute top-4 right-4 text-muted hover:text-ink" aria-label="Close"><X className="w-5 h-5" /></button>
            <div>
              <p className="font-serif text-2xl font-black">Ship it 🏆</p>
              <p className="text-sm text-muted">Show what your team built. It'll appear in the showcase and the project closes to new applicants.</p>
            </div>
            <label className="block">
              <span className="text-sm font-semibold">What did you deliver?</span>
              <textarea rows={4} maxLength={500} value={shipForm.outcome_summary} onChange={(e) => setShipForm({ ...shipForm, outcome_summary: e.target.value })} placeholder="e.g. Built an offline hostel booking app with PHP & MySQL in 4 weeks." className="mt-1 w-full px-4 py-3 border-2 border-edge rounded-2xl focus:outline-none focus:border-coral" />
              <span className="text-xs text-muted">{shipForm.outcome_summary.trim().length}/500 · min 20</span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">GitHub repo (optional)</span>
              <input type="url" value={shipForm.github_url} onChange={(e) => setShipForm({ ...shipForm, github_url: e.target.value })} placeholder="https://github.com/…" className="mt-1 w-full px-4 py-2.5 border-2 border-edge rounded-2xl focus:outline-none focus:border-coral" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Live demo or Figma link (optional)</span>
              <input type="url" value={shipForm.demo_url} onChange={(e) => setShipForm({ ...shipForm, demo_url: e.target.value })} placeholder="https://…" className="mt-1 w-full px-4 py-2.5 border-2 border-edge rounded-2xl focus:outline-none focus:border-coral" />
            </label>
            <button type="submit" disabled={shipping} className="w-full py-3 rounded-full bg-coral text-white font-semibold hover:opacity-90 disabled:opacity-60">{shipping ? "Shipping…" : "Mark as shipped"}</button>
          </form>
        </div>
      )}

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
            <div className="flex gap-2 flex-wrap">
              {post.status !== "completed" && (
                <button onClick={() => setShipOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full bg-amber text-ink font-semibold hover:opacity-90 transition">
                  <Trophy className="w-4 h-4" /> Mark as shipped
                </button>
              )}
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
                      <Link to="/profile/$userId" params={{ userId: a.applicant.id }} className="font-semibold hover:text-coral transition">{a.applicant.full_name}</Link>
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
          <Link to="/profile/$userId" params={{ userId: profile.id }} className="font-semibold truncate hover:text-coral transition">{profile.full_name}</Link>
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