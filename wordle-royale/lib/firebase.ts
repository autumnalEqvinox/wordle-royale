import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";

let auth: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (
    Object.values(config).some((value) => !value || value.startsWith("your-"))
  ) {
    throw Object.assign(new Error("Firebase web configuration is missing."), {
      code: "auth/not-configured",
    });
  }
  const app = getApps().length ? getApp() : initializeApp(config);
  const instance = getAuth(app);
  // Emulator access is opt-in and limited to local development.
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL &&
    !instance.emulatorConfig
  ) {
    const url = new URL(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL);
    if (!["localhost", "127.0.0.1"].includes(url.hostname))
      throw new Error("Use a local Authentication emulator.");
    connectAuthEmulator(instance, url.origin, { disableWarnings: true });
  }
  auth = instance;
  return auth;
}
