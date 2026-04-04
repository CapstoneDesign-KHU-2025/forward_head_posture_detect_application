"use client";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

async function clearIndexedDB(dbName = "posture-db") {
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn(
        "IndexedDB delete blocked. Close other tabs using this site.",
      );
    };
  });
}

async function runClearPostureDB(dbName: string = "posture-db") {
  try {
    await clearIndexedDB(dbName);

    sessionStorage.setItem("__posture_db_cleared__", "1");
    return true;
  } catch (e) {
    logger.error("Failed to drop IndexedDB:", e);
    return false;
  }
}

export function useClearDBOnLoad(options?: {
  oncePerTab?: boolean;
  dbName?: string;
}) {
  const { oncePerTab = true, dbName = "posture-db" } = options ?? {};

  useEffect(() => {
    const FLAG = "__posture_db_cleared__";
    if (oncePerTab && sessionStorage.getItem(FLAG) === "1") return;

    runClearPostureDB(dbName);
  }, [oncePerTab, dbName]);
}
