"use client";
import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";

async function clearIndexedDB(dbName = "posture-db") {
  if (typeof window === "undefined" || !window.indexedDB) return;

  return new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn(
        `IndexedDB [${dbName}]delete blocked. Close other tabs using this site.`,
      );
      resolve();
    };
  });
}

export function useClearDBOnLoad(options?: {
  oncePerTab?: boolean;
  dbName?: string;
}) {
  const { oncePerTab = true, dbName = "posture-db" } = options ?? {};

  const isClearing = useRef(false);

  useEffect(() => {
    const FLAG_KEY = `__cleared_db_${dbName}__`;

    if (oncePerTab && sessionStorage.getItem(FLAG_KEY) === "1") return;
    if (isClearing.current) return;

    const dropDB = async () => {
      isClearing.current = true;

      try {
        if (oncePerTab) sessionStorage.setItem(FLAG_KEY, "1");

        await clearIndexedDB(dbName);
        logger.info(`[${dbName}] successfully cleared on load.`);
      } catch (e) {
        logger.error(`Failed to drop IndexedDB [${dbName}]:`, e);
        if (oncePerTab) sessionStorage.removeItem(FLAG_KEY);
      } finally {
        isClearing.current = false;
      }
    };

    dropDB();
  }, [oncePerTab, dbName]);
}
