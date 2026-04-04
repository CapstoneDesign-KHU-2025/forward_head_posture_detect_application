"use client";
import { useEffect, useEffectEvent } from "react";

export function useHandleHotKey(key: string, callback: () => void) {
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === key) {
      callback();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key]);
}
