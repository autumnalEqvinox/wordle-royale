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

const headings = {
  login: {
    eyebrow: "YOUR NEXT ROUND AWAITS",
    title: "Welcome back.",
    subtitle: "Good to see you. Ready to make your move?",
    action: "Let’s play",
    busy: "Logging in…",
  },
  signup: {
    eyebrow: "A NEW CHALLENGER APPROACHES",
    title: "Join the wordplay.",
    subtitle: "Create your account. Your crown is waiting.",
    action: "Create my account",
    busy: "Creating account…",
  },
  reset: {
    eyebrow: "LET’S GET YOU BACK IN",
    title: "Lost your password?",
    subtitle: "It happens. We’ll help you find your way back.",
    action: "Send reset link",
    busy: "Sending link…",
  },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const { user, loading, logIn, signUp, resetPassword } = useAuth();
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
              {submitting ? (
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
