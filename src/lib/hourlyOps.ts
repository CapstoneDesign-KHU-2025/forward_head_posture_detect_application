import { getDB } from "./idb";

export type HourlyRow = {
  userId: string;
  hourStartTs: number;
  sumWeighted: number;
  weight: number;
  count: number;
  avgAngle?: number | null;
  finalized: 0 | 1;
};

export async function getHourlyRange(
  userId: string,
  startTs: number,
  endTs: number,
): Promise<HourlyRow[]> {
  const db = await getDB();
  const idx = db.transaction("hourly").store.index("byUserHour");
  const range = IDBKeyRange.bound([userId, startTs], [userId, endTs]);
  const rows = (await idx.getAll(range)) as HourlyRow[];
  rows.sort((a, b) => a.hourStartTs - b.hourStartTs);
  return rows;
}

export async function getTodayHourly(userId: string, now = new Date()) {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const startTs = +dayStart;
  const endTs = +now;
  return getHourlyRange(userId, startTs, endTs);
}

export async function computeTodaySoFarAverage(
  userId: string | undefined,
  now = new Date(),
) {
  if (!userId) return null;
  const rows = await getTodayHourly(userId, now);
  let totalSum = 0;
  let totalWeight = 0;

  for (const r of rows) {
    if (r.weight > 0) {
      totalSum += r.sumWeighted;
      totalWeight += r.weight;
    }
  }

  if (totalWeight === 0) return null;
  return totalSum / totalWeight;
}

export async function finalizeUpToNow(
  userId: string,
  includeCurrentHour = false,
  now = new Date(),
) {
  const db = await getDB();
  const tx = db.transaction("hourly", "readwrite");
  const store = tx.store;

  const index = store.index("byUser");

  const currentHourStart = new Date(now);
  currentHourStart.setMinutes(0, 0, 0);
  const currentHourStartTs = +currentHourStart;

  let cursor = await index.openCursor(IDBKeyRange.only(userId));
  while (cursor) {
    const row = cursor.value;

    if (row.weight <= 0 || row.finalized === 1) {
      cursor = await cursor.continue();
      continue;
    }

    const rowEnd = row.hourStartTs + 60 * 60 * 1000;
    const isPastHour = rowEnd <= +now;
    const isCurrentHour = row.hourStartTs === currentHourStartTs;

    if (isPastHour || (includeCurrentHour && isCurrentHour)) {
      row.avgAngle = row.sumWeighted / row.weight;
      row.finalized = 1;
      await cursor.update(row);
    }

    cursor = await cursor.continue();
  }

  await tx.done;
}

export function getTodayStartTs(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return +d;
}
