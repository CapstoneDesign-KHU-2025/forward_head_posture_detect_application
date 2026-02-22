"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { getWeeklySummary, upsertDailySummary } from "@/services/summary.service";
import type { ActionState } from "@/lib/api/utils";
import { revalidateTag } from "next/cache";

// GET
const GetDailySummarySchema = z.object({
  days: z.number().min(1).max(30).default(7),
});

export type GetDailySummaryInput = z.infer<typeof GetDailySummarySchema>;

export async function getDailySummaryAction(_prevState: ActionState<unknown>, data: GetDailySummaryInput) {
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
  } catch (error: unknown) {
    console.error("[getDailySummaryAction] Error:", error);
    return { ok: false, status: 500, message: "server error" } as const;
  }
}

// POST
const PostDailySummarySchema = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "wrong date formation"),
  sumWeighted: z.number().refine(Number.isFinite),
  weightSeconds: z.number().refine((n) => Number.isFinite(n) && n > 0),
  count: z.number().int().nonnegative(),
});

export type PostDailySummaryInput = z.infer<typeof PostDailySummarySchema>;

export async function postDailySummaryAction(_prevState: ActionState<unknown>, data: PostDailySummaryInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "unauthorized" } as const;
  }

  const parsed = PostDailySummarySchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "wrong data" } as const;
  }

  try {
    const result = await upsertDailySummary({
      ...parsed.data,
      userId: session.user.id,
    });
    revalidateTag("daily_summary");

    return { ok: true, data: result } as const;
  } catch (error: unknown) {
    console.error("[postDailySummaryAction] Error:", error);
    return { ok: false, status: 500, message: "server error" } as const;
  }
}
