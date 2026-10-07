"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Icon } from "@/components/icons";
import { authErrorMessage } from "@/lib/auth-utils";

export default function PlayerPage() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function handleLogout() {
    setBusy(true);
    try {
      await logOut();
      router.replace("/login");
    } catch (failure) {
      setError(authErrorMessage(failure));
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className="player-main">
      <section className="player-card">
        <span className="player-crown">
          <Icon name="crown" />
        </span>
        <span className="eyebrow">YOU’RE PART OF THE CLUB</span>
        <h1>Welcome, {user?.displayName || "challenger"}.</h1>
        <p>Your Wordle Royale account is ready.</p>
        <div className="account-detail">
          <Icon name="mail" />
          <span>{user?.email}</span>
          <span className="signed-in">
            <span />
            Signed in
          </span>
        </div>
        <div className="coming-soon">
          <span className="tiny-tiles" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <h2>The arena is taking shape.</h2>
          <p>
            Multiplayer rounds are coming next. For now, your account is ready
            for the first move.
          </p>
        </div>
        {error && (
          <p className="form-alert" role="alert">
            {error}
          </p>
        )}
        <button
          className="secondary-button"
          disabled={busy}
          onClick={handleLogout}
        >
          {busy ? "Logging out…" : "Log out"}
          <Icon name="logout" />
        </button>
      </section>
    </main>
  );
}
