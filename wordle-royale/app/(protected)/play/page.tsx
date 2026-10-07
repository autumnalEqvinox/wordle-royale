import type { Metadata } from "next";
import PlayerAccount from "@/components/player-account";

export const metadata: Metadata = { title: "Your account" };
// This page intentionally waits for Firebase to restore the browser session.
export const instant = false;

export default function PlayerPage() {
  return <PlayerAccount />;
}
