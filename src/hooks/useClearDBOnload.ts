// src/hooks/useClearPostureDBOnLoad.ts
import { useEffect } from "react";
import { runClearPostureDB } from "@/utils/clearDB";

export function useClearPostureDBOnLoad(options?: { oncePerTab?: boolean; dbName?: string }) {
  const { oncePerTab = true, dbName = "posture-db" } = options ?? {};

  useEffect(() => {
    const FLAG = "__posture_db_cleared__";
    if (oncePerTab && sessionStorage.getItem(FLAG) === "1") return;

    // 추출한 일반 함수 호출
    runClearPostureDB(dbName);
  }, [oncePerTab, dbName]);
}
