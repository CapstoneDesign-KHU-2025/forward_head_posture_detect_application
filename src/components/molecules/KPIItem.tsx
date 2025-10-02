import * as React from "react";
import { StatValue } from "@/components/atoms/kpi/StatValue";
import { UnitText } from "@/components/atoms/kpi/UnitText";
import { Badge } from "@/components/atoms/badge/Badge";

type KPIItemProps = {
  /** 상단 라벨 (예: '평균 각도', '개선 정도') */
  label: React.ReactNode;
  /** 지표 값 (숫자/문자) */
  value: React.ReactNode;
  /** 단위 (예: '°', '%', '시간', '회') */
  unit?: React.ReactNode;

  /** 값 크기 */
  size?: "sm" | "md" | "lg" | "xl";

  /** 보조 캡션 (예: '어제보다') */
  caption?: React.ReactNode;

  /** 증감 배지 옵션 */
  delta?: "up" | "down";
  deltaText?: React.ReactNode; // 예: '+1°', '-3%'
  deltaVariant?: "neutral" | "success" | "warning" | "danger";
  deltaPosition?: "start" | "end";

  /** 외부 컨테이너 클래스 */
  className?: string;
};

/**
 * KPIItem: 라벨 + (값 + 단위) + 선택 배지/캡션
 * Surface 없이도 바로 쓰기 쉽게 여백/정렬만 가볍게 포함.
 */
export default function KPIItem({
  label,
  value,
  unit,
  size = "lg",
  caption,
  delta,
  deltaText,
  deltaVariant = "neutral",
  deltaPosition = "start",
  className,
}: KPIItemProps) {
  return (
    <div className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}>
      {/* 상단 라벨 + (선택) 배지 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-black/70">{label}</span>
        {delta && deltaText && (
          <Badge
            variant={deltaVariant}
            size="sm"
            delta={delta}
            deltaPosition={deltaPosition}
          >
            {deltaText}
          </Badge>
        )}
      </div>

      {/* 값 + 단위 */}
      <div className="flex items-baseline gap-2">
        <StatValue size={size}>{value}</StatValue>
        {unit ? <UnitText size={size === "xl" ? "md" : "sm"}>{unit}</UnitText> : null}
      </div>

      {/* (선택) 하단 캡션 */}
      {caption ? (
        <div className="text-xs text-black/50">{caption}</div>
      ) : null}
    </div>
  );
}