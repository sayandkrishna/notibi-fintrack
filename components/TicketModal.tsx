"use client";
import { useEffect, useRef, useState } from "react";
import { Expense, haptic } from "@/lib/api";
import { inr, dateLabel } from "@/lib/format";
import TicketCard from "@/components/TicketCard";

interface Props {
  rows: Expense[];       // all expenses for the opened date, newest first
  index: number;         // which one was tapped
  date: string;
  today: string;
  onClose: () => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

// Full-screen "ticket" page for a single expense, with left/right paging
// through the rest of that day's expenses.
export default function TicketModal(p: Props) {
  const clamp = (i: number) => Math.max(0, Math.min(p.rows.length - 1, i));
  const [idx, setIdx] = useState(clamp(p.index));

  const sx = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  // keep idx valid as rows shrink (e.g. after a delete) and auto-close when empty
  useEffect(() => {
    if (p.rows.length === 0) { p.onClose(); return; }
    setIdx((i) => clamp(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.rows.length]);

  if (p.rows.length === 0) return null;
  const total = p.rows.reduce((s, e) => s + e.amount, 0);
  const current = p.rows[idx];

  const go = (delta: number) => {
    if (clamp(idx + delta) === idx) return;
    haptic(6);
    setIdx((i) => clamp(i + delta));
  };

  const onDown = (e: React.PointerEvent) => {
    sx.current = e.clientX; setDragging(true);
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    let dx = e.clientX - sx.current;
    if (idx === 0 && dx > 0) dx *= 0.35;
    if (idx === p.rows.length - 1 && dx < 0) dx *= 0.35;
    setDragX(dx);
  };
  const onUp = () => {
    if (dragX < -60) go(1);
    else if (dragX > 60) go(-1);
    setDragging(false); setDragX(0);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50 }}>
      <div onClick={p.onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", animation: "fadeIn .2s ease" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, top: 44, background: "var(--bg,#000)",
        borderRadius: "20px 20px 0 0", animation: "sheetUp .36s cubic-bezier(.22,1,.36,1)",
        display: "flex", flexDirection: "column", overflow: "hidden", color: "var(--ink,#fff)",
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: "var(--sub,#8e8e93)", opacity: .5, margin: "8px auto 0" }} />

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 18px" }}>
          <button onClick={p.onClose} className="pressable" title="Close" style={{ background: "none", border: "none", color: "var(--ink,#fff)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, marginLeft: -4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.4px" }}>{dateLabel(p.date, p.today)}</span>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.4px", fontVariantNumeric: "tabular-nums" }}>{inr(total)}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 30px" }}>
          <div
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{
              transform: `translateX(${dragX}px)`,
              transition: dragging ? "none" : "transform .3s cubic-bezier(.22,1,.36,1)",
              touchAction: "pan-y",
            }}
          >
            <TicketCard expense={current} today={p.today} onEdit={p.onEdit} onDelete={p.onDelete} />
          </div>

          {p.rows.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: -6 }}>
              <button onClick={() => go(-1)} disabled={idx === 0} className="pressable" style={arrowBtn(idx === 0)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sub,#8e8e93)", fontVariantNumeric: "tabular-nums" }}>{idx + 1} / {p.rows.length}</span>
              <button onClick={() => go(1)} disabled={idx === p.rows.length - 1} className="pressable" style={arrowBtn(idx === p.rows.length - 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function arrowBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 40, height: 40, borderRadius: "50%", border: "none",
    background: "var(--surface2,#2c2c2e)", color: "var(--ink,#fff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? .35 : 1,
  };
}
