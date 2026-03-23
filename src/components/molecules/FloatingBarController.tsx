"use client";

import { usePathname } from "@/i18n/navigation";
import { FloatingBar } from "@/components/molecules/FloatingBar";
import { useMeasurement } from "@/providers/MeasurementProvider";
import { useDocumentPiP } from "@/hooks/useDocumentPip";

const FLOATING_BAR_ALLOWED_ROUTES = ["/", "/estimate"];

export function FloatingBarController() {
  const pathname = usePathname();
  const { closePiP } = useDocumentPiP();
  const { stopEstimating, measurementStarted, elapsedSeconds, stopMeasurement } = useMeasurement();
  const onStop = () => {
    stopMeasurement();
    closePiP();
  };
  if (!FLOATING_BAR_ALLOWED_ROUTES.includes(pathname ?? "")) {
    return null;
  }

  return (
    <FloatingBar
      visible={!stopEstimating && measurementStarted}
      title="측정 중"
      elapsedSeconds={elapsedSeconds}
      onStop={onStop}
    />
  );
}
