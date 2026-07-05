# Wallet — Expense Tracker

A mobile‑first expense tracker built as a full‑stack **Next.js 14 (App Router)** application with a **PostgreSQL + Prisma** backend and **multi‑user authentication**. It is a faithful, production‑ready rebuild of the original iOS‑style "Expense Wallet" design.

Log a daily expense in a couple of taps, browse your spending on a calendar, and see full statistics — all in a native‑feeling mobile UI with **noir** (dark) and **snow** (light) themes.

---

## Features

- **Tap‑to‑log expenses** — slide‑up sheet with a big amount keypad, 8 categories, date picker, and payment method (UPI / Card / Cash).
- **Wallet home** — hero card with the current month's total, a live 7‑day spending bar chart, and transactions grouped by day. **Swipe any row left** to reveal edit / delete.
- **Calendar** — month grid with a spending "dot" on each day (sized by amount), month navigation, and a breakdown of the selected day. Tap a day to filter the wallet to it.
- **Statistics** — monthly total, average per expense, top category, and a per‑category ranked bar breakdown, with month navigation.
- **Multi‑user auth** — email/password sign‑up and login (NextAuth + bcrypt). Every user only sees their own expenses.
- **Themes & icons** — noir/snow theme toggle and monochrome/colored‑icon toggle, saved per device.
- **Responsive app shell** — fills the available browser viewport on mobile and desktop. Installable as a PWA.

---

## Tech stack

| Layer     | Choice                                            |
|-----------|---------------------------------------------------|
| Framework | Next.js 14 (App Router, React 18, TypeScript)     |
| Database  | PostgreSQL                                         |
| ORM       | Prisma 5                                           |
| Auth      | NextAuth v4 (Credentials provider, JWT sessions)  |
| Passwords | bcryptjs                                           |
| Validation| Zod                                               |
| Styling   | CSS variables + inline styles (no CSS framework)  |

---

## Getting started

### 1. Prerequisites
- **Node.js 18.18+** (Node 20+ recommended)
- A **PostgreSQL** database. Either:
  - Local Postgres, or
  - A free hosted database from [Neon](https://neon.tech) or [Supabase](https://supabase.com).

### 2. Install dependencies
```bash
npm install
```
> On first install Prisma downloads its query engine — this needs normal internet access and happens automatically.

### 3. Configure environment
Copy the example env file and fill in your values:
```bash
cp .env.example .env
```
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/notibi_fintrack?schema=public"
NEXTAUTH_SECRET="a-long-random-string"     # generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run
```bash
npm run dev
```
Database migrations are **applied automatically on every startup** — the `predev` (and `prestart`) script runs `prisma migrate deploy` before the server boots, so the `User` and `Expense` tables are created on first run. You don't need a separate migration step.

To apply migrations manually at any time:
```bash
npm run db:deploy      # prisma migrate deploy
```
To create a *new* migration after changing `schema.prisma`:
```bash
npm run db:migrate -- --name your_change   # prisma migrate dev
```
Open **http://localhost:3000**, create an account, and start logging expenses.

---

## Available scripts

| Command             | Description                                  |
|---------------------|----------------------------------------------|
| `npm run dev`       | Start the dev server                         |
| `npm run build`     | Generate Prisma client + production build    |
| `npm start`         | Run the production build                     |
| `npm run db:push`   | Push the schema to the database              |
| `npm run db:migrate`| Create and apply a migration                 |
| `npm run db:studio` | Open Prisma Studio to inspect data           |

---

## Project structure

```
app/
  layout.tsx                 Root layout, providers, mobile viewport
  page.tsx                   Redirects to /wallet or /login
  login/  signup/            Auth screens
  wallet/page.tsx            Main app (server-guards the session)
  api/
    auth/[...nextauth]/      NextAuth handler
    signup/                  Account creation
    expenses/                GET list + POST create
    expenses/[id]/           PATCH update + DELETE
    stats/                   Monthly category breakdown
components/
  WalletApp.tsx              Client orchestrator: state, data, screens
  Home.tsx                   Hero, 7-day bars, swipeable transactions
  CalendarView.tsx           Month grid + selected-day list
  Stats.tsx                  Category stats + tiles
  AddSheet.tsx               Add/edit sheet: keypad, categories, date, payment
  SettingsSheet.tsx          Theme/icon toggles + sign out
  TabBar.tsx  CatBadge.tsx  Icon.tsx  ThemeContext.tsx
lib/
  prisma.ts  auth.ts         DB client + NextAuth config
  api.ts                     Typed client-side fetch helpers
  constants.ts  format.ts    Categories/icons/themes + formatting
prisma/schema.prisma         User, Expense, Category, PaymentMethod
middleware.ts                Protects /wallet
```

---

## API reference

All expense endpoints require an authenticated session and are automatically scoped to the logged‑in user.

| Method | Route                    | Body / Query                                             | Description                     |
|--------|--------------------------|---------------------------------------------------------|---------------------------------|
| POST   | `/api/signup`            | `{ name?, email, password }`                            | Create an account               |
| GET    | `/api/expenses`          | `?date=YYYY-MM-DD` or `?month=YYYY-MM` (optional)       | List expenses                   |
| POST   | `/api/expenses`          | `{ amount, category, payment, date, note? }`            | Create an expense               |
| PATCH  | `/api/expenses/:id`      | any subset of the create fields                         | Update an expense               |
| DELETE | `/api/expenses/:id`      | —                                                       | Delete an expense               |
| GET    | `/api/stats`             | `?month=YYYY-MM` (optional)                             | Totals + per‑category breakdown |

**Field values**
- `amount` — positive integer (whole rupees)
- `category` — `FOOD` · `GROCERIES` · `TRANSPORT` · `SHOPPING` · `BILLS` · `ENTERTAINMENT` · `HEALTH` · `TRAVEL`
- `payment` — `UPI` · `CARD` · `CASH`
- `date` — `YYYY-MM-DD`

---

## Deploying

1. Push this repo to GitHub.
2. Import it into **Vercel** (or any Node host).
3. Set the environment variables `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (your deployed URL).
4. Use a hosted Postgres (Neon/Supabase). `npm run build` runs `prisma generate` automatically; run `npx prisma migrate deploy` against the production database once.

---

## Notes
- Currency is Indian Rupees (₹) with en‑IN number grouping, matching the original design.
- The app defaults to the current month; no sample data is seeded — your first expense starts a clean history.
- If a `.trash_nm_delete_me` folder is present, it's a harmless build artifact and can be deleted.
