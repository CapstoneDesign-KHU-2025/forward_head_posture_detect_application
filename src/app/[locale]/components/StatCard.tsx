type StatCardProps = {
  label: React.ReactNode;
  value: string;
  unit?: React.ReactNode;
  subtitle?: React.ReactNode;
  showStatusDot?: boolean;
  statusDotVariant?: "idle" | "measuring";
  className?: string;
  valueClassName?: string;
};

import { Card } from "@/components/Card";

export default function StatCard({
  label,
  value,
  unit,
  subtitle,
  showStatusDot = false,
  statusDotVariant = "idle",
  className,
  valueClassName = "font-[900] text-[27px] leading-none text-[var(--green)]",
}: StatCardProps) {
  return (
    <Card
      className={["flex flex-col items-start text-left", "px-[18px] py-[14px]", className].filter(Boolean).join(" ")}
    >
      <div className="mb-[5px]">
        <span className="text-[12px] font-bold tracking-[0.03em] text-[var(--text-muted)]">{label}</span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={valueClassName}>{value}</span>
        {unit ? <span className="text-[14px] text-[var(--text-sub)] ml-[2px]">{unit}</span> : null}
      </div>

      {subtitle ? (
        <div className="mt-[5px] text-[12px] font-semibold text-[var(--text-muted)] flex items-center gap-[5px]">
          {showStatusDot && (
            <span
              className={
                statusDotVariant === "measuring"
                  ? "inline-block h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#ff5c5c] animate-pulse-dot"
                  : "inline-block h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#ccc]"
              }
            />
          )}
          {subtitle}
        </div>
      ) : null}
    </Card>
  );
}
