"use server";

import { apiRequest } from "@/lib/api/client";

export async function getDailySummaryAction(_prevState: any) {
  const result = await apiRequest<string>({
    requestPath: "/summaries/daily?userId=${userId}&days=7",
    init: { method: "GET" },
  });

  return result;
}
