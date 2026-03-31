//삭제할 것
"use client";

import { usePathname } from "@/i18n/navigation";
import { FloatingBar } from "@/app/[locale]/(protected)/estimate/components/FloatingBar";
import { useMeasurement } from "@/controllers/MeasurementController";
import { useDocumentPiP } from "@/controllers/PipController";
import { useMeasurementStore } from "@/app/store/useMeasurementStore";

const FLOATING_BAR_ALLOWED_ROUTES = ["/", "/estimate"];

export function FloatingBarController() {
  const pathname = usePathname();
  const { closePiP } = useDocumentPiP();
  const elapsedSeconds = useMeasurementStore((state) => state.elapsedSeconds);
  const stopEstimating = useMeasurementStore((state) => state.stopEstimating);
  const measurementStarted = useMeasurementStore((state) => state.measurementStarted);
  const { stopMeasurement } = useMeasurement();
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
