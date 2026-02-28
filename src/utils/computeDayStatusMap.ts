import type { DayStatus } from "@/components/molecules/Calendar";

/** 캘린더 날짜별 상태 판정 기준 (초) */
const MIN_MEASURE_SECONDS = 300; // 5분
/** 양호한 날: 경고 10회 이하 */
const GOOD_DAY_MAX_WARNINGS = 10;
/** 경고 많은 날: 경고 15회 초과 */
const BAD_DAY_MIN_WARNINGS = 16;

type DailyRow = {
  date: string | Date;
  weightSeconds: number;
  count: number;
};

function toDateKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 일별 측정 데이터로 캘린더용 dayStatusMap 계산
 * - 측정 5분 미만: 표시 안 함
 * - 경고 10회 이하: 양호한 날 (good)
 * - 경고 15회 초과: 경고 많은 날 (bad)
 */
export function computeDayStatusMap(rows: DailyRow[]): Record<string, DayStatus> {
  const map: Record<string, DayStatus> = {};

  for (const row of rows) {
    const weightSeconds = Number(row.weightSeconds ?? 0);
    const count = Number(row.count ?? 0);

    if (weightSeconds < MIN_MEASURE_SECONDS) continue;

    const key = toDateKey(row.date);
    if (count <= GOOD_DAY_MAX_WARNINGS) {
      map[key] = "good";
    } else if (count >= BAD_DAY_MIN_WARNINGS) {
      map[key] = "bad";
    }
  }

  return map;
}
