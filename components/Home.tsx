"use client";
import { useMemo, useRef, useState } from "react";
import { Expense } from "@/lib/api";
import { CAT_BY_KEY } from "@/lib/constants";
import { inr, dateLabel, pad, dowOf } from "@/lib/format";
import { WD, MON } from "@/lib/constants";
import { useTheme } from "@/components/ThemeContext";
import Icon from "@/components/Icon";
import CatBadge from "@/components/CatBadge";
import { PAYMENT_LABEL } from "@/lib/constants";

interface Props {
  expenses: Expense[];
  loading: boolean;
  today: string;
  view: { y: number; m: number };
  shownTotal: number;
  dateFilter: string | null;
  newId: string | null;
  onClearFilter: () => void;
  onOpenAdd: () => void;
  onOpenSettings: () => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  onOpenTicket: (rows: Expense[], index: number, date: string) => void;
}

export default function Home(p: Props) {
  const { theme } = useTheme();

  // ---- swipe state ----
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [swipeDx, setSwipeDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sx = useRef(0), sy = useRef(0), base = useRef(0);
  const moved = useRef(false);

  const onDown = (id: string, e: React.PointerEvent) => {
    sx.current = e.clientX; sy.current = e.clientY;
    base.current = swipeId === id ? swipeDx : 0;
    moved.current = false;
    setSwipeId(id); setDragging(true);
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
  };
  const onMove = (id: string, e: React.PointerEvent) => {
    if (!dragging || swipeId !== id) return;
    let dx = e.clientX - sx.current;
    if (Math.abs(e.clientY - sy.current) > Math.abs(dx) + 10 && Math.abs(dx) < 10) return;
    if (Math.abs(dx) > 4) moved.current = true;
    dx = Math.max(-124, Math.min(0, dx + base.current));
    setSwipeDx(dx);
  };
  const onUp = (id: string, rows: Expense[], idx: number, date: string) => {
    const wasOpen = base.current <= -60;
    const open = swipeDx < -56;
    setDragging(false);
    if (!moved.current) {
      // plain tap: if the row's action buttons were showing, tapping closes
      // them; otherwise it opens the full ticket view.
      if (wasOpen) { setSwipeDx(0); setSwipeId(null); }
      else { setSwipeDx(0); setSwipeId(null); p.onOpenTicket(rows, idx, date); }
      return;
    }
    setSwipeDx(open ? -120 : 0); setSwipeId(open ? id : null);
  };

  const dayTot = useMemo(() => {
    const m: Record<string, number> = {};
    p.expenses.forEach((e) => { m[e.date] = (m[e.date] || 0) + e.amount; });
    return m;
  }, [p.expenses]);

  // filtered + grouped list
  const groups = useMemo(() => {
    let list = p.expenses.slice();
    if (p.dateFilter) list = list.filter((e) => e.date === p.dateFilter);
    list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1));
    const order: string[] = []; const map: Record<string, Expense[]> = {};
    list.forEach((e) => { if (!map[e.date]) { map[e.date] = []; order.push(e.date); } map[e.date].push(e); });
    return order.map((date) => ({
      date,
      label: dateLabel(date, p.today),
      total: map[date].reduce((s, e) => s + e.amount, 0),
      rows: map[date],
    }));
  }, [p.expenses, p.dateFilter, p.today]);

  const filterTotal = useMemo(
    () => (p.dateFilter ? p.expenses.filter((e) => e.date === p.dateFilter).reduce((s, e) => s + e.amount, 0) : 0),
    [p.expenses, p.dateFilter]
  );

  // 7-day bars ending today
  const week7 = useMemo(() => {
    const days: { iso: string }[] = [];
    const [ty, tm, td] = p.today.split("-").map(Number);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(ty, tm - 1, td - i));
      days.push({ iso: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` });
    }
    const max = Math.max(1, ...days.map((x) => dayTot[x.iso] || 0));
    return days.map((x) => {
      const t = dayTot[x.iso] || 0;
      return {
        label: WD[dowOf(x.iso)][0],
        h: Math.max(4, (t / max) * 26),
        on: t > 0,
      };
    });
  }, [dayTot, p.today]);

  const monthLabel = `${MON[p.view.m]} ${p.view.y}`.toUpperCase();

  return (
    <div style={{ position: "absolute", inset: 0, bottom: 0, overflowY: "auto", padding: "6px 18px 130px" }}>
      {/* title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 2px 14px" }}>
        <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px" }}>Wallet</span>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button onClick={p.onOpenSettings} className="pressable" title="Settings" style={circleBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></svg>
          </button>
          <button onClick={p.onOpenAdd} className="pressable" style={circleBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
      </div>

      {/* hero */}
      <div style={{
        borderRadius: 26, padding: "22px 22px 20px", background: "var(--hero-bg,#0a0a0a)",
        border: "1px solid var(--hero-line,rgba(255,255,255,.12))", boxShadow: "0 20px 40px rgba(0,0,0,.45)",
        color: "var(--hero-ink,#fff)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.6px", opacity: .55 }}>{monthLabel}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, opacity: .55 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8h16l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></svg>
            WALLET
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, opacity: .5, marginTop: 16 }}>Total spent this month</div>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{inr(p.shownTotal)}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 34, marginTop: 18 }}>
          {week7.map((b, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: 26 }}>
                <div style={{ width: "100%", height: b.h, borderRadius: 3, background: b.on ? "#fff" : "rgba(255,255,255,.18)", opacity: b.on ? .9 : 1, transition: "height .4s ease" }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, opacity: .4 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* filter chip */}
      {p.dateFilter && (
        <button onClick={p.onClearFilter} style={{
          display: "inline-flex", alignItems: "center", gap: 7, margin: "18px 2px 0", padding: "8px 13px",
          border: "none", borderRadius: 100, background: "var(--surface2,#2c2c2e)", color: "var(--ink,#fff)",
          fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          {dateLabel(p.dateFilter, p.today)} · {inr(filterTotal)}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6" /></svg>
        </button>
      )}

      {/* transactions */}
      {groups.map((g) => (
        <div key={g.date} style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 4px 9px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sub,#8e8e93)", letterSpacing: ".2px" }}>{g.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sub,#8e8e93)", fontVariantNumeric: "tabular-nums" }}>{inr(g.total)}</span>
          </div>
          <div style={{ background: "var(--surface,#1c1c1e)", borderRadius: 18, overflow: "hidden" }}>
            {g.rows.map((e, idx) => {
              const off = swipeId === e.id ? swipeDx : 0;
              const cat = CAT_BY_KEY[e.category];
              return (
                <div key={e.id} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, display: "flex", alignItems: "stretch" }}>
                    <button onClick={() => p.onEdit(e)} style={actBtn("var(--surface2,#3a3a3c)")}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z" /></svg>
                    </button>
                    <button onClick={() => p.onDelete(e.id)} style={actBtn("#ff453a", "#fff")}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" /></svg>
                    </button>
                  </div>
                  <div
                    onPointerDown={(ev) => onDown(e.id, ev)}
                    onPointerMove={(ev) => onMove(e.id, ev)}
                    onPointerUp={() => onUp(e.id, g.rows, idx, g.date)}
                    onPointerCancel={() => onUp(e.id, g.rows, idx, g.date)}
                    style={{
                      transform: `translateX(${off}px)`,
                      transition: dragging ? "none" : "transform .3s cubic-bezier(.22,1,.36,1)",
                      animation: p.newId === e.id ? "rowIn .5s ease" : undefined,
                      touchAction: "pan-y", position: "relative", zIndex: 1,
                    }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: 13, padding: "12px 15px",
                      background: "var(--surface,#1c1c1e)",
                      borderTop: idx === 0 ? "none" : "1px solid var(--line,rgba(255,255,255,.08))",
                    }}>
                      <CatBadge catKey={e.category} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat.name}</div>
                        <div style={{ fontSize: 13, color: "var(--sub,#8e8e93)", fontWeight: 500, marginTop: 1 }}>{PAYMENT_LABEL[e.payment]} · {e.time}</div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.4px", fontVariantNumeric: "tabular-nums" }}>{inr(e.amount)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!p.loading && groups.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--sub,#8e8e93)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink,#fff)" }}>No expenses here</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Tap + to add one</div>
        </div>
      )}
      {p.loading && (
        <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--sub,#8e8e93)", fontSize: 14 }}>Loading…</div>
      )}
    </div>
  );
}

const circleBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: "50%", border: "none", background: "var(--surface2,#2c2c2e)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink,#fff)",
};
function actBtn(bg: string, color = "var(--ink,#fff)"): React.CSSProperties {
  return { width: 56, border: "none", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, cursor: "pointer" };
}
