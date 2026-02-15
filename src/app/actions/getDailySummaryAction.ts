"use server";

import { apiRequest, ApiResult } from "@/lib/api/client";
type getInfo = {
  userId: string;
};
export async function getDailySummaryAction(_prevState: any, data: getInfo) {
  const params = new URLSearchParams({
    userId: data.userId,
    days: "7",
  });
  const result = await apiRequest<string>({
    requestPath: `summaries/daily?${params.toString()}`,
    init: { method: "GET" },
  });

  return result;
}
