"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMeasurement } from "@/providers/MeasurementProvider";
import { Button } from "@/components/atoms/Button";
import EstimatePanel from "@/components/molecules/EstimatePanel";
import ErrorBanner from "@/components/atoms/ErrorBanner";
import AsyncBoundary from "@/components/molecules/AsyncBoundary";
import { MEASUREMENT_CANVAS_SLOT_ID } from "@/providers/MeasurementProvider";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useDocumentPiP } from "@/providers/PipProvider";
import { TrialIntroGuideModal } from "@/components/molecules/TrialIntroGuideModal";
import { TrialLoginPromptModal } from "@/components/molecules/TrialLoginPromptModal";
import { PictureInPicture2 } from "lucide-react";

const SPOTLIGHT_PAD = 10;
const SPOTLIGHT_HOLE_RADIUS = 22;
const PANEL_BUBBLE_GAP = 12;
const STEP5_BUBBLE_TOP_NUDGE_PX = 114;
const STOP_BTN_BUBBLE_GAP = 12;

function SpotlightDim({ rect }: { rect: DOMRect }) {
  const t = rect.top - SPOTLIGHT_PAD;
  const l = rect.left - SPOTLIGHT_PAD;
  const w = rect.width + SPOTLIGHT_PAD * 2;
  const h = rect.height + SPOTLIGHT_PAD * 2;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[140]"
      style={{
        top: t,
        left: l,
        width: w,
        height: h,
        borderRadius: SPOTLIGHT_HOLE_RADIUS,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
      }}
    />
  );
}

type TrialUiPhase = "intro" | "spotlight" | "active";
type CoachStep = 1 | 2 | 3 | 4 | 5 | 6;

function getTrialCoachStep(
  phase: TrialUiPhase,
  stopEstimating: boolean,
  isFirstFrameDrawn: boolean,
  measurementStarted: boolean,
  ack4: boolean,
  ack5: boolean,
  ack6: boolean,
): CoachStep | null {
  if (phase === "intro") return null;
  if (phase === "spotlight") return 1;
  if (stopEstimating) return null;
  if (!isFirstFrameDrawn) return 2;
  if (!measurementStarted) return 3;
  if (!ack4) return 4;
  if (!ack5) return 5;
  if (!ack6) return 6;
  return null;
}

function panelSideBubbleStyle(
  side: "left" | "right",
  panel: DOMRect,
  bubbleMaxWidth: number,
  verticalOffsetPx = 0,
): React.CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const maxW = Math.min(bubbleMaxWidth, vw - 24);
  let left =
    side === "left"
      ? panel.left - maxW - PANEL_BUBBLE_GAP
      : panel.right + PANEL_BUBBLE_GAP;
  left = Math.max(12, Math.min(left, vw - maxW - 12));
  const centerY = panel.top + panel.height / 2 + verticalOffsetPx;
  const top = Math.min(Math.max(centerY, 72), vh - 72);
  return {
    width: maxW,
    left,
    top,
    transform: "translateY(-50%)",
  };
}

function stopButtonAdjacentBubbleStyle(btn: DOMRect, bubbleMaxWidth: number): React.CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const maxW = Math.min(bubbleMaxWidth, vw - 24);
  const pad = 12;
  const gap = STOP_BTN_BUBBLE_GAP;
  const placeRight = btn.right + gap + maxW <= vw - pad;
  const left = placeRight
    ? Math.max(pad, btn.right + gap)
    : Math.max(pad, btn.left - maxW - gap);
  const top = Math.min(Math.max(btn.top + btn.height / 2, 72), vh - 72);
  return {
    width: maxW,
    left: Math.min(left, vw - maxW - pad),
    top,
    transform: "translateY(-50%)",
  };
}

type CoachBubbleProps = {
  titleId: string;
  badge: string;
  title: string;
  body: string;
  style: React.CSSProperties;
  ackLabel?: string;
  onAck?: () => void;
  showPipIcon?: boolean;
};

function TrialCoachBubble({
  titleId,
  badge,
  title,
  body,
  style,
  ackLabel,
  onAck,
  showPipIcon,
}: CoachBubbleProps) {
  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      className="fixed z-[170] rounded-[20px] border border-[var(--green-border)] bg-white p-5 shadow-[0_20px_56px_rgba(45,59,53,0.16)]"
      style={style}
    >
      <span className="mb-3 inline-block rounded-full bg-[var(--green-light)] px-3 py-1.5 text-[11px] font-bold text-[var(--green-dark)]">
        {badge}
      </span>
      <h3 id={titleId} className="mb-2 font-[Nunito] text-[17px] font-black leading-snug text-[var(--text)]">
        {title}
      </h3>
      {showPipIcon ? (
        <div className="mb-3 flex justify-center" aria-hidden>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--green)] text-white shadow-[0_4px_14px_rgba(74,124,89,0.35)]">
            <PictureInPicture2 size={22} className="shrink-0 text-white" strokeWidth={2} />
          </span>
        </div>
      ) : null}
      {body ? <p className="text-[13px] leading-relaxed text-[var(--text-sub)]">{body}</p> : null}
      {ackLabel && onAck ? (
        <Button type="button" size="lg" variant="primary" className="mt-4 w-full" onClick={onAck}>
          {ackLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default function TrialTemplate() {
  const { data: session } = useSession();
  const t = useTranslations("Estimate");
  const tTrial = useTranslations("Trial");
  const bubbleTitleBaseId = useId();
  const {
    stopEstimating,
    startMeasurement,
    stopMeasurement,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    error,
    getStatusBannerType,
    statusBannerMessage,
    isFirstFrameDrawn,
    guideColor,
  } = useMeasurement();
  const { closePiP } = useDocumentPiP();
  const bannerType = getStatusBannerType();
  const bannerMessage = statusBannerMessage();

  const [trialPhase, setTrialPhase] = useState<TrialUiPhase>("intro");
  const [coachAck4, setCoachAck4] = useState(false);
  const [coachAck5, setCoachAck5] = useState(false);
  const [coachAck6, setCoachAck6] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const startBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelWrapRef = useRef<HTMLDivElement | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  const [stopBtnBubbleRect, setStopBtnBubbleRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (stopEstimating) {
      setCoachAck4(false);
      setCoachAck5(false);
      setCoachAck6(false);
    }
  }, [stopEstimating]);

  const coachStep = useMemo(
    () =>
      getTrialCoachStep(
        trialPhase,
        stopEstimating,
        isFirstFrameDrawn,
        measurementStarted,
        coachAck4,
        coachAck5,
        coachAck6,
      ),
    [
      trialPhase,
      stopEstimating,
      isFirstFrameDrawn,
      measurementStarted,
      coachAck4,
      coachAck5,
      coachAck6,
    ],
  );

  useLayoutEffect(() => {
    if (trialPhase !== "spotlight" || !stopEstimating) {
      setSpotlightRect(null);
      return;
    }
    const el = startBtnRef.current;
    if (!el) return;

    const update = () => {
      if (startBtnRef.current) {
        setSpotlightRect(startBtnRef.current.getBoundingClientRect());
      }
    };
    update();
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [trialPhase, stopEstimating]);

  useLayoutEffect(() => {
    if (
      trialPhase !== "active" ||
      stopEstimating ||
      coachStep === null ||
      coachStep === 1 ||
      coachStep === 6
    ) {
      setPanelRect(null);
      return;
    }
    const el = panelWrapRef.current;
    if (!el) return;

    const update = () => {
      if (panelWrapRef.current) {
        setPanelRect(panelWrapRef.current.getBoundingClientRect());
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro.disconnect();
    };
  }, [trialPhase, stopEstimating, coachStep]);

  useLayoutEffect(() => {
    if (trialPhase !== "active" || stopEstimating || coachStep !== 6) {
      setStopBtnBubbleRect(null);
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    const update = () => {
      const elNow = startBtnRef.current;
      if (elNow) {
        const r = elNow.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setStopBtnBubbleRect(r);
        }
      }
    };

    const el = startBtnRef.current;
    update();
    raf1 = requestAnimationFrame(update);
    raf2 = requestAnimationFrame(() => requestAnimationFrame(update));

    if (el) {
      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, true);
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        window.removeEventListener("resize", update);
        window.removeEventListener("scroll", update, true);
        ro.disconnect();
      };
    }
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [trialPhase, stopEstimating, coachStep]);

  const handleIntroNext = () => {
    setTrialPhase("spotlight");
  };

  const handleClickTrialButton = () => {
    if (trialPhase === "intro") return;

    if (stopEstimating) {
      setShowLoginPrompt(false);
      if (trialPhase === "spotlight") {
        startMeasurement();
        setTrialPhase("active");
        return;
      }
      if (trialPhase === "active") {
        startMeasurement();
      }
    } else {
      stopMeasurement();
      closePiP();
      if (!session?.user) {
        setShowLoginPrompt(true);
      }
    }
  };

  const showSpotlight =
    coachStep === 1 && trialPhase === "spotlight" && stopEstimating && spotlightRect;

  const bubbleMaxWidth = 300;
  const ackLabel = tTrial("spotlight.ackButton");
  const coachPrefix = coachStep != null ? (`step${coachStep}` as const) : null;
  const coachBadge = coachPrefix ? tTrial(`spotlight.${coachPrefix}.badge`) : "";
  const coachTitle = coachPrefix ? tTrial(`spotlight.${coachPrefix}.title`) : "";
  const coachBody = coachPrefix ? tTrial(`spotlight.${coachPrefix}.body`) : "";

  const step1BubbleStyle: React.CSSProperties | null =
    showSpotlight && spotlightRect
      ? {
          width: Math.min(bubbleMaxWidth, typeof window !== "undefined" ? window.innerWidth - 24 : 300),
          top: Math.min(
            spotlightRect.bottom + SPOTLIGHT_PAD + 12,
            typeof window !== "undefined" ? window.innerHeight - 260 : 0,
          ),
          left: Math.max(
            12,
            Math.min(
              spotlightRect.left + spotlightRect.width / 2 - bubbleMaxWidth / 2,
              (typeof window !== "undefined" ? window.innerWidth : 400) - bubbleMaxWidth - 12,
            ),
          ),
        }
      : null;

  const sideBubbleStyle: React.CSSProperties | null =
    coachStep != null &&
    coachStep >= 2 &&
    coachStep <= 5 &&
    panelRect &&
    typeof window !== "undefined"
      ? panelSideBubbleStyle(
          coachStep === 2 ? "left" : "right",
          panelRect,
          bubbleMaxWidth,
          coachStep === 5 ? STEP5_BUBBLE_TOP_NUDGE_PX : 0,
        )
      : null;

  const step6BubbleStyle: React.CSSProperties | null =
    coachStep === 6 && stopBtnBubbleRect && typeof window !== "undefined"
      ? stopButtonAdjacentBubbleStyle(stopBtnBubbleRect, bubbleMaxWidth)
      : null;

  const emphasizeStopRow = showSpotlight || (coachStep === 6 && !stopEstimating);

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] bg-[var(--green-pale)] overflow-x-hidden">
      <TrialIntroGuideModal isOpen={trialPhase === "intro"} onNext={handleIntroNext} />
      <TrialLoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {showSpotlight && <SpotlightDim rect={spotlightRect} />}

      {showSpotlight && spotlightRect && step1BubbleStyle && (
        <TrialCoachBubble
          titleId={`${bubbleTitleBaseId}-1`}
          badge={coachBadge}
          title={coachTitle}
          body={coachBody}
          style={step1BubbleStyle}
        />
      )}

      {coachStep != null && coachStep >= 2 && coachStep <= 5 && sideBubbleStyle && (
        <TrialCoachBubble
          titleId={`${bubbleTitleBaseId}-${coachStep}`}
          badge={coachBadge}
          title={coachTitle}
          body={coachBody}
          style={sideBubbleStyle}
          showPipIcon={coachStep === 5}
          ackLabel={coachStep === 4 || coachStep === 5 ? ackLabel : undefined}
          onAck={
            coachStep === 4 ? () => setCoachAck4(true) : coachStep === 5 ? () => setCoachAck5(true) : undefined
          }
        />
      )}

      {coachStep === 6 && step6BubbleStyle && (
        <TrialCoachBubble
          titleId={`${bubbleTitleBaseId}-6`}
          badge={coachBadge}
          title={coachTitle}
          body={coachBody}
          style={step6BubbleStyle}
          ackLabel={ackLabel}
          onAck={() => setCoachAck6(true)}
        />
      )}

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-2 w-full min-w-0 mb-4">
        <div
          className={`flex justify-center mb-14 ${emphasizeStopRow ? "relative z-[160]" : ""}`}
        >
          <div
            className={
              showSpotlight && stopEstimating
                ? "rounded-[22px] p-1 ring-[3px] ring-white shadow-[0_0_0_1px_rgba(74,124,89,0.25),0_8px_32px_rgba(255,255,255,0.45)]"
                : ""
            }
          >
            <Button
              ref={startBtnRef}
              size="lg"
              variant={stopEstimating ? "primary" : "danger"}
              onClick={handleClickTrialButton}
              disabled={trialPhase === "intro"}
              className={trialPhase === "intro" ? "opacity-60" : ""}
            >
              {stopEstimating ? t("buttons.start") : tTrial("stopButton")}
            </Button>
          </div>
        </div>

        <div ref={panelWrapRef} className="w-full max-w-[600px] min-w-0 mx-auto">
          <AsyncBoundary
            suspenseFallback={
              <section className="bg-white rounded-[16px] overflow-hidden shadow-[0_2px_16px_rgba(74,124,89,0.13)] w-full max-w-[600px] min-w-0 mx-auto">
                <header className="flex items-center justify-between gap-2 px-4 py-3 bg-white border-b-[1.5px] border-[var(--green-border)]">
                  <div className="flex items-center gap-[7px] min-w-0">
                    <span className="text-[15px] flex-shrink-0" aria-hidden>
                      📷
                    </span>
                    <h2 className="m-0 text-[13px] font-bold text-[var(--green)]">{t("cameraTitle")}</h2>
                  </div>
                  <span className="inline-flex items-center gap-[5px] rounded-[20px] px-2.5 py-1.5 text-[11px] font-bold bg-[#f0f4f2] border border-[var(--green-border)] text-[var(--text-muted)]">
                    {t("async.suspense")}
                  </span>
                </header>
                <div
                  className="relative w-full min-w-0 overflow-hidden bg-gradient-to-br from-[#ddf0e4] via-[#edf8f1] to-[#cde8d5]"
                  style={{ aspectRatio: "4/3" }}
                />
              </section>
            }
          >
            <EstimatePanel
              bannerType={bannerType}
              bannerMessage={bannerMessage}
              canvasSlotId={MEASUREMENT_CANVAS_SLOT_ID}
              showMeasurementStartedToast={showMeasurementStartedToast}
              countdownRemain={countdownRemain}
              measurementStarted={measurementStarted}
              stopEstimating={stopEstimating}
              isFirstFrameDrawn={isFirstFrameDrawn}
              guideColor={guideColor}
            />
          </AsyncBoundary>
        </div>
        {error && <ErrorBanner error={error} />}
      </div>
    </div>
  );
}
