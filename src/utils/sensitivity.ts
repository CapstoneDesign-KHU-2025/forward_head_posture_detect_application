import { logger } from "@/lib/logger";
import { Sensitivity } from "./types";

const SENSITIVITY_STORAGE_KEY = "turtle-neck-sensitivity";

export function getSensitivity(): Sensitivity {
  if (typeof window === "undefined") return "normal";

  try {
    const stored = localStorage.getItem(SENSITIVITY_STORAGE_KEY);
    if (stored === "low" || stored === "normal" || stored === "high") {
      return stored;
    }
  } catch (e) {
    logger.error("Failed to read sensitivity from localStorage:", e);
  }

  return "normal";
}

export function setSensitivity(sensitivity: Sensitivity): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SENSITIVITY_STORAGE_KEY, sensitivity);
    const thresholds = getSensitivityThresholds(sensitivity);
  } catch (e) {
    logger.error("Failed to save sensitivity to localStorage:", e);
  }
}

export function getSensitivityLabel(sensitivity: Sensitivity): string {
  switch (sensitivity) {
    case "low":
      return "낮음";
    case "normal":
      return "보통";
    case "high":
      return "높음";
    default:
      return "보통";
  }
}

export function getSensitivityThresholds(sensitivity: Sensitivity): { enter: number; exit: number } {
  switch (sensitivity) {
    case "low":
      return { enter: 45, exit: 51 };
    case "high":
      return { enter: 50, exit: 51 };
    case "normal":
    default:
      return { enter: 48, exit: 51 };
  }
}
