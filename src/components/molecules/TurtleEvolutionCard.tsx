"use client";

import { Card } from "@/components/atoms/Card";
import EvolutionTooltip from "@/components/molecules/EvolutionTooltip";
import { cn } from "@/utils/cn";

type TurtleEvolutionCardProps = {
  goodDays: number;
};

const STAGES = [
  { emoji: "🥚", label: "알에서 깬 거북이" },
  { emoji: "🐣", label: "아기 거북이" },
  { emoji: "🐢", label: "성인 거북이" },
  { emoji: "👑", label: "거북왕" },
] as const;

const DAYS_PER_STAGE = 10;

export default function TurtleEvolutionCard({ goodDays }: TurtleEvolutionCardProps) {
  const currentStageIndex = Math.min(3, Math.floor(goodDays / DAYS_PER_STAGE));
  const daysInCurrentStage = goodDays % DAYS_PER_STAGE;
  const daysToNext = currentStageIndex >= 3 ? 0 : DAYS_PER_STAGE - daysInCurrentStage;
  const currentStage = STAGES[currentStageIndex];

  return (
    <Card className="flex flex-1 min-h-0 flex-col px-6 py-4">
      {/* 헤더: 제목 + 툴팁 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <h2
          className="text-[18px] font-extrabold text-[var(--text)]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          거북이 진화
        </h2>
        <EvolutionTooltip text="경고 10회 이하인 날 10일마다 진화!" />
      </div>

      {/* 배지 + 스텝 + 진행 문구 */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2.5 py-2">
        <div className="flex-1 min-w-0" aria-hidden />
        {/* 가운데 이모지 (좌우로 살짝 흔들림) */}
        <div className="flex items-center justify-center text-[100px] leading-none animate-rotate-slow">
          {currentStage.emoji}
        </div>
        <div className="flex-1 min-w-0" aria-hidden />
        {/* 스텝 인디케이터: 🥚 ─ 🐣 ─ 🐢 ─ 👑 */}
        <div className="flex items-center gap-0 flex-shrink-0">
          {STAGES.map((stage, i) => {
            const isActive = i === currentStageIndex;
            const isLocked = i > currentStageIndex;
            const progressPct = i < currentStageIndex ? 100 : i === currentStageIndex ? (daysInCurrentStage / DAYS_PER_STAGE) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-base border-2 transition-all",
                    isActive &&
                      "bg-[var(--green)] border-[var(--green)] text-white",
                    isLocked && "opacity-35 grayscale bg-[var(--green-light)] border-[var(--green-border)]",
                    !isActive && !isLocked &&
                      "bg-[var(--green-light)] border-[var(--green-border)]"
                  )}
                  style={
                    isActive
                      ? { boxShadow: "0 4px 10px rgba(74,124,89,0.35)" }
                      : undefined
                  }
                  title={stage.label}
                >
                  {stage.emoji}
                </div>
                {i < STAGES.length - 1 && (
                  <div className="w-10 h-1 bg-[var(--green-border)] rounded overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded bg-[var(--green)] transition-all duration-300"
                      style={{
                        width: `${progressPct}%`,
                        background:
                          progressPct > 0
                            ? "linear-gradient(90deg, var(--green-mid), var(--green))"
                            : undefined,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {currentStageIndex < 3 && (
          <p className="text-[12px] font-semibold text-[var(--text-muted)] mt-2 flex-shrink-0">
            다음 단계까지 <strong className="text-[var(--green)]">{daysToNext}일</strong> 남았어요! · {daysInCurrentStage} / {DAYS_PER_STAGE}일
          </p>
        )}
      </div>
    </Card>
  );
}
