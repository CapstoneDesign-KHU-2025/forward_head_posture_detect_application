"use client";
import { useEffect } from "react";

export default function useAutoStopOnNavigation(
  pathname: string,
  measurementStarted: boolean,
  handleStopMeasurement: (forced?: boolean) => void,
  setStopEstimating: (val: boolean) => void,
) {
  useEffect(() => {
    if (pathname !== "/estimate" && pathname !== "/") {
      if (measurementStarted) handleStopMeasurement(true);
      setStopEstimating(true);
    } else if (pathname === "/" && !measurementStarted) {
      setStopEstimating(true);
    }
  }, [pathname, measurementStarted, handleStopMeasurement, setStopEstimating]);
}
