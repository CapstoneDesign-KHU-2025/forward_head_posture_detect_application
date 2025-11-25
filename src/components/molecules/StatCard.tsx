import * as React from "react";

type StatCardProps = {
  /** 상단 라벨 (예: '측정 시간') */
  label: React.ReactNode;
  /** 핵심 값 (숫자/문자) */
  value: string;
  /** 단위 (예: '°', '%', '시간', '회') */
  unit?: React.ReactNode;

  /** 컨테이너 클래스 */
  className?: string;
  /** 값(value) 부분에 적용할 추가 클래스 (기본값: text-base font-bold) */
  valueClassName?: string;
};

/** StatCard: 라벨 + (값+단위) */
export default function StatCard({
  label,
  value,
  unit,
  className,
  valueClassName = "text-xl font-bold",
}: StatCardProps) {
  return (
    <div
      className={[
        "rounded-xl bg-white p-6",
        "flex flex-col gap-1.5",
        "border-l-4 border-[#7BC67E]",
        "shadow-[0_2px_10px_rgba(0,0,0,0.05)]",
        "transition-all duration-300",
        "hover:shadow-[0_4px_20px_rgba(45,95,46,0.15)] hover:translate-x-1",
        "items-start text-left",

        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 헤더: 라벨 */}
      <div>
        <span className="text-[0.9rem] font-medium text-[#4F4F4F]">{label}</span>
      </div>

      {/* 본문: 값 + 단위 */}
      <div className="flex items-baseline gap-1">
        <span className={valueClassName}>{value}</span>
        {unit ? <span className="text-sm text-[#4F4F4F]">{unit}</span> : null}
      </div>
    </div>
  );
}
