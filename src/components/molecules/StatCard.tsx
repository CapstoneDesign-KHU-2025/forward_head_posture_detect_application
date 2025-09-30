import * as React from "react";
import { StatValue } from "@/components/atoms/kpi/StatValue";
import { UnitText } from "@/components/atoms/kpi/UnitText";
import { Badge } from "@/components/atoms/badge/Badge";

type StatCardProps = {
  /** 상단 라벨 (예: '평균 목 각도') */
  label: React.ReactNode;
  /** 핵심 값 (숫자/문자) */
  value: React.ReactNode;
  /** 단위 (예: '°', '%', '시간', '회') */
  unit?: React.ReactNode;

  /** 값 크기 */
  size?: "sm" | "md" | "lg" | "xl";

  /** 변화 배지 */
  delta?: "up" | "down";
  deltaText?: React.ReactNode;              // 예: '+1°', '-3%'
  deltaVariant?: "neutral" | "success" | "warning" | "danger";
  deltaPosition?: "start" | "end";

  /** 하단 보조 설명 (예: '오늘 기준', '어제와 비교') */
  caption?: React.ReactNode;

  /** 정렬 */
  align?: "left" | "center";

  /** 컨테이너 클래스 */
  className?: string;
};

/** StatCard: 라벨 + (값+단위) + 변화 배지 + 보조설명 */
export default function StatCard({
  label,
  value,
  unit,
  size = "lg",
  delta,
  deltaText,
  deltaVariant = "neutral",
  deltaPosition = "start",
  caption,
  align = "left",
  className,
}: StatCardProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div
      className={[
        "rounded-lg border border-black/10 bg-white p-4",
        "flex flex-col gap-2",
        alignClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 헤더: 라벨 + (선택) 변화 배지 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-black/70">{label}</span>
        {delta && deltaText ? (
          <Badge
            variant={deltaVariant}
            size="sm"
            delta={delta}
            deltaPosition={deltaPosition}
          >
            {deltaText}
          </Badge>
        ) : null}
      </div>

      {/* 본문: 값 + 단위 */}
      <div className="flex items-baseline gap-2">
        <StatValue size={size}>{value}</StatValue>
        {unit ? <UnitText size={size === "xl" ? "md" : "sm"}>{unit}</UnitText> : null}
      </div>

      {/* 푸터: 보조 설명 */}
      {caption ? <div className="text-xs text-black/50">{caption}</div> : null}
    </div>
  );
}