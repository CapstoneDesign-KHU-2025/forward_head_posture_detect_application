"use client";

import { useEffect } from "react";
import { clearIndexedDB } from "@/utils/clearIndexedDB";
import { logger } from "@/lib/logger";

export function useClearPostureDBOnLoad(options?: { oncePerTab?: boolean; dbName?: string }) {
  const { oncePerTab = true, dbName = "posture-db" } = options ?? {};

  useEffect(() => {
    const FLAG = "__posture_db_cleared__";
    if (oncePerTab && sessionStorage.getItem(FLAG) === "1") return;

    (async () => {
      try {
        await clearIndexedDB(dbName);
        if (oncePerTab) sessionStorage.setItem(FLAG, "1");
        // idb 캐시 변수가 있다면 초기화 필요(예: getDB()의 _db = undefined)
        // 예: window.__resetPostureDBCache?.();
      } catch (e) {
        logger.error("Failed to drop IndexedDB:", e);
      }
    })();
  }, [oncePerTab, dbName]);
}
