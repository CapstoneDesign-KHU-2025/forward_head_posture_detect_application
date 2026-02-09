"use server";

import { apiRequest } from "@/lib/api/client";

type postBody = {
  userId: string;
  dateISO: string;
  sumWeighted: number;
  weightSeconds: number;
  count: number;
  tags: Array<string>;
};

export async function postDailySummeryAction(prevState: any, data: postBody) {
  const result = await apiRequest<string>({
    requestPath: "/summaries/daily",
    init: {
      method: "POST",
      body: data,
    },
    tags: ["daily_summery"],
  });

  return result;
}
