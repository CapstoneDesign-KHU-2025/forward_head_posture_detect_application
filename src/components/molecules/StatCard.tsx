import { cn } from "@/utils/cn";

type StatCardProps = {
  /** 상단 라벨 (예: '측정 시간', '오늘 경고 횟수') */
  label: React.ReactNode;
  /** 핵심 값 (숫자/문자) */
  value: string;
  /** 단위 (예: '°', '%', '회') */
  unit?: React.ReactNode;
  /** 서브 텍스트 (예: '측정 중 아님', '오늘 기준') */
  caption?: React.ReactNode;
  /** 측정 중이면 true → 빨간 라이브 도트, false면 회색 도트 (caption과 함께 사용) */
  isLive?: boolean;
  /** caption 옆에 도트 표시 여부 (기본 true, 경고 횟수 카드 등에서는 false) */
  showCaptionDot?: boolean;
  className?: string;
};

/** StatCard: HTML 시안 .stat-card — 라벨 + 값+단위 + 선택적 서브(도트+캡션) */
export default function StatCard({
  label,
  value,
  unit,
  caption,
  isLive = false,
  showCaptionDot = true,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex-1 rounded-[18px] bg-white px-[18px] py-3.5 shadow-[0_4px_20px_rgba(74,124,89,0.12)]",
        "flex flex-col",
        className
      )}
    >
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#aac8b2]">
        {label}
      </div>
      <div className="flex items-baseline">
        <span
          className="text-[1.7rem] font-extrabold leading-none text-[#4a7c59]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {value}
        </span>
        {unit != null && unit !== "" ? (
          <span className="ml-0.5 text-[13px] text-[#7a9585]">{unit}</span>
        ) : null}
      </div>
      {caption != null && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#aac8b2]">
          {showCaptionDot && (
            <span
              className={cn(
                "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                isLive ? "bg-[#ff5c5c] animate-pulse-dot" : "bg-[#ccc]"
              )}
            />
          )}
          <span>{caption}</span>
        </div>
      )}
    </div>
  );
}
