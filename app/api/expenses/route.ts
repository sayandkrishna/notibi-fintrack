import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isoOf, isoToDate } from "@/lib/format";

const CATEGORIES = ["FOOD","GROCERIES","TRANSPORT","SHOPPING","BILLS","ENTERTAINMENT","HEALTH","TRAVEL"] as const;
const PAYMENTS = ["UPI","CARD","CASH"] as const;

const createSchema = z.object({
  amount: z.number().int().positive().max(9999999),
  category: z.enum(CATEGORIES),
  payment: z.enum(PAYMENTS).default("UPI"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(120).optional(),
});

async function uid() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

// GET /api/expenses  -> all of the user's expenses (optionally ?date=YYYY-MM-DD or ?month=YYYY-MM)
export async function GET(req: Request) {
  const userId = await uid();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month");

  const where: Record<string, unknown> = { userId };
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    where.date = isoToDate(date);
  } else if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    where.date = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
  }

  const rows = await prisma.expense.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    expenses: rows.map((e) => ({
      id: e.id,
      amount: e.amount,
      category: e.category,
      payment: e.payment,
      date: isoOf(e.date),
      note: e.note,
      time: new Date(e.createdAt).toTimeString().slice(0, 5),
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

// POST /api/expenses  -> create
export async function POST(req: Request) {
  const userId = await uid();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { amount, category, payment, date, note } = parsed.data;

  const e = await prisma.expense.create({
    data: { amount, category, payment, date: isoToDate(date), note: note || null, userId },
  });
  return NextResponse.json({
    expense: {
      id: e.id, amount: e.amount, category: e.category, payment: e.payment,
      date: isoOf(e.date), note: e.note, time: new Date(e.createdAt).toTimeString().slice(0, 5),
      createdAt: e.createdAt.toISOString(),
    },
  }, { status: 201 });
}
