import { createISO } from "@/utils/createISO";
import {
  getDailyPostureSummaryRowsInRange,
  getLatestDailySummaryGoodDay,
  getPrevDailySummaryGoodDay,
  getTodayDailyPostureSummaryRow,
  upsertDailyPostureSummaryRow,
} from "@/repositories/summary.repository";

type UpsertDailySummaryInput = {
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

  const prevGood = await getPrevDailySummaryGoodDay(userId, date);
  const isGoodToday = weightSeconds > 0 && numericCount <= GOOD_DAY_MAX_WARNINGS;
  const newGoodDay = isGoodToday ? prevGood + 1 : prevGood;

  const row = await upsertDailyPostureSummaryRow({
    userId,
    date,
    sumWeighted,
    weightSeconds,
    count: numericCount,
    avgAngle,
    goodDay: newGoodDay,
  });
  return {
    ...row,
    id: Number(row.id), // BigInt → number
  };
}

// export async function getWeeklySummary(userId: string, daysParam: number) {
//   const dateISO = createISO();
//   const today0 = new Date(dateISO);
//   const days = Math.max(1, daysParam);

//   const since = new Date(today0);
//   since.setDate(since.getDate() - (days - 1));

//   const rows = await prisma.dailyPostureSummary.findMany({
//     where: { userId, date: { gte: since, lte: today0 } },
//     orderBy: { date: "asc" },
//   });
//   const safeRows = rows.map((r: resType) => ({
//     ...r,
//     id: Number(r.id),
//   }));

//   const sum = safeRows.reduce((a: number, r: resType2) => a + r.avgAngle * r.weightSeconds, 0);
//   const w = safeRows.reduce((a: number, r: resType2) => a + r.weightSeconds, 0);

//   const weightedAvg = w > 0 ? sum / w : null;
//   const goodDays = safeRows.length > 0 ? safeRows[safeRows.length - 1].goodDay : 0;

//   return {
//     mode: "weekly",
//     days,
//     weightedAvg,
//     safeRows,
//     goodDays,
//   };
// }
export async function getWeeklySummary(userId: string, daysParam: number) {
  const requestedDays = Math.max(1, daysParam);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const since = new Date(today);
  since.setDate(today.getDate() - (requestedDays - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await getDailyPostureSummaryRowsInRange({ userId, since, today });
  const goodDays = await getLatestDailySummaryGoodDay(userId);

  const safeRows = rows.map((r) => ({
    ...r,
    id: Number(r.id),
  }));

  const sum = safeRows.reduce((a, r) => a + r.avgAngle * r.weightSeconds, 0);
  const w = safeRows.reduce((a, r) => a + r.weightSeconds, 0);

  const weightedAvg = w > 0 ? sum / w : null;
  return {
    mode: requestedDays === 7 ? "weekly" : "dynamic",
    requestedDays,
    actualDataDays: safeRows.length,
    weightedAvg,
    safeRows,
    goodDays,
  };
}
export async function getTodaySummary(userId: string) {
  const dateISO = createISO();
  const today0 = new Date(dateISO);

  const row = await getTodayDailyPostureSummaryRow({ userId, today: today0 });

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
