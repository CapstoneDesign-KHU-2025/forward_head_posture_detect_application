import { auth } from "@/auth";
import { json, withApiReq } from "@/lib/api/utils";
import { upsertDailySummary, getWeeklySummary, getTodaySummary } from "@/services/summary.service";
import { z } from "zod";

export const runtime = "nodejs";

const DailySummaryBodySchema = z
  .object({
    dateISO: z.string().min(1),
    sumWeighted: z.number().finite(),
    weightSeconds: z.number().positive(),
    count: z.number().int().nonnegative().optional(),
  })
  .strict();

const DailySummaryQuerySchema = z
  .object({
    days: z
      .string()
      .transform((value) => parseInt(value, 10))
      .pipe(z.number().int().gte(1).lte(365))
      .optional(),
  })
  .strict();

export const POST = withApiReq(
  async (req) => {
    const session = await auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, 401);
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = DailySummaryBodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }

    const safeRow = await upsertDailySummary({
      ...parsed.data,
      userId: session.user.id,
    });

    return json(safeRow, 200);
  },
  { path: "/api/summaries/daily POST" },
);

export const GET = withApiReq(
  async (req) => {
    const session = await auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days") ?? undefined;

    const parsedQuery = DailySummaryQuerySchema.safeParse({ days: daysParam });
    if (!parsedQuery.success) {
      return json({ error: parsedQuery.error.issues[0]?.message ?? "Invalid query parameters" }, 400);
    }

    const days = parsedQuery.data.days;

    if (days != null) {
      const weeklyData = await getWeeklySummary(userId, days);
      return json(weeklyData, 200);
    }

    const todayData = await getTodaySummary(userId);
    return json(todayData, 200);
  },
  { path: "/api/summaries/daily GET" },
);
