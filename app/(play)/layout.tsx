"use client";

import type { ReactNode } from "react";
import { Settings, Palette, LogOut} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "grid",
  placeItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 50,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  color: "black",
  borderRadius: "8px",
  padding: "24px",
  maxWidth: "90vw",
};

function PaletteButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="Choose color palette">
        <Palette size={30} aria-hidden="true" />
      </button>

      {isOpen && (
        <div style={backdropStyle} onClick={() => setIsOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2>Color Palette</h2>
            <p>Palette options go here.</p>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function PlayLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "flex-start" }}>
        <button onClick={() => router.push("/login")} aria-label="Log Out">
            <LogOut size={30} aria-hidden="true" />
          </button>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <PaletteButton />
        </div>
      </header>

      {children}
    </div>
  );
}