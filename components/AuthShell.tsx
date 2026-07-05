"use client";
import { useTheme } from "@/components/ThemeContext";

export default function AuthShell({
  title, subtitle, children,
}: { title: string; subtitle: string; children: React.ReactNode }) {
  const { vars } = useTheme();
  return (
    <div className="device-wrap">
      <div className="device" style={{ ...vars, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 26px", display: "flex",
          flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 30 }}>
            <div style={{
              width: 62, height: 62, borderRadius: 20, marginBottom: 22,
              background: "var(--hero-bg,#111)", display: "flex", alignItems: "center",
              justifyContent: "center", boxShadow: "0 12px 30px rgba(0,0,0,.4)",
            }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>₹</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.8px" }}>{title}</div>
            <div style={{ fontSize: 15, color: "var(--sub,#8e8e93)", marginTop: 4, fontWeight: 500 }}>{subtitle}</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
