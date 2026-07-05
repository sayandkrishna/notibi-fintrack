"use client";
import { useMemo } from "react";
import { Expense, haptic } from "@/lib/api";
import { CATS, CAT_BY_KEY, MON } from "@/lib/constants";
import { inr, pad } from "@/lib/format";
import { useTheme } from "@/components/ThemeContext";
import CatBadge from "@/components/CatBadge";

interface Props {
  expenses: Expense[];
  view: { y: number; m: number };
  setView: (v: { y: number; m: number }) => void;
}

export default function Stats(p: Props) {
  const { theme, icons } = useTheme();
  const inkHex = theme === "noir" ? "#ffffff" : "#000000";
  const useColor = icons === "category";

  const prefix = `${p.view.y}-${pad(p.view.m + 1)}`;
  const monthExpenses = useMemo(() => p.expenses.filter((e) => e.date.startsWith(prefix)), [p.expenses, prefix]);

  const byCat = useMemo(() => {
    const m: Partial<Record<string, number>> = {};
    monthExpenses.forEach((e) => { m[e.category] = (m[e.category] || 0) + e.amount; });
    return m;
  }, [monthExpenses]);

  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const maxCat = Math.max(1, ...Object.values(byCat as Record<string, number>));

  const rows = CATS
    .filter((c) => byCat[c.key])
    .map((c) => ({ cat: c, amount: byCat[c.key] as number }))
    .sort((a, b) => b.amount - a.amount);

  const changeMonth = (delta: number) => {
    haptic(6);
    let y = p.view.y, m = p.view.m + delta;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    p.setView({ y, m });
  };

  const avg = monthExpenses.length ? Math.round(total / monthExpenses.length) : 0;
  const topCat = rows[0]?.cat.name ?? "—";

  return (
    <div style={{ position: "absolute", inset: 0, top: 38, bottom: 0, overflowY: "auto", padding: "6px 18px 130px" }}>
      <div style={{ padding: "10px 2px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px" }}>Spending</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => changeMonth(-1)} className="pressable" style={navArrow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sub,#8e8e93)", minWidth: 62, textAlign: "center" }}>{MON[p.view.m]} {p.view.y}</span>
            <button onClick={() => changeMonth(1)} className="pressable" style={navArrow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-1.5px", marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{inr(total)}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--sub,#8e8e93)", marginTop: 2 }}>{monthExpenses.length} transactions</div>
      </div>

      {/* quick stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={tile}>
          <div style={tileLabel}>Avg / expense</div>
          <div style={tileValue}>{inr(avg)}</div>
        </div>
        <div style={tile}>
          <div style={tileLabel}>Top category</div>
          <div style={{ ...tileValue, fontSize: 18 }}>{topCat}</div>
        </div>
      </div>

      {rows.length > 0 ? (
        <div style={{ background: "var(--surface,#1c1c1e)", borderRadius: 18, padding: "6px 16px" }}>
          {rows.map((r, i) => (
            <div key={r.cat.key} style={{ padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--line,rgba(255,255,255,.08))" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CatBadge catKey={r.cat.key} size={36} iconSize={19} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{r.cat.name}</span>
                    <span style={{ fontWeight: 600, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{inr(r.amount)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 100, background: "var(--field,#2c2c2e)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.max(5, (r.amount / maxCat) * 100)}%`, background: useColor ? r.cat.color : inkHex, borderRadius: 100, transition: "width .5s ease" }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--sub,#8e8e93)", background: "var(--surface,#1c1c1e)", borderRadius: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink,#fff)" }}>Nothing this month</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Add expenses to see stats</div>
        </div>
      )}
    </div>
  );
}

const navArrow: React.CSSProperties = {
  width: 28, height: 28, borderRadius: "50%", border: "none", background: "var(--surface2,#2c2c2e)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink,#fff)",
};
const tile: React.CSSProperties = { background: "var(--surface,#1c1c1e)", borderRadius: 16, padding: "14px 16px" };
const tileLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--sub,#8e8e93)" };
const tileValue: React.CSSProperties = { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginTop: 6, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
