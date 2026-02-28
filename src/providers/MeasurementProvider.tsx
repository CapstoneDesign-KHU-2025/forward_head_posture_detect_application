"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { startTransition, useActionState } from "react";
import { getTodayHourly } from "@/lib/hourlyOps";
import { getTodayCount, storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { useTurtleNeckMeasurement } from "@/hooks/useTurtleNeckMeasurement";
import { createISO } from "@/utils/createISO";
import { postDailySummaryAction } from "@/app/actions/summaryActions";
import { FloatingBar } from "@/components/molecules/FloatingBar";
import { RecoveryNotice } from "@/components/molecules/RecoveryNotice";
import { logger } from "@/lib/logger";
import type { StatusBannerType } from "@/hooks/useTurtleNeckMeasurement";

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
  isInitial: boolean;
  canvasSlotId: string;
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
  const [isInitial, setIsInitial] = useState(true);
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
  } = useTurtleNeckMeasurement({ userId, stopEstimating, isInitial });

  const handleStopMeasurement = useCallback(
    async (forced?: boolean) => {
      setIsInitial(false);
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
          if (forced) return;
        }
      } catch (err) {
        logger.error("[handleStopMeasurement] error:", err);
      } finally {
        if (!forced) setStopEstimating((prev) => !prev);
        setIsProcessing(false);
        // 정상 종료 시 중단 플래그 제거 (새로고침 후 복구 제안 방지)
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED);
        }
      }
    },
    [userId, stopEstimating, angle, isTurtle, isProcessing, session?.user?.id, dailySumAction],
  );

  const startMeasurement = useCallback(() => {
    setShowRecoveryNotice(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_STORAGE_MEASUREMENT_INTERRUPTED, "1");
    }
    setStopEstimating(false);
  }, []);

  const stopMeasurement = useCallback(() => {
    handleStopMeasurement();
  }, [handleStopMeasurement]);

  // 새로고침 후 이전 측정 중단 감지 → 복구 제안 표시 (로그인된 사용자에게만)
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
    startMeasurement();
  }, [dismissRecoveryNotice, startMeasurement, pathname, router]);

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
      isInitial,
      canvasSlotId: MEASUREMENT_CANVAS_SLOT_ID,
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
      isInitial,
    ],
  );
  useEffect(() => {
    if (!mounted) return;
    const slotEl = typeof document !== "undefined" ? document.getElementById(MEASUREMENT_CANVAS_SLOT_ID) : null;
    setSlotEl(slotEl);
    const portalTarget = slotEl || (typeof document !== "undefined" ? document.body : null);
    console.log(slotEl);
    setPortalTarget(portalTarget);
  }, [mounted, pathname]);

  return (
    <MeasurementContext.Provider value={value}>
      {children}

      {/* 캔버스 - estimate 페이지 슬롯에 포탈, 없으면 body에 숨김 */}
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

      {/* 비디오 - 항상 숨김 */}
      <video ref={videoRef} className="absolute -left-[9999px]" muted playsInline />

      <FloatingBar
        visible={!stopEstimating && measurementStarted}
        title="측정 중"
        elapsedSeconds={elapsedSeconds}
        onStop={stopMeasurement}
      />

      <RecoveryNotice
        isVisible={showRecoveryNotice}
        onRestart={handleRecoveryRestart}
        onDismiss={dismissRecoveryNotice}
      />
    </MeasurementContext.Provider>
  );
}
