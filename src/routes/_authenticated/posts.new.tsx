import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/stucollab-constants";

export const Route = createFileRoute("/_authenticated/posts/new")({
  head: () => ({ meta: [{ title: "New project — StuCollab" }] }),
  component: NewPost,
});

function NewPost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "", project_type: "", deadline: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  function addSkill(s: string) {
    const t = s.trim();
    if (!t || skills.includes(t)) return;
    setSkills([...skills, t]);
    setSkillInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("collaboration_posts")
      .insert({
        owner_id: u.user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        project_type: form.project_type || null,
        deadline: form.deadline || null,
        required_skills: skills,
      })
      .select("id")
      .single();
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Project posted");
    navigate({ to: "/posts/$postId", params: { postId: data.id } });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-black mb-2">Post a <em className="italic text-coral">new project</em></h1>
      <p className="text-muted mb-8">Tell teammates what you're building and what skills you need.</p>
      <form onSubmit={onSubmit} className="bg-white rounded-3xl border-2 border-edge p-6 lg:p-8 space-y-5 shadow-sm">
        <Field label="Project title">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI-powered study buddy app" className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What are you building? What's the goal?" className={inputCls} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Category">
            <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              <option value="">Choose…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Project type (optional)">
            <input value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} placeholder="e.g. Hackathon, Class project" className={inputCls} />
          </Field>
        </div>
        <Field label="Deadline (optional)">
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Required skills">
          <div className="space-y-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
              placeholder="Type a skill and press Enter"
              className={inputCls}
            />
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cream border border-edge font-medium">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-muted hover:text-coral">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Field>
        <button type="submit" disabled={loading} className="w-full font-semibold text-white bg-coral px-6 py-3.5 rounded-full hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(232,93,58,0.3)] transition disabled:opacity-60">
          {loading ? "Posting…" : "Post project"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-muted mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 border-2 border-edge rounded-2xl bg-white focus:outline-none focus:border-coral transition";