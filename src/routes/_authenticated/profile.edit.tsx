import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile, type Profile } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DEPARTMENTS } from "@/lib/stucollab-constants";

export const Route = createFileRoute("/_authenticated/profile/edit")({
  head: () => ({ meta: [{ title: "My profile — StuCollab" }] }),
  component: EditProfile,
});

function EditProfile() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const [form, setForm] = useState<Partial<Profile>>({});
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      department: form.department,
      bio: form.bio,
      contact_email: form.contact_email,
      contact_whatsapp: form.contact_whatsapp,
      skills: form.skills ?? [],
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  function addSkill(s: string) {
    const t = s.trim();
    const cur = form.skills ?? [];
    if (!t || cur.includes(t)) return;
    setForm({ ...form, skills: [...cur, t] });
    setSkillInput("");
  }

  if (isLoading || !profile) return <div className="p-10 text-muted">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-black mb-2">My <em className="italic text-coral">profile</em></h1>
      <p className="text-muted mb-8">Tell collaborators about yourself. Contact details are revealed only to people you accept.</p>
      <div className="bg-white rounded-3xl border-2 border-edge p-6 lg:p-8 shadow-sm space-y-5">
        <Field label="Full name">
          <input className={inputCls} value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </Field>
        <Field label="Department">
          <select className={inputCls} value={form.department ?? ""} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            <option value="">Select…</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Bio">
          <textarea rows={3} className={inputCls} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short intro about you." />
        </Field>
        <Field label="Skills">
          <div className="space-y-2">
            <input
              className={inputCls}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
              placeholder="Type a skill and press Enter"
            />
            <div className="flex flex-wrap gap-2">
              {(form.skills ?? []).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cream border border-edge font-medium">
                  {s}
                  <button type="button" onClick={() => setForm({ ...form, skills: (form.skills ?? []).filter((x) => x !== s) })} className="text-muted hover:text-coral">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Contact email (shown when accepted)">
            <input type="email" className={inputCls} value={form.contact_email ?? ""} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </Field>
          <Field label="WhatsApp (optional)">
            <input className={inputCls} value={form.contact_whatsapp ?? ""} onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })} placeholder="e.g. +234..." />
          </Field>
        </div>
        <button onClick={save} disabled={saving} className="w-full font-semibold text-white bg-coral px-6 py-3.5 rounded-full hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(232,93,58,0.3)] transition disabled:opacity-60">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
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