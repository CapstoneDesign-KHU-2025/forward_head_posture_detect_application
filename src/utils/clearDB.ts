// src/lib/db/clearDB.ts
import { clearIndexedDB } from "@/utils/clearIndexedDB";
import { logger } from "@/lib/logger";

/**
 * 훅이 아닌 일반 비동기 함수입니다.
 * 이벤트 핸들러(onClick 등) 내부에서 자유롭게 호출 가능합니다.
 */
export async function runClearPostureDB(dbName: string = "posture-db") {
  try {
    await clearIndexedDB(dbName);
    // sessionStorage 플래그가 필요하다면 여기서 처리
    sessionStorage.setItem("__posture_db_cleared__", "1");
    return true;
  } catch (e) {
    logger.error("Failed to drop IndexedDB:", e);
    return false;
  }
}
