import type { Metadata } from "next";
import PlayerAccount from "@/components/player-account";

export const metadata: Metadata = { title: "Your account" };

export default function PlayerPage() {
  return <PlayerAccount />;
}
