"use client";

import type { ReactNode } from "react";
import { Palette, LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../lib/firebase"; 

// Color choices for the palette popup
const COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
];

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "grid",
  placeItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.62)",
  zIndex: 50,
};

const modalStyle: React.CSSProperties = {
  position: "relative", 
  backgroundColor: "white",
  color: "black",
  borderRadius: "18px",
  padding: "24px",
  maxWidth: "90vw",
};

const swatchRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  margin: "16px 0",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  color: "black",
};

function swatchStyle(color: string, selected: boolean): React.CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: color,
    border: selected ? "4px solid black" : "2px solid #d4d4d4",
    cursor: "pointer",
    padding: 0,
  };
}

function PaletteButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="Choose color palette">
        <Palette size={35} aria-hidden="true" />
      </button>

      {isOpen && (
        <div style={backdropStyle}>
          <div style={modalStyle}>
            <button
              style={closeButtonStyle}
              onClick={() => setIsOpen(false)}
              aria-label="Close color palette"
            >
              <X size={24} aria-hidden="true" />
            </button>

            <h2>Choose a Color to differentiate yourself!</h2>

            <div style={swatchRowStyle}>
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  style={swatchStyle(c.value, c.value === selectedColor)}
                  onClick={() => {
                    setSelectedColor(c.value);
                    setDoc(doc(db, "users", auth.currentUser?.uid || ""), { color: c.value }, { merge: true });
                  }}
                  aria-label={c.name}
                  aria-pressed={c.value === selectedColor}
                  title={c.name}
                />
              ))}
            </div>
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
          <LogOut size={35} aria-hidden="true" />
        </button>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <PaletteButton />
        </div>
      </header>

      {children}
    </div>
  );
}