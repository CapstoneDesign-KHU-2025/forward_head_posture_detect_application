"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { getWeeklySummary } from "@/services/summary.service";
import type { ActionState } from "@/lib/api/utils";

const GetDailySummarySchema = z.object({
  days: z.number().min(1).max(30).default(7),
});

export type GetDailySummaryInput = z.infer<typeof GetDailySummarySchema>;

export async function getDailySummaryAction(_prevState: ActionState<any>, data: GetDailySummaryInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "unauthorized" } as const;
  }

  const parsed = GetDailySummarySchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "wrong date rage" } as const;
  }

  try {
    const result = await getWeeklySummary(session.user.id, parsed.data.days);

    return { ok: true, data: result } as const;
  } catch (error: any) {
    console.error("[getDailySummaryAction] Error:", error);
    return { ok: false, status: 500, message: "server error" } as const;
  }
}
