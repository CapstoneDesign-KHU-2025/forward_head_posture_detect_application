// src/lib/hourlyOps.ts
import { getDB } from "./idb";

/** 특정 범위의 hourly 레코드를 시간순으로 가져오기 */
export async function getHourlyRange(userId: string, startTs: number, endTs: number) {
  const db = await getDB();
  const idx = db.transaction("hourly").store.index("byUserHour");
  const range = IDBKeyRange.bound([userId, startTs], [userId, endTs]);
  const rows = await idx.getAll(range);
  // 안전하게 정렬
  rows.sort((a, b) => a.hourStartTs - b.hourStartTs);
  return rows;
}

/** 오늘 0시~지금 기준의 hourly 레코드 가져오기 */
export async function getTodayHourly(userId: string, now = new Date()) {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const startTs = +dayStart;
  const endTs = +now;
  return getHourlyRange(userId, startTs, endTs);
}

/** “오늘 지금까지” 가중 평균 계산 (finalized/미확정 모두 포함) */
export async function computeTodaySoFarAverage(userId: string, now = new Date()) {
  const rows = await getTodayHourly(userId, now);
  let totalSum = 0;
  let totalWeight = 0;

  for (const r of rows) {
    // finalized여도 sumWeighted/weight가 남아 있으므로 그대로 사용하는 게 가장 일관적
    if (r.weight > 0) {
      totalSum += r.sumWeighted;
      totalWeight += r.weight;
    }
  }

  if (totalWeight === 0) return null;
  return totalSum / totalWeight;
}

/**
 * 시간대 평균 확정(finalize).
 * - 과거 시간대는 자동 확정
 * - includeCurrentHour=true면 현재 진행 중인 시간대도 “지금까지” 기준으로 확정 저장
 */
export async function finalizeUpToNow(userId: string, includeCurrentHour = false, now = new Date()) {
  const db = await getDB();
  const tx = db.transaction("hourly", "readwrite");
  const store = tx.store;

  const currentHourStart = new Date(now);
  currentHourStart.setMinutes(0, 0, 0);
  const currentHourStartTs = +currentHourStart;
  const currentHourEndTs = currentHourStartTs + 60 * 60 * 1000;

  let cursor = await store.openCursor();
  while (cursor) {
    const row = cursor.value;

    if (row.userId !== userId || row.weight <= 0) {
      cursor = await cursor.continue();
      continue;
    }

    const rowEnd = row.hourStartTs + 60 * 60 * 1000;
    const isPastHour = rowEnd <= +now;
    const isCurrentHour = row.hourStartTs === currentHourStartTs;

    if (row.finalized !== 1) {
      if (isPastHour || (includeCurrentHour && isCurrentHour)) {
        row.avgAngle = row.sumWeighted / row.weight;
        row.finalized = 1;
        await cursor.update(row);
      }
    }

    cursor = await cursor.continue();
  }

  await tx.done;
}

/** 유틸: 오늘 0시 타임스탬프 */
export function getTodayStartTs(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return +d;
}
