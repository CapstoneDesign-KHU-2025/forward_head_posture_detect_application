"use client";

type EvolutionTooltipProps = {
  /** 툴팁에 표시할 문구 */
  text: string;
  /** 버튼 접근성 라벨 */
  ariaLabel?: string;
};

export default function EvolutionTooltip({ text, ariaLabel = "진화 조건 안내" }: EvolutionTooltipProps) {
  return (
    <div className="group relative inline-flex items-center self-center">
      <div
        className="w-4 h-4 rounded-full bg-[var(--green-light)] text-[var(--green)] text-[10px] font-extrabold flex items-center justify-center cursor-default border border-[var(--green-border)]"
        aria-label={ariaLabel}
      >
        ?
      </div>
      <div
        className="hidden group-hover:block absolute left-[22px] top-1/2 -translate-y-1/2 bg-[var(--green-dark)] text-white text-[11px] font-medium py-[6px] px-[10px] rounded-lg whitespace-nowrap z-10 pointer-events-none"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        role="tooltip"
      >
        {text}
        <span
          className="absolute -left-[5px] top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[var(--green-dark)] border-l-0"
          aria-hidden
        />
      </div>
    </div>
  );
}
