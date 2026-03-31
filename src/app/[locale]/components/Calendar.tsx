"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/Card";
import { IconButton } from "@/components/IconButton";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import { DayStatus } from "@/utils/types";

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type CalendarProps = {
  dayStatusMap?: Record<string, DayStatus>;
  className?: string;
};

export function Calendar({ dayStatusMap = {}, className }: CalendarProps) {
  const t = useTranslations("Calendar");

  const MONTHS_KO = [
    t("month.1"),
    t("month.2"),
    t("month.3"),
    t("month.4"),
    t("month.5"),
    t("month.6"),
    t("month.7"),
    t("month.8"),
    t("month.9"),
    t("month.10"),
    t("month.11"),
    t("month.12"),
  ];

  const DAY_LABELS = [t("day.1"), t("day.2"), t("day.3"), t("day.4"), t("day.5"), t("day.6"), t("day.7")];
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const moveMonth = (dir: number) => {
    setViewDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + dir, 1);
      return next;
    });
  };

  const gridDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const days: { day: number; isCurrentMonth: boolean; date: Date; key: string }[] = [];

    const push = (year: number, month: number, day: number, isCurrentMonth: boolean) => {
      const date = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth,
        date,
        key: formatDateKey(year, month, day),
      });
    };

    // previous month's dates
    for (let i = 0; i < firstDay; i++) {
      const d = prevMonthDays - firstDay + i + 1;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      push(prevYear, prevMonth, d, false);
    }

    // current month's dates
    for (let i = 1; i <= daysInMonth; i++) {
      push(viewYear, viewMonth, i, true);
    }

    // next month's dates
    const total = days.length;
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    for (let i = 1; i <= remaining; i++) {
      push(nextYear, nextMonth, i, false);
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
        <div className="font-extrabold text-[#2d3b35]" style={{ fontFamily: "Nunito, sans-serif", fontSize: "15px" }}>
          {MONTHS_KO[viewMonth]} {viewYear}
        </div>
        <div className="flex gap-1">
          <IconButton
            variant="calendar"
            size="xs"
            icon={<ChevronLeft size={12} strokeWidth={2.5} />}
            ariaLabel={t("buttons.previous")}
            onClick={() => moveMonth(-1)}
          />
          <IconButton
            variant="calendar"
            size="xs"
            icon={<ChevronRight size={12} strokeWidth={2.5} />}
            ariaLabel={t("buttons.next")}
            onClick={() => moveMonth(1)}
          />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-[3px]">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center justify-center py-0.5 text-[9px] font-bold",
              i === 0 && "text-[#e05030]",
              i !== 0 && "text-[#aac8b2]",
            )}
          >
            {label}
          </div>
        ))}
        {gridDays.map(({ day, isCurrentMonth, date, key }) => {
          const status = getDayStatus(date, isCurrentMonth);
          const todayClass = isToday(date);
          return (
            <div
              key={key}
              className={cn(
                "flex items-center justify-center rounded-md text-[11px] font-semibold transition-colors",
                !isCurrentMonth && "text-[#aac8b2] opacity-40",
                isCurrentMonth && "text-[#2d3b35]",
                todayClass && "rounded-lg bg-[#4a7c59] font-extrabold text-white",
                !todayClass && status === "good" && "bg-[#d6f0df] text-[#3a6147] font-bold",
                !todayClass && status === "bad" && "bg-[#fde0d8] text-[#c03020] font-bold",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-3 border-t border-[#d4ead9] pt-2">
        <div className="flex items-center gap-1 text-[10px] text-[#aac8b2]">
          <div className="h-2.5 w-2.5 rounded-[3px] bg-[#d6f0df]" />
          {t("good")}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#aac8b2]">
          <div className="h-2.5 w-2.5 rounded-[3px] bg-[#fde0d8]" />
          {t("bad")}
        </div>
      </div>
    </Card>
  );
}
