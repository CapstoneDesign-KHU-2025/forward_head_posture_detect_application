"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

export type HourlyStat = {
  /** 라벨 (예: '09시') */
  label: string;
  /** 해당 시간대 평균 각도 (deg) */
  avg: number;
};

type AverageTabsCardProps = {
  /** 시간대별 평균 각도 리스트 (없으면 시간별 탭은 비워둠) */
  hourlyStats?: HourlyStat[];
  /** 오늘 지금까지/누적 평균 각도 (deg) */
  todayAvg?: number | null;
  /** 이상적인 목 각도 (기본값: 52°) */
  idealAngle?: number;
  className?: string;
};

export default function AverageTabsCard({
  hourlyStats = [],
  todayAvg = null,
  idealAngle = 52,
  className,
}: AverageTabsCardProps) {
  const [activeTab, setActiveTab] = useState<"hourly" | "cumul">("hourly");

  const hasHourly = hourlyStats.length > 0;
  const hasTodayAvg = todayAvg != null;

  const delta = hasTodayAvg ? (todayAvg as number) - idealAngle : null;

  return (
    <section
      className={cn(
        "flex flex-col rounded-[18px] bg-white shadow-[0_4px_20px_rgba(74,124,89,0.12)]",
        className,
      )}
    >
      {/* 탭 헤더 */}
      <div className="flex border-b border-[#d4ead9] px-4 pt-3">
        <button
          type="button"
          className={cn(
            "avg-tab px-4 pb-2 text-[13px] font-bold",
            "relative cursor-pointer transition-colors",
            activeTab === "hourly" ? "text-[#4a7c59]" : "text-[#aac8b2]",
          )}
          onClick={() => setActiveTab("hourly")}
        >
          시간별 평균
          {activeTab === "hourly" && (
            <span className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] rounded-[2px] bg-[#4a7c59]" />
          )}
        </button>
        <button
          type="button"
          className={cn(
            "avg-tab px-4 pb-2 text-[13px] font-bold",
            "relative cursor-pointer transition-colors",
            activeTab === "cumul" ? "text-[#4a7c59]" : "text-[#aac8b2]",
          )}
          onClick={() => setActiveTab("cumul")}
        >
          누적 평균
          {activeTab === "cumul" && (
            <span className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] rounded-[2px] bg-[#4a7c59]" />
          )}
        </button>
      </div>

      {/* 본문: 두 탭 모두 동일 세로 높이 */}
      <div className="avg-body flex h-[160px] flex-col px-4 py-3">
        {activeTab === "hourly" ? (
          <HourlyBody hourlyStats={hourlyStats} />
        ) : (
          <CumulativeBody todayAvg={todayAvg} idealAngle={idealAngle} />
        )}
      </div>
    </section>
  );
}

function HourlyBody({ hourlyStats }: { hourlyStats: HourlyStat[] }) {
  if (!hourlyStats.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-[12px] text-[#aac8b2]">
        아직 시간대별 데이터가 없습니다.
      </div>
    );
  }

  // 막대 길이 비율 계산을 위한 기준값 (절대값 기준: 90°를 풀게이지로)
  const maxAvg = 90;
  const WARN_THRESHOLD = 60;

  return (
    <div className="hourly-list flex flex-1 flex-col justify-around gap-2">
      {hourlyStats.map((h) => {
        const rounded = Math.round(h.avg);
        const ratio = h.avg / maxAvg;
        const isWarn = rounded >= WARN_THRESHOLD;

        return (
          <div key={h.label} className="hourly-item flex items-center gap-2">
            <span className="hourly-time w-9 text-right text-[11px] text-[#aac8b2]">{h.label}</span>
            <div className="hourly-bar-bg flex-1 h-2 overflow-hidden rounded-[4px] bg-[#e8f5ec]">
              <div
                className={cn(
                  "hourly-bar-fill h-full rounded-[4px] bg-gradient-to-r from-[#6aab7a] to-[#4a7c59]",
                  isWarn && "from-[#ff9966] to-[#ff6b6b]",
                )}
                style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }}
              />
            </div>
            <span
              className={cn(
                "hourly-val w-[32px] text-[12px] font-bold",
                isWarn ? "text-[#e05030]" : "text-[#4a7c59]",
              )}
            >
              {rounded}°
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CumulativeBody({ todayAvg, idealAngle }: { todayAvg?: number | null; idealAngle: number }) {
  if (todayAvg == null) {
    return (
      <div className="flex flex-1 items-center justify-center text-[12px] text-[#aac8b2]">
        아직 누적 평균 데이터가 없습니다.
      </div>
    );
  }

  const delta = todayAvg - idealAngle;
  const deltaSign = delta >= 0 ? "+" : "-";

  return (
    <div className="cumul-body flex flex-1 flex-col items-center justify-center gap-1">
      <div className="text-center">
        <div>
          <span
            className="cumul-num text-[3rem] font-extrabold text-[#4a7c59]"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {todayAvg.toFixed(1)}
          </span>
          <span className="cumul-unit text-[16px] text-[#7a9585]">°</span>
        </div>
        <div className="cumul-label mt-1 text-[12px] text-[#aac8b2]">오늘 누적 평균 목 각도</div>
        <div className="cumul-ideal mt-1 text-[12px] font-semibold text-[#6aab7a]">
          ✓ ideal {idealAngle.toFixed(0)}° · Δ {deltaSign}
          {Math.abs(delta).toFixed(1)}°
        </div>
      </div>
    </div>
  );
}

