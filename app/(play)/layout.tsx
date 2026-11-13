"use client";

import type { ReactNode } from "react";
import { Activity, Palette, LogOut, X, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setDoc, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import Link from "next/link";

const WHEEL_SIZE = 220;

// HSV -> hex (h: 0-360, s: 0-1, v: 0-1)
function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const val = v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return Math.round(val * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

// hex -> HSV (h: 0-360, s: 0-1, v: 0-1)
function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const n = parseInt(match[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: max === 0 ? 0 : d / max, v: max };
}

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
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
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

const wheelStyle: React.CSSProperties = {
  position: "relative",
  width: WHEEL_SIZE,
  height: WHEEL_SIZE,
  borderRadius: "50%",
  background:
    "radial-gradient(circle closest-side, white, rgba(255,255,255,0)), " +
    "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
  cursor: "crosshair",
  touchAction: "none", // lets touch dragging work without scrolling the page
};

function ColorWheel({
  hue,
  sat,
  val,
  onChange,
}: {
  hue: number;
  sat: number;
  val: number;
  onChange: (h: number, s: number) => void;
}) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromPointer = (clientX: number, clientY: number) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const radius = rect.width / 2;
    const dx = clientX - (rect.left + radius);
    const dy = clientY - (rect.top + radius);
    // conic-gradient starts at the top and goes clockwise
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const h = (angle + 360) % 360;
    const s = Math.min(Math.hypot(dx, dy) / radius, 1);
    onChange(h, s);
  };

  const rad = (hue * Math.PI) / 180;
  const r = WHEEL_SIZE / 2;
  const markerX = r + Math.sin(rad) * sat * r;
  const markerY = r - Math.cos(rad) * sat * r;

  return (
    <div
      ref={wheelRef}
      style={wheelStyle}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromPointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (dragging.current) updateFromPointer(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {/* darkens the wheel as brightness goes down */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: "black",
          opacity: 1 - val,
          pointerEvents: "none",
        }}
      />
      {/* selection marker */}
      <div
        style={{
          position: "absolute",
          left: markerX - 10,
          top: markerY - 10,
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "3px solid white",
          boxShadow: "0 0 0 1.5px black",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function PaletteButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);
  const [val, setVal] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Fires once Firebase restores the session after a reload
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const saved = snap.data()?.color;
        if (cancelled || typeof saved !== "string") return;

        const hsv = hexToHsv(saved);
        if (hsv) {
          setHue(hsv.h);
          setSat(hsv.s);
          setVal(hsv.v);
        }
      } catch (err) {
        console.error("Failed to load saved color", err);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const color = hsvToHex(hue, sat, val);

  const saveColor = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return; // not signed in, nothing to save to
    setSaving(true);
    try {
      await setDoc(doc(db, "users", uid), { color }, { merge: true });
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to save color", err);
    } finally {
      setSaving(false);
    }
  };

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

            <h2>Choose a Color!</h2>

            <ColorWheel
              hue={hue}
              sat={sat}
              val={val}
              onChange={(h, s) => {
                setHue(h);
                setSat(s);
              }}
            />

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Brightness
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
              />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: color,
                  border: "2px solid #d4d4d4",
                }}
                aria-hidden="true"
              />
              <code>{color}</code>
              <button onClick={saveColor} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
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
      <header style={{ display: "flex", justifyContent: "flex-start", gap: "30px" }}>
        <button onClick={() => router.push("/login")} aria-label="Log Out">
          <LogOut size={35} aria-hidden="true" />
        </button>

          <PaletteButton />

          <Link href="/dashboard" aria-label="View Runtime Dashboard">
            <Activity size={35} aria-hidden="true" />
          </Link>
          
          <Link href="/personalstats" aria-label="View Personal Stats">
            <User size={35} aria-hidden="true" />
          </Link>
          
      </header>
      {children}
    </div>
  );
}
