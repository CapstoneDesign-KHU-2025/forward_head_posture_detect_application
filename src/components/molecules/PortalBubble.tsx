"use client";

import { cn } from "@/utils/cn";

export type PortalBubblePlacement = "above" | "right" | "bottom" | "left";

export type PortalBubbleStep = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  extra?: React.ReactNode;
  hasBtn?: boolean;
  btnTxt?: string;
  targetId: string;
  placement: PortalBubblePlacement;
};

type PortalBubbleProps = {
  isVisible: boolean;
  currentStep: number;
  steps: PortalBubbleStep[];
  step: PortalBubbleStep;
  onAction?: () => void;
  onSkip?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export function PortalBubble({
  isVisible,
  currentStep,
  steps,
  step,
  onAction,
  onSkip,
  children,
  className,
}: PortalBubbleProps) {
  return (
    <div
      role="dialog"
      aria-labelledby="portal-bubble-title"
      aria-describedby="portal-bubble-desc"
      className={cn(
        "relative z-[9999] w-[268px] rounded-[18px] border border-[var(--green-border)] bg-white p-[18px_20px] shadow-[0_20px_56px_rgba(45,59,53,0.18),0_2px_8px_rgba(45,59,53,0.08)]",
        "transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        isVisible
          ? "pointer-events-auto scale-100 translate-y-0 opacity-100"
          : "pointer-events-none scale-90 translate-y-2.5 opacity-0",
        className,
      )}
    >
      {/* 스텝 인디케이터 */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--green-mid)]">
          STEP {currentStep + 1} / {steps.length}
        </span>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                i === currentStep
                  ? "w-4 rounded-[2px] bg-[var(--green)]"
                  : "bg-[var(--green-border)]",
              )}
            />
          ))}
        </div>
      </div>

      <span className="mb-1.5 block text-2xl" aria-hidden>
        {step.emoji}
      </span>
      <h3 id="portal-bubble-title" className="mb-1 font-[Nunito] text-base font-black text-[var(--text)]">
        {step.title}
      </h3>
      <div
        id="portal-bubble-desc"
        className="text-xs leading-relaxed text-[var(--text-sub)] [&_strong]:font-bold [&_strong]:text-[var(--green-dark)]"
        dangerouslySetInnerHTML={{ __html: step.desc }}
      />
      {step.extra && <div className="mt-3">{step.extra}</div>}
      {children}
      {step.hasBtn && (
        <div className="mt-3.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAction}
            className="flex-1 rounded-[9px] bg-[var(--green)] px-2 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--green-dark)]"
          >
            {step.btnTxt}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-none border-none bg-transparent px-0 py-0 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-sub)]"
          >
            건너뛰기
          </button>
        </div>
      )}
    </div>
  );
}
