import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, MAX_POST_SKILLS } from "@/lib/stucollab-constants";
import { SkillsCombobox } from "@/components/skills-combobox";

export const Route = createFileRoute("/_authenticated/posts/new")({
  head: () => ({ meta: [{ title: "New project — StuCollab" }] }),
  component: NewPost,
});

const postSchema = z.object({
  title: z.string().trim().min(8, "Title should be at least 8 characters").max(120, "Title must be under 120 characters"),
  description: z.string().trim().min(30, "Describe your project in at least 30 characters").max(2000, "Description must be under 2000 characters"),
  category: z.string().min(1, "Choose a category"),
  project_type: z.string().trim().max(60, "Project type must be under 60 characters"),
  deadline: z.string(),
});

function NewPost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "", project_type: "", deadline: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = postSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return toast.error(parsed.error.issues[0].message);
    }
    if (skills.length === 0) {
      setErrors({ skills: "Add at least one required skill" });
      return toast.error("Add at least one required skill");
    }
    if (form.deadline && new Date(form.deadline) < new Date(new Date().toDateString())) {
      setErrors({ deadline: "Deadline cannot be in the past" });
      return toast.error("Deadline cannot be in the past");
    }
    setErrors({});
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("contact_whatsapp, contact_email")
      .eq("id", u.user.id)
      .maybeSingle();
    if (!profile?.contact_whatsapp && !profile?.contact_email) {
      setLoading(false);
      toast.error("Add a contact detail to your profile first so accepted teammates can reach you");
      return navigate({ to: "/profile/edit" });
    }

    const v = parsed.data;
    const { data, error } = await supabase
      .from("collaboration_posts")
      .insert({
        owner_id: u.user.id,
        title: v.title,
        description: v.description,
        category: v.category,
        project_type: v.project_type || null,
        deadline: v.deadline || null,
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