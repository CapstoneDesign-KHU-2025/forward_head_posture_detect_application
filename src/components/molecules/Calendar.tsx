"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const MONTHS_KO = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type DayStatus = "good" | "bad";

export type CalendarProps = {
  /** 날짜별 상태 (YYYY-MM-DD) */
  dayStatusMap?: Record<string, DayStatus>;
  /** 날짜 클릭 시 */
  onDayClick?: (date: Date) => void;
  className?: string;
};

export function Calendar({ dayStatusMap = {}, onDayClick, className }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const moveMonth = (dir: number) => {
    setViewMonth((prev) => {
      const next = prev + dir;
      if (next > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      if (next < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return next;
    });
  };

  const gridDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    // 이전 달 날짜
    for (let i = 0; i < firstDay; i++) {
      const d = prevMonthDays - firstDay + i + 1;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(prevYear, prevMonth, d),
      });
    }

    // 현재 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(viewYear, viewMonth, i),
      });
    }

    // 다음 달 날짜 (그리드 채우기)
    const total = days.length;
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextYear, nextMonth, i),
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const getDayStatus = (date: Date, isCurrentMonth: boolean): DayStatus | null => {
    if (!isCurrentMonth) return null;
    const key = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    return dayStatusMap[key] ?? null;
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card className={cn("flex h-[270px] flex-shrink-0 flex-col p-[18px] pb-3.5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <div
          className="font-extrabold text-[#2d3b35]"
          style={{ fontFamily: "Nunito, sans-serif", fontSize: "15px" }}
        >
          {MONTHS_KO[viewMonth]} {viewYear}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#e8f5ec] font-bold text-[#4a7c59] transition-colors hover:bg-[#d4ead9]"
            aria-label="이전 달"
          >
            <ChevronLeft size={12} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#e8f5ec] font-bold text-[#4a7c59] transition-colors hover:bg-[#d4ead9]"
            aria-label="다음 달"
          >
            <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-[3px]">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center justify-center py-0.5 text-[9px] font-bold",
              i === 0 && "text-[#e05030]",
              i !== 0 && "text-[#aac8b2]"
            )}
          >
            {label}
          </div>
        ))}
        {gridDays.map(({ day, isCurrentMonth, date }, idx) => {
          const status = getDayStatus(date, isCurrentMonth);
          const todayClass = isToday(date);
          return (
            <button
              key={`${date.toISOString()}-${idx}`}
              type="button"
              onClick={() => onDayClick?.(date)}
              className={cn(
                "flex items-center justify-center rounded-md text-[11px] font-semibold transition-colors",
                !isCurrentMonth && "text-[#aac8b2] opacity-40",
                isCurrentMonth && "text-[#2d3b35] hover:bg-[#e8f5ec]",
                todayClass && "rounded-lg bg-[#4a7c59] font-extrabold text-white",
                !todayClass && status === "good" && "bg-[#d6f0df] text-[#3a6147] font-bold",
                !todayClass && status === "bad" && "bg-[#fde0d8] text-[#c03020] font-bold"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-3 border-t border-[#d4ead9] pt-2">
        <div className="flex items-center gap-1 text-[10px] text-[#aac8b2]">
          <div className="h-2.5 w-2.5 rounded-[3px] bg-[#d6f0df]" />
          양호한 날
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#aac8b2]">
          <div className="h-2.5 w-2.5 rounded-[3px] bg-[#fde0d8]" />
          경고 많은 날
        </div>
      </div>
    </Card>
  );
}
