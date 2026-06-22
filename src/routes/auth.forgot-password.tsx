import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DecorativeBg } from "@/components/decorative-bg";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — StuCollab" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4 relative overflow-hidden">
      <DecorativeBg />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 font-semibold text-xl">StuCollab</Link>
          <h1 className="font-serif text-4xl font-black mb-3">
            Forgot your <em className="italic text-coral">password?</em>
          </h1>
          <p className="text-muted">We'll send you reset instructions</p>
        </div>
        <div className="bg-white rounded-3xl shadow-lg border-2 border-edge p-8">
          {sent ? (
            <p className="text-center text-sm text-ink">Check your inbox for the reset link.</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm font-semibold text-muted mb-2">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full px-4 py-3 border-2 border-edge rounded-2xl bg-white focus:outline-none focus:border-coral transition" />
              <button type="submit" disabled={loading} className="w-full font-semibold text-white bg-coral px-6 py-3.5 rounded-full hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>
        <div className="text-center mt-6">
          <Link to="/auth" className="text-sm text-muted hover:text-ink transition">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}