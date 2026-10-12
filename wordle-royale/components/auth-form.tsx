"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { Icon } from "@/components/icons";
import {
  authErrorMessage,
  validateAuthFields,
  type AuthFields,
  type AuthMode,
  type FieldErrors,
} from "@/lib/auth-utils";

const headings: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    subtitle?: string;
    action: string;
    busy: string;
  }
> = {
  login: {
    eyebrow: "YOUR NEXT ROUND AWAITS",
    title: "Welcome back.",
    subtitle: "",
    action: "Let’s play",
    busy: "Logging in…",
  },
  signup: {
    eyebrow: "",
    title: "Join the wordplay.",
    subtitle: "Create your account.",
    action: "Create my account",
    busy: "Creating account…",
  },
  reset: {
    eyebrow: "LET’S GET YOU BACK IN",
    title: "Lost your password?",
    subtitle: "",
    action: "Send reset link",
    busy: "Sending link…",
  },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const { user, loading, logIn, signUp, resetPassword, continueWithGoogle } =
    useAuth();
  const router = useRouter();
  const [fields, setFields] = useState<AuthFields>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const pending = useRef(false);
  const copy = headings[mode];

  useEffect(() => {
    if (!loading && user && !submitting && mode !== "reset")
      router.replace("/play");
  }, [user, loading, submitting, mode, router]);

  function update(field: keyof AuthFields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setError("");
  }

  async function handleGoogle() {
    if (pending.current || loading) return;
    pending.current = true;
    setSubmitting(true);
    setGooglePending(true);
    setError("");
    setErrors({});
    try {
      await continueWithGoogle(mode === "signup" || remember);
      router.replace("/play");
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      pending.current = false;
      setSubmitting(false);
      setGooglePending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    const validation = validateAuthFields(mode, fields);
    setErrors(validation);
    const firstError = Object.keys(validation)[0];
    if (firstError) {
      formRef.current
        ?.querySelector<HTMLInputElement>(`[name="${firstError}"]`)
        ?.focus();
      return;
    }
    pending.current = true;
    setSubmitting(true);
    try {
      if (mode === "signup")
        await signUp(fields.name, fields.email, fields.password);
      else if (mode === "login")
        await logIn(fields.email, fields.password, remember);
      else {
        await resetPassword(fields.email);
        setSent(true);
      }
      if (mode !== "reset") router.replace("/play");
    } catch (failure) {
      // Do not reveal whether a reset request email has an account.
      if (
        mode === "reset" &&
        typeof failure === "object" &&
        failure !== null &&
        "code" in failure &&
        failure.code === "auth/user-not-found"
      )
        setSent(true);
      else setError(authErrorMessage(failure));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  const input = (
    field: keyof AuthFields,
    label: string,
    placeholder: string,
    icon: "user" | "mail" | "lock",
    type = "text",
  ) => {
    const isPassword = type === "password";
    const hintId =
      field === "password" && mode === "signup" ? "password-hint" : undefined;
    return (
      <div className="form-field">
        <label htmlFor={field}>{label}</label>
        <div className={`input-wrap ${errors[field] ? "has-error" : ""}`}>
          <Icon name={icon} />
          <input
            id={field}
            name={field}
            type={isPassword && showPassword ? "text" : type}
            value={fields[field]}
            onChange={(event) => update(field, event.target.value)}
            placeholder={placeholder}
            required
            autoComplete={
              field === "email"
                ? "email"
                : field === "name"
                  ? "nickname"
                  : mode === "signup"
                    ? "new-password"
                    : "current-password"
            }
            aria-invalid={!!errors[field]}
            aria-describedby={
              [errors[field] ? `${field}-error` : undefined, hintId]
                .filter(Boolean)
                .join(" ") || undefined
            }
            maxLength={field === "name" ? 24 : undefined}
            autoCapitalize={field === "email" ? "none" : undefined}
            spellCheck={field === "name" ? undefined : false}
          />
          {field === "password" && (
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} />
            </button>
          )}
        </div>
        {hintId && (
          <p className="field-hint" id={hintId}>
            At least 8 characters. Make it a good one.
          </p>
        )}
        {errors[field] && (
          <p className="field-error" id={`${field}-error`}>
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  return (
    <section
      className={`auth-panel ${mode === "signup" ? "signup-panel" : ""}`}
      aria-labelledby="form-title"
    >
      {mode !== "reset" && (
        <nav className="auth-tabs" aria-label="Account access">
          <Link
            href="/login"
            className={mode === "login" ? "active" : ""}
            aria-current={mode === "login" ? "page" : undefined}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={mode === "signup" ? "active" : ""}
            aria-current={mode === "signup" ? "page" : undefined}
          >
            Sign up
          </Link>
        </nav>
      )}
      <div className="form-intro">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2 id="form-title">{sent ? "Check your inbox." : copy.title}</h2>
        <p>
          {sent
            ? "If an account exists for this email, you’ll receive a link to reset your password."
            : copy.subtitle}
        </p>
      </div>
      {sent ? (
        <div className="reset-success">
          <span className="success-icon">
            <Icon name="mail" />
          </span>
          <p>
            Check your spam folder, too. Then come back for your next round.
          </p>
          <Link href="/login" className="primary-button">
            Back to log in <Icon name="arrow" />
          </Link>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate aria-busy={submitting}>
          <fieldset disabled={submitting}>
            {mode !== "reset" && (
              <>
                <button
                  type="button"
                  className="google-button"
                  onClick={handleGoogle}
                  disabled={submitting || loading}
                >
                  {googlePending ? (
                    <span className="spinner" />
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.35-2.59Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.59C7.19 7.72 9.4 5.96 12 5.96Z"
                      />
                    </svg>
                  )}
                  {googlePending
                    ? "Connecting to Google…"
                    : "Continue with Google"}
                </button>
                <div className="auth-divider">
                  <span>or continue with email</span>
                </div>
              </>
            )}
            {mode === "signup" &&
              input("name", "Player name", "Your royal alias", "user")}
            {input(
              "email",
              "Email address",
              "you@example.com",
              "mail",
              "email",
            )}
            {mode !== "reset" &&
              input(
                "password",
                "Password",
                mode === "signup"
                  ? "Create a strong password"
                  : "Enter your password",
                "lock",
                "password",
              )}
            {mode === "signup" &&
              input(
                "confirmPassword",
                "Confirm password",
                "One more time",
                "lock",
                "password",
              )}
            {mode === "login" && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Keep me signed in
                </label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
            )}
            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="primary-button"
              disabled={submitting || loading}
            >
              {submitting && !googlePending ? (
                <>
                  <span className="spinner" />
                  {copy.busy}
                </>
              ) : (
                <>
                  {copy.action}
                  <Icon name="arrow" />
                </>
              )}
            </button>
          </fieldset>
        </form>
      )}
      {mode === "login" && (
        <p className="form-switch">
          New to the game? <Link href="/signup">Create an account</Link>
        </p>
      )}
      {mode === "signup" && (
        <p className="form-switch">
          Already part of the club? <Link href="/login">Log in</Link>
        </p>
      )}
      {mode === "reset" && !sent && (
        <p className="form-switch">
          <Link href="/login">Back to log in</Link>
        </p>
      )}
      <div className="form-footnote">
        <Icon name="lock" />
        <span>Your next great guess is just a sign-in away.</span>
      </div>
    </section>
  );
}
