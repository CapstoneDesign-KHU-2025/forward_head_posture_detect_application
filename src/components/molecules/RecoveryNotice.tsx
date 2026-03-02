"use client";

import { cn } from "@/utils/cn";

type RecoveryNoticeProps = {
  isVisible: boolean;
  onRestart: () => void;
  onDismiss: () => void;
  className?: string;
};

export function RecoveryNotice({ isVisible, onRestart, onDismiss, className }: RecoveryNoticeProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2",
        "flex items-center gap-4 rounded-[20px] bg-[rgba(45,59,53,0.92)] backdrop-blur-sm px-6 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] w-[min(480px,calc(100vw-32px))]",
        "transition-all duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="text-[28px] shrink-0" aria-hidden>
          🐢
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-[16px] font-bold text-white">이전 측정이 중단됐어요</p>
          <p className="text-[14px] font-semibold text-white/70">다시 시작할까요?</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-[10px] border border-white/30 bg-white/10 px-4 py-2 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/20"
        >
          괜찮아요
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-[10px] bg-[#4a7c59] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#5a8d69]"
        >
          다시 시작
        </button>
      </div>
    </div>
  );
}
