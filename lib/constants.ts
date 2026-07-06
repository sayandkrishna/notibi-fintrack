// Category, payment, icon & theme definitions — ported from the original design.

export type CategoryKey =
  | "FOOD" | "GROCERIES" | "TRANSPORT" | "SHOPPING"
  | "BILLS" | "ENTERTAINMENT" | "HEALTH" | "TRAVEL";

export type PaymentKey = "UPI" | "CARD" | "CASH";

export interface CatDef {
  key: CategoryKey;
  name: string;
  short: string;
  color: string;
  icon: string;
  emoji: string;
}

export const CATS: CatDef[] = [
  { key: "FOOD",          name: "Food & Drink",   short: "Food",     color: "#ff9f0a", icon: "food",          emoji: "🍔" },
  { key: "GROCERIES",     name: "Groceries",      short: "Grocery",  color: "#30d158", icon: "groceries",     emoji: "🛒" },
  { key: "TRANSPORT",     name: "Transport",      short: "Transit",  color: "#0a84ff", icon: "transport",     emoji: "🚕" },
  { key: "SHOPPING",      name: "Shopping",       short: "Shopping", color: "#bf5af2", icon: "shopping",      emoji: "🛍️" },
  { key: "BILLS",         name: "Bills",          short: "Bills",    color: "#ffd60a", icon: "bills",         emoji: "🧾" },
  { key: "ENTERTAINMENT", name: "Entertainment",  short: "Fun",      color: "#ff375f", icon: "entertainment", emoji: "🎬" },
  { key: "HEALTH",        name: "Health",         short: "Health",   color: "#40c8e0", icon: "health",        emoji: "🩺" },
  { key: "TRAVEL",        name: "Travel",         short: "Travel",   color: "#5e5ce6", icon: "travel",        emoji: "✈️" },
];

export const CAT_BY_KEY: Record<CategoryKey, CatDef> = Object.fromEntries(
  CATS.map((c) => [c.key, c])
) as Record<CategoryKey, CatDef>;

export const PAYMENTS: PaymentKey[] = ["UPI", "CARD", "CASH"];
export const PAYMENT_LABEL: Record<PaymentKey, string> = { UPI: "UPI", CARD: "Card", CASH: "Cash" };

// SVG path data for each icon (viewBox 0 0 24 24, stroke based)
export const ICONS: Record<string, string[]> = {
  food: ["M8 3v6a2.5 2.5 0 0 0 5 0V3", "M10.5 3v18", "M17 3c-1.4 1-2 3-2 6s.2 4 1 5", "M16 3v18"],
  groceries: ["M4 8h16l-1.2 10a2 2 0 0 1-2 2H7.2a2 2 0 0 1-2-2z", "M8 8l2-5M16 8l-2-5", "M9 12v4M15 12v4"],
  transport: ["M4 13l1.6-5A3 3 0 0 1 8.5 6h7a3 3 0 0 1 2.9 2L20 13", "M3 13h18v5H3z", "M6.5 15h.01M17.5 15h.01"],
  shopping: ["M6 8h12l1 12H5z", "M9 8V6a3 3 0 0 1 6 0v2"],
  bills: ["M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5z", "M9 8h6M9 12h6"],
  entertainment: ["M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z", "M11 9l4 3-4 3z"],
  health: ["M12 20s-7-4.4-9.1-9C1.4 8.2 2.7 5 5.8 5 8 5 9.3 6.6 12 9c2.7-2.4 4-4 6.2-4 3.1 0 4.4 3.2 2.9 6-2.1 4.6-9.1 9-9.1 9z"],
  travel: ["M11 2.5l1 8.5 8 3v2l-8-1 .8 5-1.8 1-1-6-4 1v-2l4-2-1-8.5z"],
  home: ["M4 11l8-7 8 7", "M6 10v9h12v-9"],
  cal: ["M4 6h16v14H4zM4 9h16M8 3v4M16 3v4"],
  stats: ["M5 20V10M12 20V4M19 20v-7"],
  back: ["M20 6H8.5L3 12l5.5 6H20a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z", "M15 9.5l-4 5M11 9.5l4 5"],
  settings: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
  ],
};

export type ThemeKey = "noir" | "snow";

export const THEMES: Record<ThemeKey, Record<string, string>> = {
  noir: {
    "--bg": "#000000", "--surface": "#1c1c1e", "--surface2": "#2c2c2e",
    "--ink": "#ffffff", "--sub": "#8e8e93", "--line": "rgba(255,255,255,.09)",
    "--field": "#2c2c2e", "--sheet": "#1c1c1e", "--navbg": "rgba(20,20,22,.72)",
    "--hero-bg": "linear-gradient(150deg,#3a3a3c 0%,#1a1a1c 45%,#000000 100%)",
    "--hero-ink": "#ffffff", "--hero-line": "rgba(255,255,255,.14)",
    "--accent": "#c77dff", "--accent-soft": "rgba(199,125,255,.16)",
    "--ticket": "#f6f6f8", "--ticket-ink": "#1c1c1e", "--ticket-sub": "#8a8a8f", "--ticket-line": "#d9d9de",
    "--hatch": "rgba(255,255,255,.05)",
  },
  snow: {
    "--bg": "#f2f2f7", "--surface": "#ffffff", "--surface2": "#e9e9ee",
    "--ink": "#000000", "--sub": "#8e8e93", "--line": "rgba(0,0,0,.06)",
    "--field": "#ececef", "--sheet": "#ffffff", "--navbg": "rgba(249,249,251,.78)",
    "--hero-bg": "linear-gradient(150deg,#2c2c2e 0%,#000000 100%)",
    "--hero-ink": "#ffffff", "--hero-line": "rgba(255,255,255,.12)",
    "--accent": "#a855f7", "--accent-soft": "rgba(168,85,247,.12)",
    "--ticket": "#ffffff", "--ticket-ink": "#1c1c1e", "--ticket-sub": "#8a8a8f", "--ticket-line": "#dcdce1",
    "--hatch": "rgba(0,0,0,.045)",
  },
};

export const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
