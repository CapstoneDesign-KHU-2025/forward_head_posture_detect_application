"use client";
import { useEffect, useRef } from "react";

export function useHandleHotKey(key: string, callback: () => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == key) {
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key]);
}
