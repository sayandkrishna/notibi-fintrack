"use client";
import Icon from "@/components/Icon";
import { useTheme } from "@/components/ThemeContext";
import type { Screen } from "@/components/WalletApp";

export default function TabBar({ screen, goto }: { screen: Screen; goto: (s: Screen) => void }) {
  const { theme } = useTheme();
  const inkHex = theme === "noir" ? "#ffffff" : "#000000";
  const items: { key: Screen; label: string; icon: string }[] = [
    { key: "home", label: "Wallet", icon: "home" },
    { key: "calendar", label: "Calendar", icon: "cal" },
    { key: "stats", label: "Stats", icon: "stats" },
  ];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 15, paddingTop: 8,
      background: "var(--navbg,rgba(20,20,22,.72))", backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)", borderTop: "1px solid var(--line,rgba(255,255,255,.08))",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "2px 12px 6px" }}>
        {items.map((n) => {
          const active = screen === n.key;
          const col = active ? inkHex : "#8e8e93";
          return (
            <button key={n.key} onClick={() => goto(n.key)} className="pressable" style={{
              flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, cursor: "pointer", padding: "6px 0", color: col,
            }}>
              <Icon name={n.icon} color={col} size={24} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1px" }}>{n.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ height: 5, width: 134, borderRadius: 100, background: "var(--ink,#fff)", opacity: .85, margin: "2px auto 8px" }} />
    </div>
  );
}
