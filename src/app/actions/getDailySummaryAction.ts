"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { getWeeklySummary } from "@/services/summary.service";
import type { ActionState } from "@/types/";

const GetDailySummarySchema = z.object({
  days: z.number().min(1).max(30).default(7),
});

export type GetDailySummaryInput = z.infer<typeof GetDailySummarySchema>;

export async function getDailySummaryAction(_prevState: any, data: GetDailySummaryInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "로그인이 필요합니다." } as const;
  }

  // 4. 입력값 검증
  const parsed = GetDailySummarySchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "잘못된 입력값입니다." } as const;
  }

  try {
    // 5. 아키텍처 개선: 불필요한 HTTP 통신(apiRequest) 제거!
    // DB와 직접 소통하는 Service 함수를 즉시 호출합니다.
    const result = await getWeeklySummary(session.user.id, parsed.data.days);

    return { ok: true, data: result } as const;
  } catch (error: any) {
    console.error("[getDailySummaryAction] Error:", error);
    return { ok: false, status: 500, message: "요약 데이터를 불러오는 중 오류가 발생했습니다." } as const;
  }
}
