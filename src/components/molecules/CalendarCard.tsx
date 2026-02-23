"use client";

import { useMemo } from "react";
import { cn } from "@/utils/cn";

type DayStatus = "good" | "bad" | null;

type CalendarCardProps = {
  // 해당 월의 날짜별 상태 (good일 때 점 표시)
  dayStatusMap?: Record<number, DayStatus>;
  className?: string;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarCard({ dayStatusMap = {}, className }: CalendarCardProps) {
  const viewDate = useMemo(() => new Date(), []);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { firstDay, daysInMonth, prevMonthDays } = useMemo(() => {
    const first = new Date(year, month, 1);
    const firstDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLast = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: firstDay }, (_, i) => prevMonthLast - firstDay + i + 1);
    return { firstDay, daysInMonth, prevMonthDays };
  }, [year, month]);

  const monthLabel = `${month + 1}월`;

  return (
    <div
      className={cn(
        "rounded-[18px] bg-white shadow-[0_4px_20px_rgba(74,124,89,0.12)]",
        "flex flex-col p-[18px] pb-3.5 min-h-[270px]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-extrabold text-sm text-[#2d3b35]" style={{ fontFamily: "Nunito, sans-serif" }}>
          📅 캘린더
        </div>
        <div className="text-xs font-semibold text-[#7a9585]">{monthLabel}</div>
      </div>

      <div className="grid grid-cols-7 gap-px flex-1 min-h-0">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-[9px] font-bold py-0.5",
              i === 0 ? "text-[#e05030]" : i === 6 ? "text-[#6b9fff]" : "text-[#aac8b2]"
            )}
          >
            {day}
          </div>
        ))}
        {prevMonthDays.map((d) => (
          <div key={`p-${d}`} className="text-center text-[11px] py-1 text-[#aac8b2] font-medium rounded-md">
            {d}
          </div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const isToday =
            viewDate.getFullYear() === new Date().getFullYear() &&
            viewDate.getMonth() === new Date().getMonth() &&
            d === new Date().getDate();
          const status = dayStatusMap[d] ?? null;
          return (
            <div
              key={d}
              className={cn(
                "text-center text-[11px] py-1 rounded-md font-medium cursor-pointer transition-colors relative",
                "hover:bg-[#e8f5ec]",
                isToday && "bg-[#4a7c59] text-white font-bold",
                !isToday && status === "good" && "text-[#4a7c59] font-bold",
                !isToday && "text-[#2d3b35]"
              )}
            >
              {d}
              {!isToday && status && (
                <span
                  className={cn(
                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full",
                    status === "good" && "bg-[#6aab7a]",
                    status === "bad" && "bg-[#ff8c6b]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-2 pt-2 border-t border-[#d4ead9]">
        <div className="flex items-center gap-1 text-[10px] text-[#aac8b2]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6aab7a]" />
          양호한 날
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#aac8b2]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c6b]" />
          경고 많은 날
        </div>
      </div>
    </div>
  );
}
