export const MEASUREMENT_INTERRUPTED_SESSION_KEY = "measurement_interrupted";

export function markMeasurementInterruptedInSession() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MEASUREMENT_INTERRUPTED_SESSION_KEY, "1");
}

export function clearMeasurementInterruptedInSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(MEASUREMENT_INTERRUPTED_SESSION_KEY);
}

export function isMeasurementInterruptedInSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(MEASUREMENT_INTERRUPTED_SESSION_KEY) === "1";
}
