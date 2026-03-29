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
import { FloatingBarController } from "@/app/[locale]/(protected)/estimate/components/FloatingBarController";
import { RecoveryNotice } from "@/app/[locale]/(protected)/estimate/components/RecoveryNotice";
import { logger } from "@/lib/logger";
import { StatusBannerType } from "@/utils/types";
import type { GuideColor } from "@/utils/types";

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
  elapsedSeconds: number;
  isProcessing: boolean;
  canvasSlotId: string;
  isFirstFrameDrawn: boolean;
  guideMessage: string | null;
  guideColor: GuideColor;
};

const MeasurementContext = createContext<MeasurementContextValue | null>(null);

export function useMeasurement() {
  const ctx = useContext(MeasurementContext);
  if (!ctx) throw new Error("useMeasurement must be used within MeasurementProvider");
  return ctx;
}

export function MeasurementProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string;

  const [stopEstimating, setStopEstimating] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
        if (!forced) setStopEstimating((prev) => !prev);
        setIsProcessing(false);
        resetForNewMeasurement();
        // delete flag when it's ended normally
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED);
        }
      }
    },
    [userId, stopEstimating, angle, isTurtle, isProcessing, session?.user?.id, dailySumAction],
  );

  const startMeasurement = useCallback(() => {
    setShowRecoveryNotice(false);
    setStopEstimating(false);
  }, []);

  const stopMeasurement = useCallback(() => {
    handleStopMeasurement();
  }, [handleStopMeasurement]);

  // set flag when the measurement started
  useEffect(() => {
    if (typeof window === "undefined" || !measurementStarted) return;
    sessionStorage.setItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED, "1");
  }, [measurementStarted]);

  // when user moves to other pages
  useEffect(() => {
    if (pathname !== "/estimate" && pathname !== "/") {
      if (measurementStarted) {
        handleStopMeasurement(true);
      }
      setStopEstimating(true);
    } else if (pathname === "/" && !measurementStarted) {
      setStopEstimating(true);
    }
  }, [pathname, measurementStarted, handleStopMeasurement]);

  // restart measuring
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

  useEffect(() => {
    if (stopEstimating || !measurementStarted) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [stopEstimating, measurementStarted]);

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
      elapsedSeconds,
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
      elapsedSeconds,
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

      {/* video - hide always */}
      <video ref={videoRef} className="absolute -left-[9999px]" muted playsInline />

      <FloatingBarController />

      <RecoveryNotice
        isVisible={showRecoveryNotice}
        onRestart={handleRecoveryRestart}
        onDismiss={dismissRecoveryNotice}
      />
    </MeasurementContext.Provider>
  );
}
