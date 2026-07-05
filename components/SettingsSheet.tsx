"use client";
import { signOut } from "next-auth/react";
import { haptic } from "@/lib/api";
import { useTheme } from "@/components/ThemeContext";

export default function SettingsSheet({ userName, onClose }: { userName: string; onClose: () => void }) {
  const { theme, setTheme, icons, setIcons } = useTheme();

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 45 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", animation: "fadeIn .2s ease" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, background: "var(--sheet,#1c1c1e)",
        borderRadius: "18px 18px 0 0", animation: "sheetUp .34s cubic-bezier(.22,1,.36,1)", padding: "0 20px 30px",
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: "var(--sub,#8e8e93)", opacity: .5, margin: "10px auto 4px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 2px 18px" }}>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>Settings</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--sub,#8e8e93)", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Done</button>
        </div>

        <div style={{ background: "var(--surface,#1c1c1e)", borderRadius: 16, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--hero-bg,#111)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
            <div style={{ fontSize: 13, color: "var(--sub,#8e8e93)" }}>Signed in</div>
          </div>
        </div>

        <Segment label="Theme"
          value={theme}
          options={[{ v: "noir", l: "Noir" }, { v: "snow", l: "Snow" }]}
          onPick={(v) => { haptic(6); setTheme(v as "noir" | "snow"); }} />

        <div style={{ height: 12 }} />

        <Segment label="Icons"
          value={icons}
          options={[{ v: "monochrome", l: "Mono" }, { v: "category", l: "Color" }]}
          onPick={(v) => { haptic(6); setIcons(v as "monochrome" | "category"); }} />

        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
          width: "100%", marginTop: 22, padding: 15, borderRadius: 15, border: "none",
          background: "var(--surface2,#2c2c2e)", color: "#ff453a", fontSize: 16, fontWeight: 700, cursor: "pointer",
        }}>Sign out</button>
      </div>
    </div>
  );
}

function Segment({ label, value, options, onPick }: {
  label: string; value: string; options: { v: string; l: string }[]; onPick: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sub,#8e8e93)", margin: "0 4px 8px" }}>{label}</div>
      <div style={{ display: "flex", gap: 7 }}>
        {options.map((o) => {
          const on = value === o.v;
          return (
            <button key={o.v} onClick={() => onPick(o.v)} className="pressable" style={{
              flex: 1, padding: 13, border: "none", borderRadius: 13,
              background: on ? "var(--ink,#fff)" : "var(--field,#2c2c2e)",
              color: on ? "var(--bg,#000)" : "var(--ink,#fff)", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>{o.l}</button>
          );
        })}
      </div>
    </div>
  );
}
