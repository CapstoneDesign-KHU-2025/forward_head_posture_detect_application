import { auth } from "@/auth";
import { json, withApiReq } from "@/lib/api/utils";
import { upsertDailySummary, getWeeklySummary, getTodaySummary } from "@/services/summary.service";

export const runtime = "nodejs";

export const POST = withApiReq(
  async (req) => {
    const session = await auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    if (!body.dateISO) {
      return json({ error: "dateISO is required." }, 400);
    }

    const safeRow = await upsertDailySummary({
      ...body,
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
    const daysParam = searchParams.get("days");

    if (daysParam) {
      const weeklyData = await getWeeklySummary(userId, Number(daysParam));
      return json(weeklyData, 200);
    } else {
      const todayData = await getTodaySummary(userId);
      return json(todayData, 200);
    }
  },
  { path: "/api/summaries/daily GET" },
);
