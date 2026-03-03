// src/hooks/useClearPostureDBOnLoad.ts
import { cleanupOldPostureData } from "@/utils/cleanupOldPostureData";

/**
 * 서버 동기화 후 로컬 DB 정리 (팀원 의도대로)
 * - postDailySummaryAction 성공 시 호출
 * - 오래된 hourly, samples 삭제 (중복/오래된 데이터 방지, 브라우저 메모리 절약)
 * @param userId - 사용자 ID
 * @param keepDays - 이 일수 이전 데이터 삭제 (기본 3일)
 */
export async function cleanupAfterSync(
  userId: string,
  keepDays: number = 3
): Promise<{ hourlyDeleted: number; samplesDeleted: number }> {
  return cleanupOldPostureData(userId, keepDays);
}
