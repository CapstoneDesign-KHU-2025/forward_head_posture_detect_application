import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createISO } from "@/utils/createISO";
import { auth } from "@/auth";
import { z } from "zod";

const summaryPostSchema = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sumWeighted: z.number().refine(Number.isFinite, { message: "Must be a finite number" }),
  weightSeconds: z.number().refine(n => Number.isFinite(n) && n > 0, { message: "Must be a positive finite number" }),
  count: z.number().int().nonnegative().optional(),
});

type rType = {
  count: number;
  id: bigint;
  userId: string;
  avgAngle: number;
  sumWeighted: number;
  weightSeconds: number;
  date: Date;
  goodDay: number;
  createdAt: Date;
  updatedAt: Date;
};
type rType2 = {
  count: number;
  id: number;
  userId: string;
  avgAngle: number;
  sumWeighted: number;
  weightSeconds: number;
  date: Date;
  goodDay: number;
  createdAt: Date;
  updatedAt: Date;
};

const GOOD_DAY_MAX_WARNINGS = 10;
// POST /api/summaries/daily
// { userId, dateISO("YYYY-MM-DD"), sumWeighted, weightSeconds, count }
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = summaryPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { dateISO, sumWeighted, weightSeconds, count } = parsed.data;
    const userId = session.user.id;
    const avgAngle = sumWeighted / weightSeconds;
    // Prisma @db.Date 이므로 자정으로만 저장되어도 OK
    const date = new Date(dateISO); // "YYYY-MM-DD"
    const numericCount = Number(count ?? 0);

    const prev = await prisma.dailyPostureSummary.findFirst({
      where: { userId, date: { lt: date } },
      orderBy: { date: "desc" },
      select: { goodDay: true },
    });

    const prevGood = prev?.goodDay ?? 0;
    const isGoodToday = weightSeconds > 0 && numericCount <= GOOD_DAY_MAX_WARNINGS;
    const newGoodDay = isGoodToday ? prevGood + 1 : prevGood;
    const row = await prisma.dailyPostureSummary.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        sumWeighted,
        weightSeconds,
        count: Number(count ?? 0),
        avgAngle,
        goodDay: newGoodDay,
      },
      update: {
        sumWeighted,
        weightSeconds,
        count: Number(count ?? 0),
        avgAngle,
        goodDay: newGoodDay,
      },
    });
    const safeRow = {
      ...row,
      id: Number(row.id), // BigInt → number
    };
    return NextResponse.json(safeRow, { status: 200 });
  } catch (e) {
    console.error("[POST /api/summaries/daily] error:", e);
    return NextResponse.json({ error: "Failed to save daily summary." }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = session.user.id;
    const daysParam = searchParams.get("days");

    const dateISO = createISO();
    const today0 = new Date(dateISO);

    // days가 있으면 weekly 모드
    if (daysParam) {
      const days = Math.max(1, Number(daysParam) || 7);
      const since = new Date(today0);
      since.setDate(since.getDate() - (days - 1));

      const rows = await prisma.dailyPostureSummary.findMany({
        where: { userId, date: { gte: since, lte: today0 } },
        orderBy: { date: "asc" },
      });
      const safeRows = rows.map((r: rType) => ({
        ...r,
        id: Number(r.id),
      }));
      const sum = safeRows.reduce((a: number, r: rType2) => a + r.avgAngle * r.weightSeconds, 0);
      const w = safeRows.reduce((a: number, r: rType2) => a + r.weightSeconds, 0);
      const weightedAvg = w > 0 ? sum / w : null;
      const goodDays = safeRows.length > 0 ? safeRows[safeRows.length - 1].goodDay : 0;
      return NextResponse.json({ mode: "weekly", days, weightedAvg, safeRows, goodDays }, { status: 200 });
    }

    // days 없으면 daily 모드
    const row = await prisma.dailyPostureSummary.findUnique({
      where: { userId_date: { userId, date: today0 } },
    });
    const safeRow = row
      ? {
          ...row,
          id: Number(row.id),
        }
      : null;
    return NextResponse.json(
      { mode: "today", todayAvg: safeRow?.avgAngle ?? null, safeRow, goodDays: safeRow?.goodDay ?? 0 },
      { status: 200 }
    );
  } catch (e) {
    console.error("[GET /api/summaries/daily]", e);
    return NextResponse.json({ error: "Failed to fetch daily summary." }, { status: 500 });
  }
}
export const runtime = "nodejs";
