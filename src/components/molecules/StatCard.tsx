type StatCardProps = {
  /** 상단 라벨 (예: '측정 시간') */
  label: React.ReactNode;
  /** 핵심 값 (숫자/문자) */
  value: string;
  /** 단위 (예: '°', '%', '시간', '회') */
  unit?: React.ReactNode;

  /** 하단 보조 텍스트 (예: '측정 중 아님', '오늘 기준') */
  subtitle?: React.ReactNode;

  /** 하단 보조 텍스트 왼쪽에 작은 상태 점 표시 여부 */
  showStatusDot?: boolean;

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
  subtitle,
  showStatusDot = false,
  className,
  valueClassName = "font-[900] text-[1.7rem] leading-none text-[var(--green)]",
}: StatCardProps) {
  return (
    <div
      className={[
        "flex flex-col items-start text-left",
        "rounded-[18px] bg-white px-[18px] py-[14px]",
        "shadow-[0_4px_20px_rgba(74,124,89,0.12)]",

        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 라벨 */}
      <div className="mb-[6px]">
        <span className="text-[11px] font-bold tracking-[0.03em] text-[var(--text-muted)]">
          {label}
        </span>
      </div>

      {/* 값 + 단위 */}
      <div className="flex items-baseline gap-1">
        <span className={valueClassName}>{value}</span>
        {unit ? (
          <span className="text-[13px] text-[var(--text-sub)] ml-[2px]">{unit}</span>
        ) : null}
      </div>

      {/* 보조 텍스트 + 상태 점 */}
      {subtitle ? (
        <div className="mt-[5px] text-[11px] text-[var(--text-muted)] flex items-center gap-[5px]">
          {showStatusDot && (
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#ccc]" />
          )}
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}
