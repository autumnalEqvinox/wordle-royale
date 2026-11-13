"use client";

import Link from "next/link";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { db, rtdb } from "@/app/lib/firebase";

type RoomStats = {
  id: number | null;
  status: string;
};

type NetworkInformation = EventTarget & {
  effectiveType?: string;
  type?: string;
  rtt?: number;
};

type NavigatorWithNetworkInformation = Navigator & {
  connection?: NetworkInformation;
};

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

export default function DashboardPage() {
  const [network, setNetwork] = useState<{
    online: boolean;
    type: string | null;
    rtt: number | null;
  } | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<number | null>(null);
  const [trackedPlayers, setTrackedPlayers] = useState<number | null>(null);
  const [totalGuesses, setTotalGuesses] = useState<number | null>(null);
  const [totalWins, setTotalWins] = useState<number | null>(null);
  const [room, setRoom] = useState<RoomStats | null>(null);
  const [roundGuesses, setRoundGuesses] = useState<{
    roundId: number;
    count: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connection = (navigator as NavigatorWithNetworkInformation).connection;
    const updateNetwork = () => {
      setNetwork({
        online: navigator.onLine,
        type: connection?.effectiveType ?? connection?.type ?? null,
        rtt:
          typeof connection?.rtt === "number" &&
          Number.isFinite(connection.rtt)
            ? connection.rtt
            : null,
      });
    };
    const initialUpdate = window.requestAnimationFrame(updateNetwork);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    connection?.addEventListener("change", updateNetwork);

    return () => {
      window.cancelAnimationFrame(initialUpdate);
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
      connection?.removeEventListener("change", updateNetwork);
    };
  }, []);

  useEffect(() => {
    const unsubscribeConnection = onValue(
      ref(rtdb, ".info/connected"),
      (snapshot) => setFirebaseConnected(snapshot.val() === true),
      (listenerError) => {
        console.error("Error checking Firebase connection:", listenerError);
        setError("Could not check Firebase Realtime Database connection.");
      },
    );

    const unsubscribePresence = onValue(
      ref(rtdb, "presence"),
      (snapshot) => {
        let count = 0;
        snapshot.forEach((player) => {
          if (player.child("connections").exists()) count += 1;
        });
        setOnlinePlayers(count);
      },
      (listenerError) => {
        console.error("Error retrieving online players:", listenerError);
        setError("Could not load online player presence.");
      },
    );

    const unsubscribePlayers = onSnapshot(
      collection(db, "playerStats"),
      (snapshot) => {
        let guesses = 0;
        let wins = 0;

        snapshot.forEach((player) => {
          const data = player.data();
          if (
            typeof data.totalGuesses === "number" &&
            Number.isFinite(data.totalGuesses)
          ) {
            guesses += data.totalGuesses;
          }
          if (
            typeof data.wins === "number" &&
            Number.isFinite(data.wins)
          ) {
            wins += data.wins;
          }
        });

        setTrackedPlayers(snapshot.size);
        setTotalGuesses(guesses);
        setTotalWins(wins);
      },
      (listenerError) => {
        console.error("Error retrieving player statistics:", listenerError);
        setError("Could not load player statistics.");
      },
    );

    const unsubscribeRoom = onSnapshot(
      doc(db, "rooms", "round-1"),
      (snapshot) => {
        const data = snapshot.data();
        const id =
          typeof data?.currentRoomID === "number" ? data.currentRoomID : null;
        const status =
          typeof data?.status === "string" ? data.status : "Unknown";
        setRoom({ id, status });
      },
      (listenerError) => {
        console.error("Error retrieving current round:", listenerError);
        setError("Could not load current round information.");
      },
    );

    return () => {
      unsubscribeConnection();
      unsubscribePresence();
      unsubscribePlayers();
      unsubscribeRoom();
    };
  }, []);

  const currentRoundId = room?.id;

  useEffect(() => {
    if (currentRoundId === undefined || currentRoundId === null) return;

    const guessesQuery = query(
      collection(db, "rooms", "round-1", "guesses"),
      where("roundId", "==", currentRoundId),
    );

    return onSnapshot(
      guessesQuery,
      (snapshot) =>
        setRoundGuesses({ roundId: currentRoundId, count: snapshot.size }),
      (listenerError) => {
        console.error("Error retrieving current round guesses:", listenerError);
        setError("Could not load current round guesses.");
      },
    );
  }, [currentRoundId]);

  const currentRoundGuessCount =
    currentRoundId === null
      ? 0
      : roundGuesses && roundGuesses.roundId === currentRoundId
        ? roundGuesses.count
        : null;
  const isRoundActive = room?.status.toLowerCase() === "on-going";
  const isLoading =
    onlinePlayers === null ||
    trackedPlayers === null ||
    totalGuesses === null ||
    totalWins === null ||
    room === null ||
    currentRoundGuessCount === null;

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-slate-600">Live statistics from Firebase.</p>
          </div>
          <Link
            href="/play"
            className="text-slate-700 underline hover:text-slate-950"
          >
            Back to game
          </Link>
        </header>

        {error && (
          <p
            role="alert"
            className="mb-6 border border-red-300 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        <section
          aria-label="Aggregate runtime statistics"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <MetricCard
            label="Online players"
            value={onlinePlayers?.toLocaleString() ?? "—"}
            detail="Players with an active Firebase connection"
          />
          <MetricCard
            label="Tracked players"
            value={trackedPlayers?.toLocaleString() ?? "—"}
            detail="Player statistics records in Firestore"
          />
          <MetricCard
            label="Total guesses"
            value={totalGuesses?.toLocaleString() ?? "—"}
            detail="Guesses recorded across all players"
          />
          <MetricCard
            label="Total wins"
            value={totalWins?.toLocaleString() ?? "—"}
            detail="Wins recorded across all players"
          />
        </section>

        <section
          aria-labelledby="connectivity-heading"
          className="mt-6 border border-slate-300 p-5"
        >
          <h2 id="connectivity-heading" className="text-xl font-semibold">
            Network and Firebase
          </h2>
          <dl className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-600">Browser network</dt>
              <dd className="mt-1 font-medium">
                {network === null
                  ? "Checking…"
                  : network.online
                    ? "Online"
                    : "Offline"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Connection type</dt>
              <dd className="mt-1 font-medium">
                {network?.type ?? "Not reported by browser"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Estimated network RTT</dt>
              <dd className="mt-1 font-medium">
                {network?.rtt === null || network === null
                  ? "Not reported by browser"
                  : `${network.rtt} ms`}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">
                Firebase Realtime Database
              </dt>
              <dd className="mt-1 font-medium">
                {firebaseConnected === null
                  ? "Checking…"
                  : firebaseConnected
                    ? "Connected"
                    : "Disconnected"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-slate-500">
            Network type and RTT are browser estimates and may not be available
            on every device.
          </p>
        </section>

        <section className="mt-6 border border-slate-300 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Current round</h2>
            </div>
            <span className={isRoundActive ? "text-emerald-700" : "text-slate-600"}>
              {room?.status ?? (isLoading ? "Loading" : "Unknown")}
            </span>
          </div>
          <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Round number</p>
              <p className="mt-1 text-2xl font-semibold">
                {room?.id?.toLocaleString() ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Guesses this round</p>
              <p className="mt-1 text-2xl font-semibold">
                {currentRoundGuessCount?.toLocaleString() ?? "—"}
              </p>
            </div>
          </div>
        </section>

        <p className="mt-5 text-right text-xs text-slate-400" aria-live="polite">
          {isLoading ? "Connecting to Firebase…" : "Live updates enabled"}
        </p>
      </div>
    </main>
  );
}
