"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useMeasurementSave } from "@/hooks/useMeasurementSave";
import { useTurtleNeckMeasurement } from "@/hooks/useTurtleNeckMeasurement";
import { RecoveryNotice } from "@/app/[locale]/(protected)/estimate/components/RecoveryNotice";
import { useMeasurementStore } from "@/app/store/useMeasurementStore";
import { cn } from "@/utils/cn";
import { StatusBannerType, type GuideColor } from "@/utils/types";
import useAutoStopOnNavigation from "@/hooks/useAutoStopOnNavigation";
import {
  clearMeasurementInterruptedInSession,
  isMeasurementInterruptedInSession,
  markMeasurementInterruptedInSession,
} from "@/lib/measurementSession";

export const MEASUREMENT_CANVAS_SLOT_ID = "measurement-canvas-slot";

type MeasurementContextValue = {
  stopEstimating: boolean;
  startMeasurement: () => void;
  stopMeasurement: () => Promise<void>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  countdownRemain: number | null;
  measurementStarted: boolean;
  showMeasurementStartedToast: boolean;
  error: string | null;
  getStatusBannerType: () => StatusBannerType;
  statusBannerMessage: () => string;
  isTurtle: boolean;
  angle: number;
  isProcessing: boolean;
  canvasSlotId: string;
  isFirstFrameDrawn: boolean;
  guideMessage: string | null;
  guideColor: GuideColor;
};

const MeasurementContext = createContext<MeasurementContextValue | null>(null);

export function useMeasurement() {
  const ctx = useContext(MeasurementContext);
  if (!ctx)
    throw new Error(
      "[MeasurementController] : useMeasurement must be used within MeasurementController",
    );
  return ctx;
}

function useMeasurementRecovery(userId: string, measurementStarted: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const [showRecoveryNotice, setShowRecoveryNotice] = useState(false);

  useEffect(() => {
    if (!measurementStarted) return;
    markMeasurementInterruptedInSession();
  }, [measurementStarted]);

  useEffect(() => {
    if (!userId) return;
    if (isMeasurementInterruptedInSession()) setShowRecoveryNotice(true);
  }, [userId]);

  const dismissRecoveryNotice = useCallback(() => {
    clearMeasurementInterruptedInSession();
    setShowRecoveryNotice(false);
  }, []);

  const handleRecoveryRestart = useCallback(() => {
    dismissRecoveryNotice();
    if (pathname !== "/estimate") {
      router.push("/estimate");
    }
  }, [dismissRecoveryNotice, pathname, router]);

  return { showRecoveryNotice, dismissRecoveryNotice, handleRecoveryRestart };
}

function useMeasurementTimer(
  stopEstimating: boolean,
  measurementStarted: boolean,
) {
  const incrementElapsedSeconds = useMeasurementStore(
    (state) => state.incrementElapsedSeconds,
  );
  const resetElapsedSeconds = useMeasurementStore(
    (state) => state.resetElapsedSeconds,
  );

  useEffect(() => {
    if (stopEstimating || !measurementStarted) {
      resetElapsedSeconds();
      return;
    }
    const interval = setInterval(() => {
      incrementElapsedSeconds();
    }, 1000);
    return () => clearInterval(interval);
  }, [
    stopEstimating,
    measurementStarted,
    incrementElapsedSeconds,
    resetElapsedSeconds,
  ]);
}

function useCanvasPortal(stopEstimating: boolean) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el =
      typeof document !== "undefined"
        ? document.getElementById(MEASUREMENT_CANVAS_SLOT_ID)
        : null;
    setSlotEl(el);
    setPortalTarget(
      el || (typeof document !== "undefined" ? document.body : null),
    );
  }, [mounted, pathname, stopEstimating]);

  return { slotEl, portalTarget };
}

type MeasurementCanvasPortalProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  slotEl: HTMLElement | null;
  portalTarget: HTMLElement;
};

function MeasurementCanvasPortal({
  canvasRef,
  slotEl,
  portalTarget,
}: MeasurementCanvasPortalProps) {
  return createPortal(
    <canvas
      ref={canvasRef}
      className={cn(
        slotEl
          ? "block h-full w-full bg-[var(--green-dark)]"
          : "absolute -left-[9999px]",
      )}
      style={slotEl ? undefined : { visibility: "hidden" }}
    />,
    portalTarget,
  );
}

type HiddenMeasurementVideoProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
};

function HiddenMeasurementVideo({ videoRef }: HiddenMeasurementVideoProps) {
  return (
    <video
      ref={videoRef}
      className="absolute -left-[9999px]"
      muted
      playsInline
    />
  );
}

export function MeasurementController({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";

  const stopEstimating = useMeasurementStore((state) => state.stopEstimating);
  const setStopEstimating = useMeasurementStore(
    (state) => state.setStopEstimating,
  );
  const isProcessing = useMeasurementStore((state) => state.isProcessing);

  const coreMeasurement = useTurtleNeckMeasurement({ userId, stopEstimating });

  const { handleStopMeasurement } = useMeasurementSave({
    userId,
    sessionId: session?.user?.id,
    angle: coreMeasurement.angle,
    isTurtle: coreMeasurement.isTurtle,
    resetForNewMeasurement: coreMeasurement.resetForNewMeasurement,
  });

  const { showRecoveryNotice, dismissRecoveryNotice, handleRecoveryRestart } =
    useMeasurementRecovery(userId, coreMeasurement.measurementStarted);

  const { slotEl, portalTarget } = useCanvasPortal(stopEstimating);
  useMeasurementTimer(stopEstimating, coreMeasurement.measurementStarted);

  useAutoStopOnNavigation(
    pathname,
    coreMeasurement.measurementStarted,
    handleStopMeasurement,
    setStopEstimating,
  );

  const startMeasurement = useCallback(() => {
    dismissRecoveryNotice();
    setStopEstimating(false);
  }, [setStopEstimating, dismissRecoveryNotice]);

  const stopMeasurement = useCallback(async () => {
    await handleStopMeasurement();
  }, [handleStopMeasurement]);

  const value = useMemo(
    () => ({
      stopEstimating,
      startMeasurement,
      stopMeasurement,
      ...coreMeasurement,
      isProcessing,
      canvasSlotId: MEASUREMENT_CANVAS_SLOT_ID,
    }),
    [
      stopEstimating,
      startMeasurement,
      stopMeasurement,
      coreMeasurement,
      isProcessing,
    ],
  );

  const canRenderPortal =
    typeof document !== "undefined" && portalTarget !== null;

  return (
    <MeasurementContext.Provider value={value}>
      {children}

      {canRenderPortal && (
        <MeasurementCanvasPortal
          canvasRef={coreMeasurement.canvasRef}
          slotEl={slotEl}
          portalTarget={portalTarget}
        />
      )}

      <HiddenMeasurementVideo videoRef={coreMeasurement.videoRef} />

      <RecoveryNotice
        isVisible={showRecoveryNotice}
        onRestart={handleRecoveryRestart}
        onDismiss={dismissRecoveryNotice}
      />
    </MeasurementContext.Provider>
  );
}
