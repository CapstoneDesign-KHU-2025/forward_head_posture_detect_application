"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { startTransition, useActionState } from "react";
import { getTodayHourly } from "@/lib/hourlyOps";
import { getTodayCount, storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { useTurtleNeckMeasurement } from "@/hooks/useTurtleNeckMeasurement";
import { createISO } from "@/utils/createISO";
import { postDailySummaryAction } from "@/app/actions/summaryActions";
import { RecoveryNotice } from "@/app/[locale]/(protected)/estimate/components/RecoveryNotice";
import { logger } from "@/lib/logger";
import { StatusBannerType } from "@/utils/types";
import type { GuideColor } from "@/utils/types";

import { useMeasurementStore } from "@/app/store/useMeasurementStore";
export const MEASUREMENT_CANVAS_SLOT_ID = "measurement-canvas-slot";

const SESSION_STORAGE_MEASUREMENT_INTERRUPTED = "measurement_interrupted";

type MeasurementContextValue = {
  stopEstimating: boolean;
  startMeasurement: () => void;
  stopMeasurement: () => void;
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
  if (!ctx) throw new Error("[MeasurementController] : useMeasurement must be used within MeasurementController");
  return ctx;
}

export function MeasurementController({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string;

  //elapsedSecond is not called here cause if it's called this controller will be rendered every single second.
  const stopEstimating = useMeasurementStore((state) => state.stopEstimating);
  const isProcessing = useMeasurementStore((state) => state.isProcessing);
  const setStopEstimating = useMeasurementStore((state) => state.setStopEstimating);
  const setIsProcessing = useMeasurementStore((state) => state.setIsProcessing);
  const incrementElapsedSeconds = useMeasurementStore((state) => state.incrementElapsedSeconds);
  const resetElapsedSeconds = useMeasurementStore((state) => state.resetElapsedSeconds);

  const [showRecoveryNotice, setShowRecoveryNotice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [_dailySumState, dailySumAction] = useActionState(postDailySummaryAction, null);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    videoRef,
    canvasRef,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,
    getStatusBannerType,
    statusBannerMessage,
    isTurtle,
    angle,
    isFirstFrameDrawn,
    guideMessage,
    guideColor,
    resetForNewMeasurement,
  } = useTurtleNeckMeasurement({ userId, stopEstimating });

  const handleStopMeasurement = useCallback(
    async (forced?: boolean) => {
      if (isProcessing) return;
      try {
        setIsProcessing(true);
        if (!stopEstimating) {
          await storeMeasurementAndAccumulate({
            userId,
            ts: Date.now(),
            angleDeg: angle,
            isTurtle,
            hasPose: true,
            sessionId: session?.user?.id,
            sampleGapS: 10,
          });
          const rows = await getTodayHourly(userId);
          const dailySumWeighted = rows?.reduce((acc: number, r: any) => acc + (r?.sumWeighted ?? 0), 0) ?? 0;
          const dailyWeightSeconds = rows?.reduce((acc: number, r: any) => acc + (r?.weight ?? 0), 0) ?? 0;
          const count = await getTodayCount(userId);
          const dateISO = createISO();
          const postData = {
            userId,
            dateISO,
            sumWeighted: dailySumWeighted,
            weightSeconds: dailyWeightSeconds,
            count,
          };
          startTransition(() => dailySumAction(postData));
          resetForNewMeasurement();
          if (forced) return;
        }
      } catch (err) {
        logger.error("[handleStopMeasurement] error:", err);
        resetForNewMeasurement();
      } finally {
        if (!forced) setStopEstimating(!stopEstimating);
        setIsProcessing(false);
        resetForNewMeasurement();
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED);
        }
      }
    },
    [
      userId,
      stopEstimating,
      angle,
      isTurtle,
      isProcessing,
      session?.user?.id,
      dailySumAction,
      setIsProcessing,
      setStopEstimating,
      resetForNewMeasurement,
    ],
  );

  const startMeasurement = useCallback(() => {
    setShowRecoveryNotice(false);
    setStopEstimating(false);
  }, [setStopEstimating]);

  const stopMeasurement = useCallback(async () => {
    await handleStopMeasurement();
  }, [handleStopMeasurement]);

  useEffect(() => {
    if (typeof window === "undefined" || !measurementStarted) return;
    sessionStorage.setItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED, "1");
  }, [measurementStarted]);

  useEffect(() => {
    if (pathname !== "/estimate" && pathname !== "/") {
      if (measurementStarted) {
        handleStopMeasurement(true);
      }
      setStopEstimating(true);
    } else if (pathname === "/" && !measurementStarted) {
      setStopEstimating(true);
    }
  }, [pathname, measurementStarted, handleStopMeasurement, setStopEstimating]);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const interrupted = sessionStorage.getItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED);
    if (interrupted === "1") {
      setShowRecoveryNotice(true);
    }
  }, [userId]);

  const dismissRecoveryNotice = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED);
    }
    setShowRecoveryNotice(false);
  }, []);

  const handleRecoveryRestart = useCallback(() => {
    dismissRecoveryNotice();
    if (pathname !== "/estimate") {
      router.push("/estimate");
    }
  }, [dismissRecoveryNotice, pathname, router]);

  // fixed logic : now component is not rendered every time!
  useEffect(() => {
    if (stopEstimating || !measurementStarted) {
      resetElapsedSeconds();
      return;
    }
    const interval = setInterval(() => {
      incrementElapsedSeconds();
    }, 1000);
    return () => clearInterval(interval);
  }, [stopEstimating, measurementStarted, incrementElapsedSeconds, resetElapsedSeconds]);

  const value = useMemo(
    () => ({
      stopEstimating,
      startMeasurement,
      stopMeasurement,
      videoRef,
      canvasRef,
      countdownRemain,
      measurementStarted,
      showMeasurementStartedToast,
      error,
      getStatusBannerType,
      statusBannerMessage,
      isTurtle,
      angle,
      isProcessing,
      canvasSlotId: MEASUREMENT_CANVAS_SLOT_ID,
      isFirstFrameDrawn,
      guideMessage,
      guideColor,
      resetForNewMeasurement,
    }),
    [
      stopEstimating,
      startMeasurement,
      stopMeasurement,
      videoRef,
      canvasRef,
      countdownRemain,
      measurementStarted,
      showMeasurementStartedToast,
      error,
      getStatusBannerType,
      statusBannerMessage,
      isTurtle,
      angle,
      isProcessing,
      isFirstFrameDrawn,
      guideMessage,
      guideColor,
      resetForNewMeasurement,
    ],
  );

  useEffect(() => {
    if (!mounted) return;
    const slotEl = typeof document !== "undefined" ? document.getElementById(MEASUREMENT_CANVAS_SLOT_ID) : null;
    setSlotEl(slotEl);
    const portalTarget = slotEl || (typeof document !== "undefined" ? document.body : null);
    setPortalTarget(portalTarget);
  }, [mounted, pathname, stopEstimating]);

  return (
    <MeasurementContext.Provider value={value}>
      {children}

      {typeof document !== "undefined" &&
        portalTarget &&
        createPortal(
          <canvas
            ref={canvasRef}
            className={slotEl ? "h-full w-full block bg-[#2C3E50]" : "absolute -left-[9999px]"}
            style={slotEl ? undefined : { visibility: "hidden" }}
          />,
          portalTarget,
        )}

      <video ref={videoRef} className="absolute -left-[9999px]" muted playsInline />

      <RecoveryNotice
        isVisible={showRecoveryNotice}
        onRestart={handleRecoveryRestart}
        onDismiss={dismissRecoveryNotice}
      />
    </MeasurementContext.Provider>
  );
}
