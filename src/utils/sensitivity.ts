export type Sensitivity = "low" | "normal" | "high";

const SENSITIVITY_STORAGE_KEY = "turtle-neck-sensitivity";

// 민감도 설정을 로컬 스토리지에서 읽어옴 (기본값은 normal)

export function getSensitivity(): Sensitivity {
  if (typeof window === "undefined") return "normal";
  
  try {
    const stored = localStorage.getItem(SENSITIVITY_STORAGE_KEY);
    if (stored === "low" || stored === "normal" || stored === "high") {
      return stored;
    }
  } catch (e) {
    console.error("Failed to read sensitivity from localStorage:", e);
  }
  
  return "normal";
}

// 민감도 설정을 로컬 스토리지에 저장

export function setSensitivity(sensitivity: Sensitivity): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(SENSITIVITY_STORAGE_KEY, sensitivity);
    const thresholds = getSensitivityThresholds(sensitivity);
  } catch (e) {
    console.error("Failed to save sensitivity to localStorage:", e);
  }
}

// 민감도 값을 한국어로 변환
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

// 민감도에 따른 임계값 가져오기 (turtleStabilizer용)
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

