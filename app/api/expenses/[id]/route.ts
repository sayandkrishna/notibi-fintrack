import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isoOf, isoToDate } from "@/lib/format";

const CATEGORIES = ["FOOD","GROCERIES","TRANSPORT","SHOPPING","BILLS","ENTERTAINMENT","HEALTH","TRAVEL"] as const;
const PAYMENTS = ["UPI","CARD","CASH"] as const;

const patchSchema = z.object({
  amount: z.number().int().positive().max(9999999).optional(),
  category: z.enum(CATEGORIES).optional(),
  payment: z.enum(PAYMENTS).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().trim().max(120).nullable().optional(),
});

async function uid() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

// PATCH /api/expenses/:id -> update
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await uid();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await prisma.expense.findFirst({ where: { id: params.id, userId } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  const e = await prisma.expense.update({
    where: { id: params.id },
    data: {
      ...(d.amount !== undefined ? { amount: d.amount } : {}),
      ...(d.category !== undefined ? { category: d.category } : {}),
      ...(d.payment !== undefined ? { payment: d.payment } : {}),
      ...(d.date !== undefined ? { date: isoToDate(d.date) } : {}),
      ...(d.note !== undefined ? { note: d.note } : {}),
    },
  });
  return NextResponse.json({
    expense: {
      id: e.id, amount: e.amount, category: e.category, payment: e.payment,
      date: isoOf(e.date), note: e.note, time: new Date(e.createdAt).toTimeString().slice(0, 5),
      createdAt: e.createdAt.toISOString(),
    },
  });
}

// DELETE /api/expenses/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await uid();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await prisma.expense.findFirst({ where: { id: params.id, userId } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
