import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { ROLE_LABELS, ROLE_USERS, type Role } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";

const MOCK_PASSWORD = "demo1234";

export function LoginPage() {
  const { login, isAuthenticated } = useRole();
  const navigate = useNavigate();
  const [email, setEmail] = useState(ROLE_USERS.school_admin.email);
  const [password, setPassword] = useState(MOCK_PASSWORD);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await apiClient.post<any>("/auth/login", { email, password });
      login(res.token, res.user);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try one of the demo accounts below.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-glow text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">EduSync ERP</p>
            <p className="text-xs opacity-80">School Management Suite</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            One platform for your entire campus.
          </h2>
          <p className="mt-3 text-sm opacity-90">
            Admissions, academics, attendance, fees, library and communication — unified
            in a single, role-aware workspace.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Role-based dashboards for every stakeholder",
              "Real-time fee, attendance & performance insights",
              "Library, timetable & communication built-in",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 opacity-90" />
                <span className="opacity-95">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs opacity-70">© 2026 EduSync. Demo build.</p>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight">EduSync ERP</p>
              <p className="text-xs text-muted-foreground">School Management Suite</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue to your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-input bg-card px-3.5 pr-11 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-input" defaultChecked />
              Keep me signed in on this device
            </label>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:opacity-90"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Contact your administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
