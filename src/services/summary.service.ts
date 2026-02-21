import { prisma } from "@/lib/db";
import { createISO } from "@/utils/createISO";
type resType = {
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
type resType2 = {
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

export type UpsertDailySummaryInput = {
  userId: string;
  dateISO: string;
  sumWeighted: number;
  weightSeconds: number;
  count?: number;
};
const GOOD_DAY_MAX_WARNINGS = 10;

export async function upsertDailySummary(input: UpsertDailySummaryInput) {
  if (typeof input.sumWeighted !== "number" || typeof input.weightSeconds !== "number" || input.weightSeconds <= 0) {
    throw new Error("Invalid sums/weights.");
  }

  const { userId, dateISO, sumWeighted, weightSeconds, count } = input;
  const avgAngle = sumWeighted / weightSeconds;
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
  return {
    ...row,
    id: Number(row.id), // BigInt → number
  };
}

export async function getWeeklySummary(userId: string, daysParam: number) {
  const dateISO = createISO();
  const today0 = new Date(dateISO);
  const days = Math.max(1, daysParam);

  const since = new Date(today0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await prisma.dailyPostureSummary.findMany({
    where: { userId, date: { gte: since, lte: today0 } },
    orderBy: { date: "asc" },
  });
  const safeRows = rows.map((r: resType) => ({
    ...r,
    id: Number(r.id),
  }));

  const sum = safeRows.reduce((a: number, r: resType2) => a + r.avgAngle * r.weightSeconds, 0);
  const w = safeRows.reduce((a: number, r: resType2) => a + r.weightSeconds, 0);

  const weightedAvg = w > 0 ? sum / w : null;
  const goodDays = safeRows.length > 0 ? safeRows[safeRows.length - 1].goodDay : 0;

  return {
    mode: "weekly",
    days,
    weightedAvg,
    safeRows,
    goodDays,
  };
}

export async function getTodaySummary(userId: string) {
  const dateISO = createISO();
  const today0 = new Date(dateISO);

  const row = await prisma.dailyPostureSummary.findUnique({
    where: { userId_date: { userId, date: today0 } },
  });

  const safeRow = row
    ? {
        ...row,
        id: Number(row.id),
      }
    : null;

  return {
    mode: "today",
    todayAvg: safeRow?.avgAngle ?? null,
    safeRow,
    goodDays: safeRow?.goodDay ?? 0,
  };
}
