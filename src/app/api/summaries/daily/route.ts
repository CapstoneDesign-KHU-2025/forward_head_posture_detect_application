import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createISO } from "@/utils/createISO";
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

const GOOD_DAY_MAX_WARNINGS = 10;
// POST /api/summaries/daily
// { userId, dateISO("YYYY-MM-DD"), sumWeighted, weightSeconds, count }
export async function POST(req: Request) {
  try {
    const { userId, dateISO, sumWeighted, weightSeconds, count } = await req.json();

    if (!userId || !dateISO) {
      return NextResponse.json({ error: "userId, dateISO are required." }, { status: 400 });
    }
    if (typeof sumWeighted !== "number" || typeof weightSeconds !== "number" || weightSeconds <= 0) {
      return NextResponse.json({ error: "Invalid sums/weights." }, { status: 400 });
    }

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
  } catch (e: any) {
    console.error("[POST /api/summaries/daily] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const daysParam = searchParams.get("days");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const dateISO = createISO();
    const today0 = new Date(dateISO);

    // ✅ days가 있으면 weekly 모드
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
      const sum = safeRows.reduce((a: number, r) => a + r.avgAngle * r.weightSeconds, 0);
      const w = safeRows.reduce((a: number, r) => a + r.weightSeconds, 0);
      const weightedAvg = w > 0 ? sum / w : null;
      const goodDays = safeRows.length > 0 ? safeRows[safeRows.length - 1].goodDay : 0;
      return NextResponse.json({ mode: "weekly", days, weightedAvg, safeRows, goodDays }, { status: 200 });
    }

    // ✅ days 없으면 daily 모드
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
  } catch (e: any) {
    console.error("[GET /api/summaries/daily]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export const runtime = "nodejs";
