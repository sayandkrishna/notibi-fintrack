"use client";
import { Expense, haptic } from "@/lib/api";
import { CAT_BY_KEY, PAYMENT_LABEL } from "@/lib/constants";
import { inr, dateLabel } from "@/lib/format";

// A single expense rendered as a torn-receipt / ticket card.
// By default tapping the card opens the edit sheet; pass `onOpen` to override
// that with e.g. opening the full-screen ticket view instead.
export default function TicketCard({
  expense, today, onEdit, onDelete, onOpen,
}: { expense: Expense; today: string; onEdit: (e: Expense) => void; onDelete: (id: string) => void; onOpen?: (e: Expense) => void }) {
  const cat = CAT_BY_KEY[expense.category];
  const title = expense.note && expense.note.trim() ? expense.note : cat.name;

  return (
    <div style={{ marginBottom: 22 }}>
      <div className="ticket" onClick={() => { haptic(8); (onOpen ?? onEdit)(expense); }} style={{ cursor: "pointer" }}>
        {/* head */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: "var(--ticket-ink,#1c1c1e)" }}>
            {inr(expense.amount)}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, padding: "5px 12px", borderRadius: 100, background: "var(--accent-soft,#eee)", color: "var(--accent,#a855f7)", fontSize: 12, fontWeight: 800, letterSpacing: ".4px" }}>
            {PAYMENT_LABEL[expense.payment].toUpperCase()}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 14, color: "var(--ticket-ink,#1c1c1e)" }}>
            <span style={{ marginRight: 6 }}>{cat.emoji}</span>{title}
          </div>
        </div>

        {/* perforation */}
        <div className="ticket-perf" />

        {/* details */}
        <Row label="CATEGORY" value={<span><span style={{ marginRight: 7 }}>{cat.emoji}</span>{cat.name}</span>} />
        <Divider />
        <Row label="PAID WITH" value={PAYMENT_LABEL[expense.payment]} />
        <Divider />
        <Row label="PAID ON" value={dateLabel(expense.date, today)} icon="📅" />
        <Divider />
        <Row label="TIME" value={expense.time} icon="🕒" />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
        <button
          onClick={() => { haptic(8); onEdit(expense); }}
          style={actionButton("var(--surface2,#2c2c2e)", "var(--ink,#fff)")}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z" /></svg>
          Edit
        </button>
        <button
          onClick={() => { haptic(16); onDelete(expense.id); }}
          style={actionButton("transparent", "#ff453a")}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ff453a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" /></svg>
          Delete
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: React.ReactNode; icon?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 2px" }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".6px", color: "var(--ticket-sub,#8a8a8f)" }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ticket-ink,#1c1c1e)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        {icon && <span>{icon}</span>}{value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1.5px dotted var(--ticket-line,#dcdce1)" }} />;
}

function actionButton(bg: string, color: string): React.CSSProperties {
  return {
    minWidth: 94, height: 38, borderRadius: 999, border: "none", background: bg, color,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
  };
}
