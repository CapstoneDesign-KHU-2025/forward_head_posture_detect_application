"use client";

import { cn } from "@/utils/cn";

type TurtleEvolutionCardProps = {
  /** 누적 좋은 날 수 (경고 10회 이하인 날) */
  goodDays: number;
  /** 한 단계 진화에 필요한 좋은 날 수 (기본 10일) */
  targetDays?: number;
  className?: string;
};

function getStageLabelFromGoodDays(goodDays: number): string {
  if (goodDays <= 10) return "거북이 단계";
  if (goodDays <= 20) return "기린 목 지망생";
  return "자세왕";
}

function getStageEmojiFromGoodDays(goodDays: number): string {
  if (goodDays <= 10) return "🐢";
  if (goodDays <= 20) return "🦒";
  return "👑";
}

type EvolutionProgressBarProps = {
  current: number;
  max: number;
};

function EvolutionProgressBar({ current, max }: EvolutionProgressBarProps) {
  const ratio = max > 0 ? Math.min(current / max, 1) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-[#7a9585]">
        <span>다음 단계까지 {Math.max(max - current, 0)}일 남았어요!</span>
        <span className="font-semibold text-[#4a7c59]">
          {current} / {max}일
        </span>
      </div>
      <div className="h-[7px] w-full rounded-full bg-[#e8f5ec] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6aab7a] to-[#4a7c59] transition-all duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function TurtleEvolutionCard({ goodDays, targetDays = 10, className }: TurtleEvolutionCardProps) {
  const currentCycle = Math.min(goodDays, targetDays);
  const daysRemaining = Math.max(targetDays - currentCycle, 0);

  const stageLabel = getStageLabelFromGoodDays(goodDays);
  const stageEmoji = getStageEmojiFromGoodDays(goodDays);

  return (
    <section
      className={cn(
        "rounded-[18px] bg-white shadow-[0_4px_20px_rgba(74,124,89,0.12)]",
        "px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-3.5 min-h-0",
        className,
      )}
    >
      {/* 헤더 */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#2d3b35]">
          <span>🏆</span>
          <span style={{ fontFamily: "Nunito, sans-serif" }}>거북이 진화</span>
        </div>
        <p className="text-[11px] text-[#aac8b2]">경고 10회 이하인 날 10일마다 진화!</p>
      </header>

      {/* 중앙 배지 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-3">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#4a7c59] shadow-[0_8px_24px_rgba(74,124,89,0.3)]">
          <span className="text-[40px]">{stageEmoji}</span>
        </div>
        <div
          className="text-[16px] font-extrabold text-[#4a7c59]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {stageLabel}
        </div>
      </div>

      {/* 진행도 */}
      <div className="mt-1">
        <EvolutionProgressBar current={currentCycle} max={targetDays} />
      </div>
    </section>
  );
}

