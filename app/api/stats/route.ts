import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stats?month=YYYY-MM -> category breakdown + totals
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  const where: Record<string, unknown> = { userId };
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    where.date = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
  }

  const grouped = await prisma.expense.groupBy({
    by: ["category"],
    where,
    _sum: { amount: true },
    _count: { _all: true },
  });

  const byCategory = grouped
    .map((g) => ({ category: g.category, total: g._sum.amount ?? 0, count: g._count._all }))
    .sort((a, b) => b.total - a.total);

  const total = byCategory.reduce((s, c) => s + c.total, 0);
  const count = byCategory.reduce((s, c) => s + c.count, 0);

  return NextResponse.json({ total, count, byCategory });
}
