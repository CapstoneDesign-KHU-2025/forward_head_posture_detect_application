import { prisma } from "@/lib/db";

export async function getPrevDailySummaryGoodDay(userId: string, date: Date): Promise<number> {
  const prev = await prisma.dailyPostureSummary.findFirst({
    where: { userId, date: { lt: date } },
    orderBy: { date: "desc" },
    select: { goodDay: true },
  });

  return prev?.goodDay ?? 0;
}

export async function upsertDailyPostureSummaryRow(params: {
  userId: string;
  date: Date;
  sumWeighted: number;
  weightSeconds: number;
  count: number;
  avgAngle: number;
  goodDay: number;
}) {
  const { userId, date, sumWeighted, weightSeconds, count, avgAngle, goodDay } = params;

  const row = await prisma.dailyPostureSummary.upsert({
    where: { userId_date: { userId, date } },
    create: {
      userId,
      date,
      sumWeighted,
      weightSeconds,
      count,
      avgAngle,
      goodDay,
    },
    update: {
      sumWeighted,
      weightSeconds,
      count,
      avgAngle,
      goodDay,
    },
  });

  return row;
}

export async function getDailyPostureSummaryRowsInRange(params: { userId: string; since: Date; today: Date }) {
  const { userId, since, today } = params;

  return prisma.dailyPostureSummary.findMany({
    where: {
      userId,
      date: { gte: since, lte: today },
    },
    orderBy: { date: "asc" },
  });
}

export async function getLatestDailySummaryGoodDay(userId: string): Promise<number> {
  const absoluteLatestRecord = await prisma.dailyPostureSummary.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { goodDay: true },
  });

  return absoluteLatestRecord?.goodDay ?? 0;
}

export async function getTodayDailyPostureSummaryRow(params: { userId: string; today: Date }) {
  const { userId, today } = params;

  return prisma.dailyPostureSummary.findUnique({
    where: { userId_date: { userId, date: today } },
  });
}
