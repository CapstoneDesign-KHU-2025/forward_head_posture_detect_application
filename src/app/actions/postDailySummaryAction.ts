"use server";

import { apiRequest } from "@/lib/api/client";
import { z } from "zod";

const postBodySchema = z.object({
  userId: z.string(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sumWeighted: z.number().refine(Number.isFinite),
  weightSeconds: z.number().refine((n) => Number.isFinite(n) && n > 0),
  count: z.number().int().nonnegative(),
});

type postBody = {
  userId: string;
  dateISO: string;
  sumWeighted: number;
  weightSeconds: number;
  count: number;
};

export async function postDailySummaryAction(_prevState: any, data: postBody) {
  const parsed = postBodySchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Invalid input" } as const;
  }

  const result = await apiRequest<string>({
    requestPath: "summaries/daily",
    init: {
      method: "POST",
      body: parsed.data,
    },
    tags: ["daily_summary"],
  });

  return result;
}
