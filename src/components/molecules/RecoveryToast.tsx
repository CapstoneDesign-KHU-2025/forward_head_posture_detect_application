"use client";

import { cn } from "@/utils/cn";

type RecoveryToastProps = {
  isVisible: boolean;
  onRestart: () => void;
  onDismiss: () => void;
  className?: string;
};

export function RecoveryToast({ isVisible, onRestart, onDismiss, className }: RecoveryToastProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2",
        "flex flex-col items-center gap-3 rounded-[20px] bg-[#2d3b35] px-5 py-4 shadow-[0_8px_32px_rgba(45,59,53,0.35)]",
        "transition-all duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0 pointer-events-none",
        className
      )}
    >
      <p className="text-[14px] font-medium text-white">
        이전 측정이 중단되었습니다. 다시 시작하시겠습니까?
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-[10px] bg-[#4a7c59] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#5a8d69]"
        >
          다시 시작
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-[10px] border border-white/30 bg-transparent px-4 py-2 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
