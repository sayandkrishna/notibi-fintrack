import { CategoryKey, PaymentKey } from "./constants";

export interface Expense {
  id: string;
  amount: number;
  category: CategoryKey;
  payment: PaymentKey;
  date: string;   // YYYY-MM-DD
  note: string | null;
  time: string;   // HH:MM
  createdAt: string;
}

export interface NewExpense {
  amount: number;
  category: CategoryKey;
  payment: PaymentKey;
  date: string;
  note?: string;
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Request failed");
  return data as T;
}

export const api = {
  list: () => fetch("/api/expenses", { cache: "no-store" }).then((r) => json<{ expenses: Expense[] }>(r)),
  create: (e: NewExpense) =>
    fetch("/api/expenses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e),
    }).then((r) => json<{ expense: Expense }>(r)),
  update: (id: string, e: Partial<NewExpense>) =>
    fetch(`/api/expenses/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e),
    }).then((r) => json<{ expense: Expense }>(r)),
  remove: (id: string) =>
    fetch(`/api/expenses/${id}`, { method: "DELETE" }).then((r) => json<{ ok: boolean }>(r)),
};

export function haptic(ms = 8) {
  try { if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms); } catch { /* noop */ }
}
