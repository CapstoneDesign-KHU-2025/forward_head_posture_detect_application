import * as React from "react";
import StatCard from "@/components/molecules/StatCard";
import { Skeleton } from "@/components/atoms/loading/Skeleton";

type KPIItem = {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  delta?: "up" | "down";
  deltaText?: React.ReactNode;
  deltaVariant?: "neutral" | "success" | "warning" | "danger";
  deltaPosition?: "start" | "end";
  caption?: React.ReactNode;
};

type KPISectionProps = {
  title?: React.ReactNode;
  items?: KPIItem[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;

  /** 제목 아래에 표시할 버튼/링크 묶음 */
  actions?: React.ReactNode;
  /** 헤더 정렬 */
  align?: "left" | "center";
};

export default function KPISection({
  title = "오늘의 거북목",
  items = [],
  loading = false,
  skeletonCount = 4,
  className,
  actions,
  align = "left",
}: KPISectionProps) {
  const alignCls =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section className={["w-full", className].filter(Boolean).join(" ")}>
      <div className="mx-auto max-w-6xl px-4">
        {(title || actions) && (
          <div className={["flex flex-col", alignCls].join(" ")}>
            {title ? (
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            ) : null}
            {actions ? (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {actions}
              </div>
            ) : null}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-black/10 bg-white p-4"
              >
                <Skeleton variant="text" width="40%" className="mb-3" />
                <Skeleton variant="text" width="30%" className="mb-1" />
                <Skeleton variant="text" width="20%" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {items.map((it, idx) => (
              <StatCard key={idx} {...it} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}