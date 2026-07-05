"use client";
import { useMemo, useState } from "react";
import { haptic } from "@/lib/api";
import { CATS, CategoryKey, PAYMENTS, PAYMENT_LABEL, PaymentKey, MON } from "@/lib/constants";
import { buildWeeks, dateLabel, pad } from "@/lib/format";
import { useTheme } from "@/components/ThemeContext";
import Icon from "@/components/Icon";
import CatBadge from "@/components/CatBadge";

interface Props {
  editing: boolean;
  today: string;
  amount: string;
  setAmount: (v: string | ((p: string) => string)) => void;
  cat: CategoryKey | null;
  setCat: (c: CategoryKey) => void;
  pay: PaymentKey;
  setPay: (p: PaymentKey) => void;
  date: string;
  setDate: (iso: string) => void;
  note: string;
  setNote: (note: string) => void;
  datePicker: boolean;
  setDatePicker: (b: boolean | ((p: boolean) => boolean)) => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function AddSheet(p: Props) {
  const { theme } = useTheme();
  const inkHex = theme === "noir" ? "#ffffff" : "#000000";

  // picker month follows the selected date
  const [pickY, pickM] = p.date.split("-").map(Number);
  const [view, setView] = useState({ y: pickY, m: pickM - 1 });
  const weeks = useMemo(() => buildWeeks(view.y, view.m), [view]);

  const key = (v: string) => {
    haptic(4);
    p.setAmount((a) => {
      if (v === "back") return a.slice(0, -1);
      if (v === ".") { if (a.includes(".")) return a; return a === "" ? "0." : a + "."; }
      if (a.includes(".") && a.split(".")[1].length >= 2) return a;
      if (a.replace(".", "").length >= 7) return a;
      if (a === "0") a = "";
      return a + v;
    });
  };

  const display = useMemo(() => {
    const a = p.amount;
    if (a === "") return "₹0";
    const [i, d] = a.split(".");
    const ii = parseInt(i || "0", 10).toLocaleString("en-IN");
    return "₹" + ii + (d !== undefined ? "." + d : "");
  }, [p.amount]);

  const canLog = (parseFloat(p.amount) || 0) > 0 && !!p.cat;
  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

  const changeMonth = (delta: number) => {
    let y = view.y, m = view.m + delta;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setView({ y, m });
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40 }}>
      <div onClick={p.onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", animation: "fadeIn .2s ease" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, top: 44, background: "var(--sheet,#1c1c1e)",
        borderRadius: "14px 14px 0 0", animation: "sheetUp .36s cubic-bezier(.22,1,.36,1)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: "var(--sub,#8e8e93)", opacity: .5, margin: "8px auto 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 6px" }}>
          <button onClick={p.onClose} style={{ background: "none", border: "none", color: "var(--sub,#8e8e93)", fontSize: 16, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{p.editing ? "Edit" : "New Expense"}</span>
          <button onClick={p.onSave} disabled={!canLog || p.saving} style={{
            background: "none", border: "none", color: canLog ? "var(--ink,#fff)" : "var(--sub,#8e8e93)",
            fontSize: 16, fontWeight: 700, cursor: canLog ? "pointer" : "default", opacity: canLog ? 1 : .6,
          }}>{p.saving ? "…" : p.editing ? "Save" : "Add"}</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-2px", color: (parseFloat(p.amount) || 0) > 0 ? "var(--ink,#fff)" : "var(--sub,#8e8e93)", fontVariantNumeric: "tabular-nums" }}>{display}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, margin: "8px 0 16px" }}>
            {CATS.map((c) => {
              const on = p.cat === c.key;
              return (
                <button key={c.key} onClick={() => { haptic(6); p.setCat(c.key); }} className="pressable" style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 2px",
                  border: "none", borderRadius: 16, background: on ? "var(--field,#2c2c2e)" : "transparent",
                  outline: on ? "2px solid var(--ink,#fff)" : "none", outlineOffset: "-2px", cursor: "pointer", color: "var(--ink,#fff)",
                }}>
                  <CatBadge catKey={c.key} size={44} iconSize={21} />
                  <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.1, textAlign: "center" }}>{c.short}</span>
                </button>
              );
            })}
          </div>

          <label style={{ display: "block", marginBottom: 9 }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--sub,#8e8e93)", margin: "0 0 7px 2px" }}>
              Expense name
            </span>
            <input
              value={p.note}
              onChange={(e) => p.setNote(e.target.value.slice(0, 120))}
              placeholder={p.cat ? CATS.find((c) => c.key === p.cat)?.name : "Optional note"}
              style={{
                width: "100%", height: 48, padding: "0 15px", border: "none", borderRadius: 14,
                background: "var(--field,#2c2c2e)", color: "var(--ink,#fff)", outline: "none",
                fontSize: 15, fontWeight: 600,
              }}
            />
          </label>

          <button onClick={() => { haptic(6); p.setDatePicker((v) => !v); }} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px",
            border: "none", borderRadius: 14, background: "var(--field,#2c2c2e)", cursor: "pointer", color: "var(--ink,#fff)", marginBottom: 9,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 15 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16v14H4zM4 9h16M8 3v4M16 3v4" /></svg>
              {dateLabel(p.date, p.today)}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sub,#8e8e93)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: p.datePicker ? "rotate(90deg)" : "none", transition: "transform .2s" }}><path d="M9 6l6 6-6 6" /></svg>
          </button>

          {p.datePicker && (
            <div style={{ background: "var(--field,#2c2c2e)", borderRadius: 16, padding: 12, marginBottom: 9, animation: "popIn .2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <button onClick={() => changeMonth(-1)} style={miniArrow}>‹</button>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{MON[view.m]} {view.y}</div>
                <button onClick={() => changeMonth(1)} style={miniArrow}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
                  <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--sub,#8e8e93)" }}>{w}</div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                  {week.map((c, ci) => {
                    if (c.empty) return <div key={ci} style={{ visibility: "hidden" }} />;
                    const iso = c.iso!;
                    const selPick = p.date === iso;
                    const isToday = iso === p.today;
                    return (
                      <button key={ci} onClick={() => { haptic(6); p.setDate(iso); p.setDatePicker(false); }} className="pressable" style={{
                        aspectRatio: "1", border: "none", borderRadius: 10,
                        background: selPick ? "var(--ink,#fff)" : (isToday ? "var(--surface,#3a3a3c)" : "transparent"),
                        color: selPick ? "var(--bg,#000)" : "var(--ink,#fff)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                      }}>{c.day}</button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
            {PAYMENTS.map((pm) => {
              const on = p.pay === pm;
              return (
                <button key={pm} onClick={() => { haptic(6); p.setPay(pm); }} className="pressable" style={{
                  flex: 1, padding: 12, border: "none", borderRadius: 13,
                  background: on ? "var(--ink,#fff)" : "var(--field,#2c2c2e)",
                  color: on ? "var(--bg,#000)" : "var(--ink,#fff)", fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}>{PAYMENT_LABEL[pm]}</button>
              );
            })}
          </div>
        </div>

        {/* keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, padding: "8px 20px 26px", background: "var(--sheet,#1c1c1e)" }}>
          {keypad.map((k) => (
            <button key={k} onClick={() => key(k)} style={{
              height: 52, border: "none", borderRadius: 15, background: "var(--field,#2c2c2e)", color: "var(--ink,#fff)",
              fontSize: 24, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {k === "back" ? <Icon name="back" color={inkHex} size={24} /> : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const miniArrow: React.CSSProperties = {
  background: "none", border: "none", color: "var(--ink,#fff)", fontSize: 22, fontWeight: 700, cursor: "pointer",
  width: 28, height: 28, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
};
