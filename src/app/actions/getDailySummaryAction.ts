"use server";

import { apiRequest } from "@/lib/api/client";
type getInfo = {
  userId: string;
};
export async function getDailySummaryAction(_prevState: any, data: getInfo) {
  const result = await apiRequest<string>({
    requestPath: `/summaries/daily?userId=${data.userId}&days=7`,
    init: { method: "GET" },
  });

  return result;
}
