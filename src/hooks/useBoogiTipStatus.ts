"use client";

import { useState, useEffect } from "react";

export function useBoogiTipStatus() {
  const [hasNeverClicked, setHasNeverClicked] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("boogi_tip_visited");
    if (!visited) {
      setHasNeverClicked(true);
    }
  }, []);

  const markAsVisited = () => {
    if (hasNeverClicked) {
      setHasNeverClicked(false);
      localStorage.setItem("boogi_tip_visited", "true");
    }
  };

  return { hasNeverClicked, markAsVisited };
}
