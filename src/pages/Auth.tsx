import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";
import { isCloudEnabled } from "../services/supabase";
import { Button } from "../components/ui/Button";
import { useT } from "../i18n/store";

function AuthShell({
  kicker,
  title,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <div className="min-h-screen atmosphere">
      <div className="max-w-md mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline">
          {t("auth.back")}
        </Link>
        <div className="flex items-center gap-3 mt-8">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{kicker}</p>
        </div>
        <h1 className="headline mt-3">{title}</h1>
        <div className="rule-double mt-5" />
        <div className="mt-6">
          <p className="text-xs text-muted leading-relaxed bg-paper-deep border border-rule rounded-[2px] p-3">
            {isCloudEnabled ? t("auth.cloudMode") : t("auth.localMode")}
          </p>
        </div>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-sm text-muted">{footer}</div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-card border border-rule-strong rounded-[2px] px-3 py-2 text-sm focus:border-gold outline-none";

export function Login() {
  const signIn = useAuthStore((s) => s.signIn);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const ok = await signIn(email, isCloudEnabled ? password : undefined);
    if (ok) navigate("/campaigns");
  }

  return (
    <AuthShell
      kicker={t("auth.kicker")}
      title={t("auth.signinTitle")}
      footer={
        <>
          {t("auth.noProfileYet")}{" "}
          <Link to="/register" className="text-gold-text underline underline-offset-4">
            {t("auth.register")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="kicker block mb-1.5">
            {t("auth.email")}
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        {isCloudEnabled && (
          <div>
            <label htmlFor="login-password" className="kicker block mb-1.5">
              {t("auth.password")}
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-brick-text">
            {error}
          </p>
        )}
        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const register = useAuthStore((s) => s.register);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();
  const { t } = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const ok = await register(name, email, isCloudEnabled ? password : undefined);
    if (ok) navigate("/campaigns");
  }

  return (
    <AuthShell
      kicker={t("auth.kicker")}
      title={t("auth.registerTitle")}
      footer={
        <>
          {t("auth.haveProfile")}{" "}
          <Link to="/login" className="text-gold-text underline underline-offset-4">
            {t("auth.signIn")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="kicker block mb-1.5">
            {t("auth.name")}
          </label>
          <input
            id="register-name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder={t("auth.namePh")}
            maxLength={40}
          />
        </div>
        <div>
          <label htmlFor="register-email" className="kicker block mb-1.5">
            {t("auth.email")}
          </label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        {isCloudEnabled && (
          <div>
            <label htmlFor="register-password" className="kicker block mb-1.5">
              {t("auth.password")}
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-muted mt-1">{t("auth.atLeast8")}</p>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-brick-text">
            {error}
          </p>
        )}
        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? t("auth.registering") : t("auth.createProfile")}
        </Button>
      </form>
    </AuthShell>
  );
}
