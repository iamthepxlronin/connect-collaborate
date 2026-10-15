import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PasswordInput } from "@/components/password-input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DEPARTMENTS } from "@/lib/stucollab-constants";
import { DecorativeBg } from "@/components/decorative-bg";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional().default("login"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — StuCollab" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">(mode);
  const [prefillEmail, setPrefillEmail] = useState("");

  useEffect(() => setTab(mode), [mode]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  function handleSignedUp(email: string) {
    setPrefillEmail(email);
    setTab("login");
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }


  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <DecorativeBg />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition">
            <span className="font-semibold text-xl text-ink">StuCollab</span>
          </Link>
          <h1 className="font-serif text-5xl font-black mb-3 leading-tight">
            {tab === "login" ? (
              <>Welcome <em className="italic text-coral">back</em></>
            ) : (
              <>Join the <em className="italic text-sage">community</em></>
            )}
          </h1>
          <p className="text-lg text-muted">
            {tab === "login" ? "Sign in to continue to your dashboard" : "Create your account and start collaborating"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border-2 border-edge p-8">
          <div className="flex gap-2 p-1 bg-cream rounded-2xl mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "login" ? "bg-white shadow-sm text-ink" : "text-muted"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "signup" ? "bg-white shadow-sm text-ink" : "text-muted"}`}
            >
              Sign up
            </button>
          </div>

          {tab === "login" ? <LoginForm initialEmail={prefillEmail} /> : <SignupForm onSignedUp={handleSignedUp} />}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-edge" />
            <span className="text-xs text-muted font-medium">OR</span>
            <div className="h-px flex-1 bg-edge" />
          </div>
          <GoogleButton />
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-muted hover:text-ink transition inline-flex items-center gap-1">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}


function LoginForm({ initialEmail = "" }: { initialEmail?: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!z.string().email().safeParse(trimmed).success) {
      setError("Enter a valid email address");
      return toast.error("Enter a valid email address");
    }
    if (!password) {
      setError("Enter your password");
      return toast.error("Enter your password");
    }
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: trimmed, password });
    setLoading(false);
    if (err) return toast.error(err.message);
    toast.success("Signed in");
    navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Email address" error={error}>
        <input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@email.com" className={inputCls} />
      </Field>
      <Field label="Password">
        <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className={inputCls} />
      </Field>
      <div className="flex justify-end">
        <Link to="/auth/forgot-password" className="text-xs text-coral hover:underline font-medium">Forgot password?</Link>
      </div>

      <button type="submit" disabled={loading} className={primaryBtn}>
        {loading ? "Signing in…" : "Sign in to your account"}
      </button>
    </form>
  );
}

const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Name must be under 80 characters")
    .regex(/^[a-zA-Z][a-zA-Z'’\-. ]*$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
  email: z.string().trim().min(1, "Enter your email").max(255, "Email is too long").email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be under 72 characters")
    .regex(/[a-zA-Z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  confirmPassword: z.string(),
  department: z.string().min(1, "Select your department"),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function SignupForm({ onSignedUp }: { onSignedUp: (email: string) => void }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", department: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function upd<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  const strength = passwordStrength(form.password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return toast.error(parsed.error.issues[0].message);
    }
    setErrors({});
    setLoading(true);
    const v = parsed.data;
    const { error } = await supabase.auth.signUp({
      email: v.email.toLowerCase(),
      password: v.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: v.fullName, department: v.department },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Send the new student back to the sign-in tab so they log in with their new details.
    await supabase.auth.signOut();
    setLoading(false);
    toast.success("Account created — please sign in with your new details");
    onSignedUp(v.email.toLowerCase());
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Full name" error={errors.fullName}>
        <input required maxLength={80} value={form.fullName} onChange={(e) => upd("fullName", e.target.value)} autoComplete="name" placeholder="Your full name" className={inputCls} />
      </Field>
      <Field label="Email address" error={errors.email}>
        <input type="email" required maxLength={255} value={form.email} onChange={(e) => upd("email", e.target.value)} autoComplete="email" placeholder="you@email.com" className={inputCls} />
      </Field>
      <Field label="Password" error={errors.password}>
        <PasswordInput required maxLength={72} value={form.password} onChange={(e) => upd("password", e.target.value)} autoComplete="new-password" placeholder="At least 8 characters, with a number" className={inputCls} />
        {form.password && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-cream overflow-hidden">
              <div className={`h-full transition-all ${strength.barClass}`} style={{ width: `${strength.pct}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-muted">{strength.label}</span>
          </div>
        )}
      </Field>
      <Field label="Confirm password" error={errors.confirmPassword}>
        <PasswordInput required maxLength={72} value={form.confirmPassword} onChange={(e) => upd("confirmPassword", e.target.value)} autoComplete="new-password" placeholder="Re-enter your password" className={inputCls} />
      </Field>
      <Field label="Department" error={errors.department}>
        <select required value={form.department} onChange={(e) => upd("department", e.target.value)} className={inputCls}>
          <option value="">Select your department</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      <button type="submit" disabled={loading} className={primaryBtn}>
        {loading ? "Creating…" : "Create your account"}
      </button>
    </form>
  );
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { pct: 33, label: "Weak", barClass: "bg-coral" };
  if (score === 3) return { pct: 66, label: "Okay", barClass: "bg-amber" };
  return { pct: 100, label: "Strong", barClass: "bg-sage" };
}


function GoogleButton() {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) {
      setLoading(false);
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    setLoading(false);
    window.location.href = "/dashboard";
  }
  return (
    <button onClick={go} disabled={loading} type="button" className="w-full flex items-center justify-center gap-3 py-3 rounded-full border-2 border-edge bg-white hover:bg-cream font-semibold text-sm text-ink transition">
      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
      {loading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-muted mb-2">{label}</label>
      {children}
      {error && <p className="text-xs text-coral mt-1.5">{error}</p>}
    </div>
  );
}


const inputCls = "w-full px-4 py-3 border-2 border-edge rounded-2xl bg-white focus:outline-none focus:border-coral transition";
const primaryBtn = "w-full font-semibold text-white bg-coral px-6 py-3.5 rounded-full shadow-[0_4px_20px_rgba(232,93,58,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,93,58,0.4)] transition-all disabled:opacity-60 disabled:hover:translate-y-0";