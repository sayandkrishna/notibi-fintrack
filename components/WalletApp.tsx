"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, Expense, haptic } from "@/lib/api";
import { CategoryKey, PaymentKey, THEMES } from "@/lib/constants";
import { todayIso, isoOf, pad } from "@/lib/format";
import { useTheme } from "@/components/ThemeContext";
import TabBar from "@/components/TabBar";
import Home from "@/components/Home";
import CalendarView from "@/components/CalendarView";
import Stats from "@/components/Stats";
import AddSheet from "@/components/AddSheet";
import SettingsSheet from "@/components/SettingsSheet";
import TicketModal from "@/components/TicketModal";

export type Screen = "home" | "calendar" | "stats";

export default function WalletApp({ userName }: { userName: string }) {
  const { vars } = useTheme();
  const TODAY = todayIso();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");

  // add sheet
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [addCat, setAddCat] = useState<CategoryKey | null>(null);
  const [addPay, setAddPay] = useState<PaymentKey>("UPI");
  const [addDate, setAddDate] = useState(TODAY);
  const [addNote, setAddNote] = useState("");
  const [datePicker, setDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // misc
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [calSelected, setCalSelected] = useState(TODAY);
  const [newId, setNewId] = useState<string | null>(null);

  // full-screen ticket view (opened by tapping any expense)
  const [ticketDate, setTicketDate] = useState<string | null>(null);
  const [ticketIndex, setTicketIndex] = useState(0);

  // viewed month (drives hero, calendar, stats). default = current month
  const [view, setView] = useState(() => {
    const [y, m] = TODAY.split("-").map(Number);
    return { y, m: m - 1 };
  });

  // animated hero total
  const [shownTotal, setShownTotal] = useState(0);
  const raf = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const { expenses } = await api.list();
      setExpenses(expenses);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // total of the currently viewed month
  const monthTotal = useMemo(() => {
    const prefix = `${view.y}-${pad(view.m + 1)}`;
    return expenses.filter((e) => e.date.startsWith(prefix)).reduce((s, e) => s + e.amount, 0);
  }, [expenses, view]);

  const animateTotal = useCallback((to: number) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const from = shownTotal, start = performance.now(), dur = 650;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setShownTotal(from + (to - from) * e);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [shownTotal]);

  useEffect(() => { animateTotal(monthTotal); /* eslint-disable-next-line */ }, [monthTotal]);
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  // ---- add sheet actions ----
  const openAdd = () => {
    haptic(10);
    setEditId(null); setAddAmount(""); setAddCat(null); setAddPay("UPI");
    setAddDate(TODAY); setAddNote(""); setDatePicker(false); setAddOpen(true);
  };
  const startEdit = (e: Expense) => {
    haptic(8);
    setEditId(e.id); setAddAmount(String(e.amount)); setAddCat(e.category);
    setAddPay(e.payment); setAddDate(e.date); setAddNote(e.note ?? ""); setDatePicker(false); setAddOpen(true);
    setTicketDate(null); // close the ticket view (if open) so the edit sheet sits on top
  };
  const closeAdd = () => { setAddOpen(false); setDatePicker(false); };

  const save = async () => {
    const amt = Math.round(parseFloat(addAmount) || 0);
    if (amt <= 0 || !addCat || saving) { haptic(20); return; }
    haptic(14); setSaving(true);
    const note = addNote.trim() || undefined;
    try {
      if (editId) {
        const { expense } = await api.update(editId, { amount: amt, category: addCat, payment: addPay, date: addDate, note });
        setExpenses((xs) => xs.map((x) => (x.id === editId ? expense : x)));
        setNewId(editId);
      } else {
        const { expense } = await api.create({ amount: amt, category: addCat, payment: addPay, date: addDate, note });
        setExpenses((xs) => [expense, ...xs]);
        setNewId(expense.id);
        setScreen("home");
      }
      setAddOpen(false); setDatePicker(false);
      setTimeout(() => setNewId(null), 700);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save");
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    haptic(16);
    const prev = expenses;
    setExpenses((xs) => xs.filter((x) => x.id !== id)); // optimistic
    try { await api.remove(id); } catch { setExpenses(prev); }
  };

  const goto = (s: Screen) => { haptic(6); setScreen(s); if (s !== "home") setDateFilter(null); };

  // ---- full-screen ticket view ----
  // Rows are recomputed live from `expenses` (rather than a captured snapshot)
  // so deletes/edits made while the ticket is open stay in sync.
  const ticketRows = useMemo(
    () => (ticketDate ? expenses.filter((e) => e.date === ticketDate).sort((a, b) => (a.time < b.time ? 1 : -1)) : []),
    [expenses, ticketDate]
  );
  const openTicket = (_rows: Expense[], index: number, date: string) => {
    haptic(8); setTicketDate(date); setTicketIndex(index);
  };
  const closeTicket = () => setTicketDate(null);

  const rootStyle: React.CSSProperties = { ...vars };

  return (
    <div className="device-wrap">
      <div className="device" style={rootStyle}>
        {screen === "home" && (
          <Home
            expenses={expenses}
            loading={loading}
            today={TODAY}
            view={view}
            shownTotal={shownTotal}
            dateFilter={dateFilter}
            newId={newId}
            onClearFilter={() => { haptic(6); setDateFilter(null); }}
            onOpenAdd={openAdd}
            onOpenSettings={() => setSettingsOpen(true)}
            onEdit={startEdit}
            onDelete={del}
            onOpenTicket={openTicket}
          />
        )}

        {screen === "calendar" && (
          <CalendarView
            expenses={expenses}
            today={TODAY}
            view={view}
            setView={setView}
            selected={calSelected}
            setSelected={setCalSelected}
            onEdit={startEdit}
            onDelete={del}
            onOpenTicket={openTicket}
          />
        )}

        {screen === "stats" && (
          <Stats expenses={expenses} view={view} setView={setView} />
        )}

        <TabBar screen={screen} goto={goto} onOpenSettings={() => setSettingsOpen(true)} settingsOpen={settingsOpen} />

        {addOpen && (
          <AddSheet
            editing={!!editId}
            today={TODAY}
            amount={addAmount}
            setAmount={setAddAmount}
            cat={addCat}
            setCat={setAddCat}
            pay={addPay}
            setPay={setAddPay}
            date={addDate}
            setDate={setAddDate}
            note={addNote}
            setNote={setAddNote}
            datePicker={datePicker}
            setDatePicker={setDatePicker}
            saving={saving}
            onClose={closeAdd}
            onSave={save}
          />
        )}

        {settingsOpen && (
          <SettingsSheet userName={userName} onClose={() => setSettingsOpen(false)} />
        )}

        {ticketDate && ticketRows.length > 0 && (
          <TicketModal
            rows={ticketRows}
            index={ticketIndex}
            date={ticketDate}
            today={TODAY}
            onClose={closeTicket}
            onEdit={startEdit}
            onDelete={del}
          />
        )}
      </div>
    </div>
  );
}
