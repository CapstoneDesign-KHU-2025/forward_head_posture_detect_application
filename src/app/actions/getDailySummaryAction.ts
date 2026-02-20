"use server";

import { apiRequest } from "@/lib/api/client";
import { z } from "zod";

const getInfoSchema = z.object({
  userId: z.string().min(1),
});

type getInfo = {
  userId: string;
};

export async function getDailySummaryAction(_prevState: any, data: getInfo) {
  const parsed = getInfoSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Invalid input" } as const;
  }

  const params = new URLSearchParams({
    userId: parsed.data.userId,
    days: "7",
  });
  const result = await apiRequest<string>({
    requestPath: `summaries/daily?${params.toString()}`,
    init: { method: "GET" },
  });

  return result;
}
