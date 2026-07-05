import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().max(60).optional(),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const normEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normEmail } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normEmail, name: name || null, password: hash },
    select: { id: true, email: true, name: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
