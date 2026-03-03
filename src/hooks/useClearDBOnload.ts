// src/hooks/useClearDBOnload.ts
import { runClearPostureDB } from "@/utils/clearDB";

/**
 * 서버 동기화 후 로컬 DB 전체 삭제 (팀원 의도대로)
 * - postDailySummaryAction 성공 시 호출
 * - 서버에 동기화됐으므로 로컬 데이터 불필요 (중복 방지, 브라우저 메모리 절약)
 */
export async function cleanupAfterSync(): Promise<boolean> {
  return runClearPostureDB("posture-db");
}
