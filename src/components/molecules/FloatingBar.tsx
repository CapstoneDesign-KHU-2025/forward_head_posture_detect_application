"use client";

import { cn } from "@/utils/cn";

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export type FloatingBarProps = {
  /** 표시 여부 (true면 슬라이드 업) */
  visible: boolean;
  /** 제목 (예: "측정 중") */
  title?: string;
  /** 경과 시간 (초) */
  elapsedSeconds?: number;
  /** 중단 버튼 클릭 시 */
  onStop?: () => void;
  className?: string;
};

export function FloatingBar({
  visible,
  title = "측정 중",
  elapsedSeconds = 0,
  onStop,
  className,
}: FloatingBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-[200] flex w-[min(480px,calc(100vw-32px))] items-center gap-3.5 rounded-[20px] border border-white/[0.08] bg-[#2d3b35] px-5 py-3.5 shadow-[0_8px_32px_rgba(45,59,53,0.35)] transition-transform duration-[400ms]",
        visible ? "translate-x-[-50%] translate-y-0" : "translate-x-[-50%] translate-y-[80px]",
        className
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      <div className="h-2.5 w-2.5 flex-shrink-0 animate-pulse-dot rounded-full bg-[#ff5c5c]" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-white">{title}</div>
        <div className="text-[11px] text-white/50">{formatElapsed(elapsedSeconds)} 경과</div>
      </div>
      <button
        type="button"
        onClick={onStop}
        className="flex-shrink-0 whitespace-nowrap rounded-[10px] border border-[rgba(255,92,92,0.25)] bg-[rgba(255,92,92,0.15)] px-3.5 py-1.5 text-xs font-bold text-[#ff8c8c] transition-colors hover:bg-[rgba(255,92,92,0.28)]"
      >
        중단
      </button>
    </div>
  );
}
