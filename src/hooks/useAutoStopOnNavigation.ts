"use client";
import { useEffect } from "react";

export default function useAutoStopOnNavigation(
  pathname: string,
  measurementStarted: boolean,
  handleStopMeasurement: (forced?: boolean) => void,
  setStopEstimating: (val: boolean) => void,
) {
  useEffect(() => {
    const isAllowedPage = ["/estimate", "/"].includes(pathname);

    if (!isAllowedPage) {
      if (measurementStarted) handleStopMeasurement(true);
      setStopEstimating(true);
      return;
    }

    if (pathname === "/" && !measurementStarted) {
      setStopEstimating(true);
    }
  }, [pathname, measurementStarted, handleStopMeasurement, setStopEstimating]);
}
