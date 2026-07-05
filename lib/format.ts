import { WD, MON } from "./constants";

export function pad(n: number): string { return n < 10 ? "0" + n : "" + n; }

// Indian rupee formatting (en-IN grouping)
export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function kfmt(t: number): string {
  return t >= 1000 ? "₹" + (t / 1000).toFixed(t % 1000 === 0 ? 0 : 1) + "k" : "₹" + t;
}

// ISO "YYYY-MM-DD" helpers working in UTC to avoid TZ drift
export function isoOf(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function todayIso(): string {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

export function dowOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// Turn an ISO day into a Date at UTC midnight (what we store)
export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function dateLabel(iso: string, today = todayIso()): string {
  if (iso === today) return "Today";
  const [ty, tm, td] = today.split("-").map(Number);
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(ty, tm - 1, td));
  const cur = new Date(Date.UTC(y, m - 1, d));
  if (t.getTime() - cur.getTime() === 86400000) return "Yesterday";
  return WD[dowOf(iso)] + ", " + d + " " + MON[m - 1];
}

// Build the weeks grid for a given month (year, monthIndex 0-11)
export interface CalCell { empty?: boolean; day?: number; iso?: string; }
export function buildWeeks(year: number, monthIndex: number): CalCell[][] {
  const startDow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const dim = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: CalCell[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ empty: true });
  for (let d = 1; d <= dim; d++) cells.push({ day: d, iso: `${year}-${pad(monthIndex + 1)}-${pad(d)}` });
  while (cells.length % 7) cells.push({ empty: true });
  const weeks: CalCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
