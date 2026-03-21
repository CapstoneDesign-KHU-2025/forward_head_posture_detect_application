"use client";

import { useState, useEffect, useRef } from "react";
import { useMeasurement } from "@/providers/MeasurementProvider";
import { Button } from "@/components/atoms/Button";
import EstimatePanel from "@/components/molecules/EstimatePanel";
import StatCard from "@/components/molecules/StatCard";
import { PortalBubble, type PortalBubbleStep } from "@/components/molecules/PortalBubble";
import { MEASUREMENT_CANVAS_SLOT_ID } from "@/providers/MeasurementProvider";
import { useTranslations } from "next-intl";
import { formatMeasuredTime } from "@/utils/formatMeasuredTime";
const TRIAL_BUBBLE_STEPS: PortalBubbleStep[] = [
  {
    id: "cam-permission",
    emoji: "📷",
    title: "카메라를 허용해주세요",
    desc: "목 각도를 측정하려면 웹캠이 필요해요.",
    extra: (
      <div className="mt-3 flex items-start gap-1.5 rounded-[10px] border border-[var(--green-border)] bg-[var(--green-pale)] p-2.5">
        <span className="text-sm">🔒</span>
        <div className="text-[11px] leading-relaxed text-[var(--text-sub)] [&_strong]:font-bold [&_strong]:text-[var(--green-dark)]">
          <strong>촬영된 영상은 외부로 나가지 않아요.</strong>
          <br />
          내 화면에서만 보이고, 어디에도 저장되지 않아요.
        </div>
      </div>
    ),
    hasBtn: true,
    btnTxt: "허용하고 시작하기",
    targetId: "btnMeasure",
    placement: "above",
  },
  {
    id: "setup",
    emoji: "🖥️",
    title: "잠깐, 세팅 먼저!",
    desc: "정확한 측정을 위해 확인해주세요.",
    extra: (
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 rounded-[9px] border border-[var(--green-border)] bg-[var(--green-pale)] p-2">
          <span className="text-base">👁️</span>
          <div className="text-[11px] text-[var(--text-sub)]">
            <strong className="block text-[11px] font-bold text-[var(--text)]">웹캠이 눈높이에 오도록</strong>
            노트북을 올리거나 거치대를 사용해주세요
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[9px] border border-[var(--green-border)] bg-[var(--green-pale)] p-2">
          <span className="text-base">📏</span>
          <div className="text-[11px] text-[var(--text-sub)]">
            <strong className="block text-[11px] font-bold text-[var(--text)]">화면과 40~60cm 거리</strong>
            너무 가깝거나 멀면 감지가 어려울 수 있어요
          </div>
        </div>
      </div>
    ),
    hasBtn: true,
    btnTxt: "준비됐어요!",
    targetId: "camView",
    placement: "right",
  },
  {
    id: "guide",
    emoji: "🎯",
    title: "가이드라인에 맞춰주세요",
    desc: "얼굴이 타원 안에 들어오면<br>자동으로 다음 단계로 넘어가요.",
    extra: (
      <div className="mt-3 flex items-center gap-1.5 rounded-[9px] border border-[var(--green-border)] bg-[var(--green-pale)] p-2">
        <div className="flex gap-0.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--green-mid)]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--green-mid)] [animation-delay:0.2s]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--green-mid)] [animation-delay:0.4s]" />
        </div>
        <span id="detectingTxt" className="text-[11px] text-[var(--text-sub)]">
          얼굴 감지 대기 중...
        </span>
      </div>
    ),
    hasBtn: false,
    targetId: "camView",
    placement: "right",
  },
];

type TrialResult = {
  elapsedSeconds: number;
  warnCount: number;
  avgAngle: number;
};

export default function TrialTemplate() {
  const t = useTranslations("Estimate");
  const tTrial = useTranslations("Trial");
  const {
    stopEstimating,
    startMeasurement,
    stopMeasurement,
    countdownRemain,
    measurementStarted,
    showMeasurementStartedToast,
    getStatusBannerType,
    statusBannerMessage,
    isFirstFrameDrawn,
    guideColor,
    angle,
    isTurtle,
    elapsedSeconds,
  } = useMeasurement();

  const [bubblePhase, setBubblePhase] = useState<"idle" | "permission" | "setup" | "guide" | "measuring">("idle");
  const [currentBubbleStep, setCurrentBubbleStep] = useState(0);
  const [showStartToast, setShowStartToast] = useState(false);
  const [trialResult, setTrialResult] = useState<TrialResult | null>(null);

  const trialStatsRef = useRef({ angleSum: 0, angleCount: 0, warnCount: 0 });
  const prevTurtleRef = useRef(false);

  // 측정 중: angle, isTurtle 누적
  useEffect(() => {
    if (!measurementStarted || stopEstimating) return;
    trialStatsRef.current.angleSum += angle;
    trialStatsRef.current.angleCount += 1;
    if (isTurtle && !prevTurtleRef.current) {
      trialStatsRef.current.warnCount += 1;
    }
    prevTurtleRef.current = isTurtle;
  }, [angle, isTurtle, measurementStarted, stopEstimating]);

  const bannerType = getStatusBannerType();
  const bannerMessage = statusBannerMessage();

  // 가이드 단계에서 카운트다운 시작 시 버블 숨김 (얼굴 감지됨)
  useEffect(() => {
    if (bubblePhase !== "guide") return;
    if (countdownRemain !== null) {
      const det = document.getElementById("detectingTxt");
      if (det) det.textContent = "✓ 얼굴 감지됨 — 잠시 후 시작해요";
      setBubblePhase("measuring");
    }
  }, [bubblePhase, countdownRemain]);

  const handleStartClick = () => {
    setTrialResult(null);
    setBubblePhase("permission");
    setCurrentBubbleStep(0);
  };

  const handleStopClick = () => {
    if (measurementStarted) {
      const { angleSum, angleCount, warnCount } = trialStatsRef.current;
      const avgAngle = angleCount > 0 ? angleSum / angleCount : 0;
      setTrialResult({
        elapsedSeconds,
        warnCount,
        avgAngle,
      });
      trialStatsRef.current = { angleSum: 0, angleCount: 0, warnCount: 0 };
      prevTurtleRef.current = false;
    }
    stopMeasurement();
  };

  const bubbleAction = () => {
    if (currentBubbleStep === 0) {
      setBubblePhase("setup");
      setCurrentBubbleStep(1);
      startMeasurement();
    } else if (currentBubbleStep === 1) {
      setBubblePhase("guide");
      setCurrentBubbleStep(2);
    }
  };

  const bubbleSkip = () => {
    if (bubblePhase === "permission") {
      startMeasurement();
      setBubblePhase("setup");
      setCurrentBubbleStep(1);
    } else if (bubblePhase === "setup") {
      setBubblePhase("guide");
      setCurrentBubbleStep(2);
    } else if (bubblePhase === "guide") {
      setBubblePhase("measuring");
    }
  };

  // 측정 시작 토스트
  useEffect(() => {
    if (measurementStarted && bubblePhase === "measuring" && stopEstimating === false) {
      setShowStartToast(true);
      const t = setTimeout(() => setShowStartToast(false), 2800);
      return () => clearTimeout(t);
    }
  }, [measurementStarted, bubblePhase, stopEstimating]);

  const showBubble = bubblePhase === "permission" || bubblePhase === "setup" || bubblePhase === "guide";
  const currentStep = TRIAL_BUBBLE_STEPS[currentBubbleStep];

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] bg-[var(--green-pale)] overflow-x-hidden">
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-2 w-full min-w-0 mb-4">
        {!trialResult && (
          <div className="flex justify-center mb-14">
            <Button
              id="btnMeasure"
              size="lg"
              variant={stopEstimating ? "primary" : "danger"}
              onClick={stopEstimating ? handleStartClick : handleStopClick}
            >
              {stopEstimating ? t("buttons.start") : t("buttons.stop")}
            </Button>
          </div>
        )}

        <div className="relative max-w-[600px] mx-auto">
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

          {/* Portal 버블 - 측정 패널 오른쪽에 바로 붙여서 */}
          {showBubble && currentStep && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-[9999]">
              <PortalBubble
                isVisible={showBubble}
                currentStep={currentBubbleStep}
                steps={TRIAL_BUBBLE_STEPS}
                step={currentStep}
                onAction={bubbleAction}
                onSkip={bubbleSkip}
              />
            </div>
          )}
        </div>

        {/* 체험 측정 결과 스탯 카드 */}
        {trialResult && (
          <div className="mt-8">
            <h3 className="mb-4 text-center font-[Nunito] text-lg font-bold text-[var(--text)]">
              {tTrial("resultTitle")}
            </h3>
            <div className="flex flex-wrap justify-center gap-3.5">
              <div className="min-w-[140px] flex-1">
                <StatCard
                  label={tTrial("measureTime")}
                  value={formatMeasuredTime(trialResult.elapsedSeconds)}
                />
              </div>
              <div className="min-w-[140px] flex-1">
                <StatCard
                  label={tTrial("warningCount")}
                  value={String(trialResult.warnCount)}
                  unit={tTrial("warningUnit")}
                />
              </div>
              <div className="min-w-[140px] flex-1">
                <StatCard
                  label={tTrial("avgAngle")}
                  value={trialResult.avgAngle.toFixed(1)}
                  unit={tTrial("angleUnit")}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <Button size="lg" variant="primary" onClick={handleStartClick}>
                {tTrial("retryButton")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 측정 시작 토스트 */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed left-1/2 top-[calc(var(--header-height)+24px)] z-[400] -translate-x-1/2 whitespace-nowrap rounded-[12px] bg-[var(--green-dark)] px-[18px] py-[11px] text-[13px] font-bold text-white shadow-[0_6px_24px_rgba(58,97,71,0.4)] transition-all duration-300 ${
          showStartToast ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        🐢 측정이 시작됩니다!
      </div>
    </div>
  );
}
