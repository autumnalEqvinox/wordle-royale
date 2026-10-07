"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/auth-utils";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  initializationError: string | null;
  logIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    Promise.resolve()
      .then(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(
          getFirebaseAuth(),
          (currentUser) => {
            setUser(currentUser);
            setLoading(false);
          },
          (error) => {
            setInitializationError(authErrorMessage(error));
            setLoading(false);
          },
        );
      })
      .catch((error) => {
        if (active) {
          setInitializationError(authErrorMessage(error));
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  async function logIn(email: string, password: string, remember: boolean) {
    const auth = getFirebaseAuth();
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence,
    );
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }

  async function signUp(name: string, email: string, password: string) {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    // A failed optional profile update must not report account creation as failed.
    try {
      await updateProfile(newUser, { displayName: name.trim() });
    } catch {
      /* Email remains the profile fallback. */
    }
    setUser(newUser);
  }

  async function logOut() {
    await signOut(getFirebaseAuth());
  }
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initializationError,
        logIn,
        signUp,
        logOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
