import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DecorativeBg } from "@/components/decorative-bg";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — StuCollab" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4 relative overflow-hidden">
      <DecorativeBg />
      <div className="w-full max-w-md relative z-10">
        <h1 className="font-serif text-4xl font-black mb-6 text-center">Set a new <em className="italic text-coral">password</em></h1>
        <div className="bg-white rounded-3xl shadow-lg border-2 border-edge p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-muted">New password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-edge rounded-2xl focus:outline-none focus:border-coral transition" />
            <button type="submit" disabled={loading} className="w-full font-semibold text-white bg-coral px-6 py-3.5 rounded-full hover:-translate-y-0.5 transition disabled:opacity-60">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}