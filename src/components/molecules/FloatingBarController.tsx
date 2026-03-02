"use client";

import { usePathname } from "next/navigation";
import { FloatingBar } from "@/components/molecules/FloatingBar";
import { useMeasurement } from "@/providers/MeasurementProvider";

const FLOATING_BAR_ALLOWED_ROUTES = ["/", "/estimate"];

export function FloatingBarController() {
  const pathname = usePathname();
  const { stopEstimating, measurementStarted, elapsedSeconds, stopMeasurement } = useMeasurement();

  if (!FLOATING_BAR_ALLOWED_ROUTES.includes(pathname ?? "")) {
    return null;
  }

  return (
    <FloatingBar
      visible={!stopEstimating && measurementStarted}
      title="측정 중"
      elapsedSeconds={elapsedSeconds}
      onStop={stopMeasurement}
    />
  );
}
