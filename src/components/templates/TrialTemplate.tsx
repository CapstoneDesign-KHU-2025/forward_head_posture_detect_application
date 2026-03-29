"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMeasurement } from "@/providers/MeasurementProvider";
import { Button } from "@/components/atoms/Button";
import EstimatePanel from "@/components/molecules/EstimatePanel";
import ErrorBanner from "@/components/atoms/ErrorBanner";
import AsyncBoundary from "@/components/molecules/AsyncBoundary";
import { MEASUREMENT_CANVAS_SLOT_ID } from "@/providers/MeasurementProvider";
import { useTranslations } from "next-intl";
import { useDocumentPiP } from "@/providers/PipProvider";
import { TrialIntroGuideModal } from "@/components/molecules/TrialIntroGuideModal";

const SPOTLIGHT_PAD = 10;
const PANEL_BUBBLE_GAP = 12;

function DimPanels({ rect }: { rect: DOMRect }) {
  const t = rect.top - SPOTLIGHT_PAD;
  const l = rect.left - SPOTLIGHT_PAD;
  const w = rect.width + SPOTLIGHT_PAD * 2;
  const h = rect.height + SPOTLIGHT_PAD * 2;
  const dim = "fixed z-[140] bg-black/60";
  return (
    <>
      <div className={dim} style={{ top: 0, left: 0, right: 0, height: Math.max(0, t) }} aria-hidden />
      <div className={dim} style={{ top: t + h, left: 0, right: 0, bottom: 0 }} aria-hidden />
      <div className={dim} style={{ top: t, left: 0, width: Math.max(0, l), height: h }} aria-hidden />
      <div className={dim} style={{ top: t, left: l + w, right: 0, height: h }} aria-hidden />
    </>
  );
}

type TrialUiPhase = "intro" | "spotlight" | "active";
type CoachStep = 1 | 2 | 3 | 4;

function getTrialCoachStep(
  phase: TrialUiPhase,
  stopEstimating: boolean,
  isFirstFrameDrawn: boolean,
  measurementStarted: boolean,
): CoachStep | null {
  if (phase === "intro") return null;
  if (phase === "spotlight") return 1;
  if (stopEstimating) return null;
  if (!isFirstFrameDrawn) return 2;
  if (!measurementStarted) return 3;
  return 4;
}

function panelSideBubbleStyle(
  side: "left" | "right",
  panel: DOMRect,
  bubbleMaxWidth: number,
): React.CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const maxW = Math.min(bubbleMaxWidth, vw - 24);
  let left =
    side === "left"
      ? panel.left - maxW - PANEL_BUBBLE_GAP
      : panel.right + PANEL_BUBBLE_GAP;
  left = Math.max(12, Math.min(left, vw - maxW - 12));
  const centerY = panel.top + panel.height / 2;
  const top = Math.min(Math.max(centerY, 72), vh - 72);
  return {
    width: maxW,
    left,
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
};

function TrialCoachBubble({ titleId, badge, title, body, style }: CoachBubbleProps) {
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
      <p className="text-[13px] leading-relaxed text-[var(--text-sub)]">{body}</p>
    </div>
  );
}

export default function TrialTemplate() {
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
  const startBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelWrapRef = useRef<HTMLDivElement | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);

  const coachStep = useMemo(
    () => getTrialCoachStep(trialPhase, stopEstimating, isFirstFrameDrawn, measurementStarted),
    [trialPhase, stopEstimating, isFirstFrameDrawn, measurementStarted],
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
    if (trialPhase !== "active" || stopEstimating || coachStep === null || coachStep === 1) {
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

  const handleIntroNext = () => {
    setTrialPhase("spotlight");
  };

  const handleClickTrialButton = () => {
    if (trialPhase === "intro") return;

    if (stopEstimating) {
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
    }
  };

  const showSpotlight =
    coachStep === 1 && trialPhase === "spotlight" && stopEstimating && spotlightRect;

  const bubbleMaxWidth = 300;
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
    coachStep != null && coachStep >= 2 && panelRect && typeof window !== "undefined"
      ? panelSideBubbleStyle(coachStep === 2 ? "left" : "right", panelRect, bubbleMaxWidth)
      : null;

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] bg-[var(--green-pale)] overflow-x-hidden">
      <TrialIntroGuideModal isOpen={trialPhase === "intro"} onNext={handleIntroNext} />

      {showSpotlight && <DimPanels rect={spotlightRect} />}

      {showSpotlight && spotlightRect && step1BubbleStyle && (
        <TrialCoachBubble
          titleId={`${bubbleTitleBaseId}-1`}
          badge={coachBadge}
          title={coachTitle}
          body={coachBody}
          style={step1BubbleStyle}
        />
      )}

      {coachStep != null && coachStep >= 2 && sideBubbleStyle && (
        <TrialCoachBubble
          titleId={`${bubbleTitleBaseId}-${coachStep}`}
          badge={coachBadge}
          title={coachTitle}
          body={coachBody}
          style={sideBubbleStyle}
        />
      )}

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-2 w-full min-w-0 mb-4">
        <div
          className={`flex justify-center mb-14 ${showSpotlight ? "relative z-[160]" : ""}`}
        >
          <div
            className={
              showSpotlight && stopEstimating
                ? "rounded-[16px] p-1 ring-[3px] ring-white shadow-[0_0_0_1px_rgba(74,124,89,0.25),0_8px_32px_rgba(255,255,255,0.45)]"
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
              {stopEstimating ? t("buttons.start") : t("buttons.stop")}
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
