export type AuthMode = "login" | "signup" | "reset";
export type AuthFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
export type FieldErrors = Partial<Record<keyof AuthFields, string>>;

export function validateAuthFields(
  mode: AuthMode,
  fields: AuthFields,
): FieldErrors {
  const errors: FieldErrors = {};
  if (mode === "signup" && fields.name.trim().length < 2)
    errors.name = "Enter a player name with at least 2 characters.";
  if (mode === "signup" && fields.name.trim().length > 24)
    errors.name = "Keep your player name to 24 characters or fewer.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errors.email = "Enter a valid email address.";
  if (mode !== "reset" && !fields.password)
    errors.password = "Enter your password.";
  if (mode === "signup" && fields.password.length < 8)
    errors.password = "Use at least 8 characters for your password.";
  if (mode === "signup" && !fields.confirmPassword)
    errors.confirmPassword = "Confirm your password.";
  else if (mode === "signup" && fields.password !== fields.confirmPassword)
    errors.confirmPassword = "Your passwords don’t match.";
  return errors;
}

export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "That email and password don’t match. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Log in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Choose a stronger password with uppercase and lowercase letters, a number, and a symbol.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment before trying again.";
    case "auth/network-request-failed":
      return "We couldn’t connect. Check your internet connection and try again.";
    case "auth/user-disabled":
      return "This account is disabled. Please contact the site owner.";
    case "auth/web-storage-unsupported":
      return "Allow browser storage to stay signed in, then try again.";
    case "auth/configuration-not-found":
    case "auth/operation-not-allowed":
    case "auth/invalid-api-key":
    case "auth/not-configured":
      return "Account access is temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}
