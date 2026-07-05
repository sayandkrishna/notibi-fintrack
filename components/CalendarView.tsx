"use client";
import { useEffect, useMemo, useState } from "react";
import { Expense, haptic } from "@/lib/api";
import { CAT_BY_KEY, MON } from "@/lib/constants";
import { inr, kfmt, dateLabel, buildWeeks, pad } from "@/lib/format";
import { useTheme } from "@/components/ThemeContext";
import TicketCard from "@/components/TicketCard";

interface Props {
  expenses: Expense[];
  today: string;
  view: { y: number; m: number };
  setView: (v: { y: number; m: number }) => void;
  selected: string;
  setSelected: (iso: string) => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  onOpenTicket: (rows: Expense[], index: number, date: string) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarView(p: Props) {
  useTheme(); // subscribe to theme changes so vars re-read

  // "normal" = stacked list of every ticket for the day (as before).
  // "swipe" = one ticket at a time, paged with the arrows below the calendar.
  const [dayMode, setDayMode] = useState<"swipe" | "list">("swipe");
  const [selIndex, setSelIndex] = useState(0);

  // per-day aggregate: total + distinct category emojis
  const dayInfo = useMemo(() => {
    const m: Record<string, { total: number; emojis: string[] }> = {};
    // oldest first so emoji order is stable
    [...p.expenses].reverse().forEach((e) => {
      const info = (m[e.date] ||= { total: 0, emojis: [] });
      info.total += e.amount;
      const em = CAT_BY_KEY[e.category].emoji;
      if (!info.emojis.includes(em)) info.emojis.push(em);
    });
    return m;
  }, [p.expenses]);

  const monthPrefix = `${p.view.y}-${pad(p.view.m + 1)}`;
  const monthExpenses = p.expenses.filter((e) => e.date.startsWith(monthPrefix));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const weeks = useMemo(() => buildWeeks(p.view.y, p.view.m), [p.view]);

  const selRows = p.expenses
    .filter((e) => e.date === p.selected)
    .sort((a, b) => (a.time < b.time ? 1 : -1));
  const selTotal = selRows.reduce((s, e) => s + e.amount, 0);

  // reset paging position whenever a new day is selected
  useEffect(() => { setSelIndex(0); }, [p.selected]);
  useEffect(() => { if (selIndex > selRows.length - 1) setSelIndex(Math.max(0, selRows.length - 1)); }, [selRows.length, selIndex]);

  const changeMonth = (delta: number) => {
    haptic(6);
    let y = p.view.y, m = p.view.m + delta;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    p.setView({ y, m });
  };

  const pageSel = (delta: number) => {
    haptic(6);
    setSelIndex((i) => Math.max(0, Math.min(selRows.length - 1, i + delta)));
  };

  return (
    <div style={{ position: "absolute", inset: 0, top: 38, bottom: 0, overflowY: "auto", padding: "6px 18px 130px" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "10px 2px 8px" }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1 }}>{MON[p.view.m]}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--sub,#8e8e93)", marginTop: 3 }}>{p.view.y}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.6px", fontVariantNumeric: "tabular-nums" }}>{inr(monthTotal)}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sub,#8e8e93)" }}>{monthExpenses.length} transactions</div>
        </div>
      </div>

      {/* month switcher */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px 12px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sub,#8e8e93)" }}>{MON[p.view.m]} {p.view.y}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => changeMonth(-1)} className="pressable" style={navArrow}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button onClick={() => changeMonth(1)} className="pressable" style={navArrow}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      {/* weekday labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 6 }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--sub,#8e8e93)" }}>{w}</div>
        ))}
      </div>

      {/* grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
            {week.map((c, ci) => {
              if (c.empty) return <div key={ci} />;
              const iso = c.iso!;
              const info = dayInfo[iso];
              const has = !!info;
              const isToday = iso === p.today;
              const sel = p.selected === iso;
              return (
                <button
                  key={ci}
                  onClick={() => { haptic(8); p.setSelected(iso); }}
                  className={has ? "pressable" : "pressable hatch"}
                  style={{
                    position: "relative", minHeight: 72, border: "none", borderRadius: 13,
                    background: has ? "var(--surface,#fff)" : "transparent",
                    boxShadow: has ? "0 4px 12px rgba(0,0,0,.18)" : "none",
                    cursor: "pointer", padding: "5px 4px 4px", overflow: "hidden",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    color: "var(--ink,#fff)",
                    outline: sel ? "2px solid var(--accent,#a855f7)" : (isToday ? "1.5px solid var(--ink,#fff)" : "none"),
                    outlineOffset: "-2px",
                  }}>
                  <span style={{
                    position: "absolute", top: 5, left: 7, fontSize: 11, fontWeight: 700,
                    fontVariantNumeric: "tabular-nums", color: has ? "var(--ink,#fff)" : "var(--sub,#8e8e93)",
                    opacity: has ? 0.9 : 0.7,
                  }}>{c.day}</span>
                  {has && (
                    <>
                      <div style={{ marginTop: 20, fontSize: 15, lineHeight: 1, display: "flex", gap: 1 }}>
                        {info.emojis.slice(0, 2).map((e, i) => <span key={i}>{e}</span>)}
                      </div>
                      <span style={{ marginTop: "auto", fontSize: 9.5, fontWeight: 800, color: "var(--accent,#a855f7)", fontVariantNumeric: "tabular-nums" }}>
                        {kfmt(info.total)}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* selected day */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "26px 4px 16px" }}>
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.4px" }}>{dateLabel(p.selected, p.today)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--sub,#8e8e93)", fontVariantNumeric: "tabular-nums" }}>{inr(selTotal)}</span>
          {selRows.length > 0 && (
            <button
              onClick={() => { haptic(6); setDayMode((m) => (m === "swipe" ? "list" : "swipe")); }}
              className="pressable" title={dayMode === "swipe" ? "Show as list" : "Show swipeable"}
              style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "var(--surface2,#2c2c2e)", color: "var(--ink,#fff)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              {dayMode === "swipe" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 10h16" /></svg>
              )}
            </button>
          )}
        </div>
      </div>

      {selRows.length === 0 && (
        <div style={{ textAlign: "center", padding: "34px 20px", color: "var(--sub,#8e8e93)", background: "var(--surface,#1c1c1e)", borderRadius: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink,#fff)" }}>No spending</div>
          <div style={{ fontSize: 13, marginTop: 3 }}>Nothing logged on this day — tap + to add</div>
        </div>
      )}

      {selRows.length > 0 && dayMode === "list" && (
        selRows.map((e, i) => (
          <TicketCard key={e.id} expense={e} today={p.today} onEdit={p.onEdit} onDelete={p.onDelete}
            onOpen={(exp) => p.onOpenTicket(selRows, i, p.selected)} />
        ))
      )}

      {selRows.length > 0 && dayMode === "swipe" && (
        <>
          <TicketCard
            key={selRows[selIndex].id}
            expense={selRows[selIndex]}
            today={p.today}
            onEdit={p.onEdit}
            onDelete={p.onDelete}
            onOpen={(exp) => p.onOpenTicket(selRows, selIndex, p.selected)}
          />
          {/* left / right arrows to page through this day's tickets */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: -6 }}>
            <button onClick={() => pageSel(-1)} disabled={selIndex === 0} className="pressable" style={pageArrow(selIndex === 0)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sub,#8e8e93)", fontVariantNumeric: "tabular-nums" }}>{selIndex + 1} / {selRows.length}</span>
            <button onClick={() => pageSel(1)} disabled={selIndex === selRows.length - 1} className="pressable" style={pageArrow(selIndex === selRows.length - 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const navArrow: React.CSSProperties = {
  width: 30, height: 30, borderRadius: "50%", border: "none", background: "var(--surface2,#2c2c2e)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink,#fff)",
};

function pageArrow(disabled: boolean): React.CSSProperties {
  return {
    width: 40, height: 40, borderRadius: "50%", border: "none",
    background: "var(--surface2,#2c2c2e)", color: "var(--ink,#fff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? .35 : 1,
  };
}
