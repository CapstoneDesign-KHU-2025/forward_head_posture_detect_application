import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const GOOD_DAY_MAX_WARNINGS = 10;

// 공통: "오늘"을 항상 YYYY-MM-DD → new Date("YYYY-MM-DD") 로 만들기
function getTodayDateOnly() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const iso = `${yyyy}-${mm}-${dd}`; // "2025-11-27"
  return new Date(iso); // UTC 자정 기준 Date
}

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
    // ✅ POST에서도 dateISO로 만든 Date 사용 (지금 그대로 유지)
    const date = new Date(dateISO);

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
        count: numericCount,
        avgAngle,
        goodDay: newGoodDay,
      },
      update: {
        sumWeighted,
        weightSeconds,
        count: numericCount,
        avgAngle,
        goodDay: newGoodDay,
      },
    });

    const safeRow = {
      ...row,
      id: Number(row.id),
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

    // ✅ 오늘 날짜를 POST와 동일한 방식으로 생성
    const todayDate = getTodayDateOnly();

    if (daysParam) {
      // ------- weekly 모드 -------
      const days = Math.max(1, Number(daysParam) || 7);

      const since = new Date(todayDate); // 복사
      since.setDate(since.getDate() - (days - 1));

      const rows = await prisma.dailyPostureSummary.findMany({
        where: { userId, date: { gte: since, lte: todayDate } },
        orderBy: { date: "asc" },
      });

      const safeRows = rows.map((r) => ({
        ...r,
        id: Number(r.id),
      }));

      const sum = safeRows.reduce((a, r) => a + r.avgAngle * r.weightSeconds, 0);
      const w = safeRows.reduce((a, r) => a + r.weightSeconds, 0);
      const weightedAvg = w > 0 ? sum / w : null;
      const goodDays = safeRows.length > 0 ? safeRows[safeRows.length - 1].goodDay : 0;

      // 프론트 타입이 rows를 기대하면 key 이름 rows로 맞춰주는 것도 추천!
      return NextResponse.json({ mode: "weekly", days, weightedAvg, rows: safeRows, goodDays }, { status: 200 });
    }

    // ------- daily 모드 -------
    const row = await prisma.dailyPostureSummary.findUnique({
      where: { userId_date: { userId, date: todayDate } },
    });

    const safeRow = row
      ? {
          ...row,
          id: Number(row.id),
        }
      : null;

    return NextResponse.json(
      {
        mode: "today",
        todayAvg: safeRow?.avgAngle ?? null,
        safeRow,
        goodDays: safeRow?.goodDay ?? 0,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[GET /api/summaries/daily]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
