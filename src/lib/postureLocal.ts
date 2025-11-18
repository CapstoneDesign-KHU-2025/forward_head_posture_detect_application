import { getDB } from "./idb";

export type PostureMeasurement = {
  userId: string;
  ts: number;
  angleDeg: number;
  isTurtle: boolean;
  hasPose: boolean;
  sessionId?: string;
  sampleGapS?: number;
};

export type StoredPostureRecord = PostureMeasurement & { id?: number; uploadedFlag: 0 | 1 };
export type StoredPostureDTO = Omit<StoredPostureRecord, "id" | "uploadedFlag">;

export async function storeMeasurementAndAccumulate(data: PostureMeasurement) {
  const db = await getDB();
  const w = data.sampleGapS ?? 10;

  const hourStart = new Date(data.ts);
  hourStart.setMinutes(0, 0, 0);
  const hourStartTs = +hourStart;

  const record: StoredPostureRecord = {
    ...data,
    sessionId: data.sessionId != null ? String(data.sessionId) : undefined,
    uploadedFlag: 0,
  };

  const tx = db.transaction(["samples", "hourly"], "readwrite");
  await tx.objectStore("samples").put(record);

  const key: [string, number] = [data.userId, hourStartTs];
  const hourly = tx.objectStore("hourly");
  const cur = await hourly.get(key);
  if (cur) {
    cur.sumWeighted += data.angleDeg * w;
    cur.weight += w;

    if (data.isTurtle) {
      cur.count += 1;
    }

    cur.finalized = 0;
    await hourly.put(cur);
  } else {
    await hourly.put({
      userId: record.userId,
      hourStartTs,
      sumWeighted: data.angleDeg * w,
      weight: w,

      count: data.isTurtle ? 1 : 0,
      avgAngle: null,
      finalized: 0,
    });
  }

  await tx.done;
}

export async function getPendingPostureRecords(limit = 200): Promise<StoredPostureRecord[]> {
  const db = await getDB();
  const idx = db.transaction("samples").store.index("byUploadedFlag");
  const cursor = await idx.openCursor(0);
  const batch: StoredPostureRecord[] = [];
  let cur = cursor;
  while (cur && batch.length < limit) {
    batch.push(cur.value as StoredPostureRecord);
    cur = await cur.continue();
  }
  return batch;
}

export async function markPostureRecordsUploaded(ids: number[]) {
  const db = await getDB();
  const tx = db.transaction("samples", "readwrite");
  for (const id of ids) {
    const record = await tx.store.get(id);
    if (record) {
      record.uploadedFlag = 1;
      await tx.store.put(record);
    }
  }
  await tx.done;
}

export async function getHourlyAverage(userId: string, date = new Date()) {
  const db = await getDB();
  const hourStart = new Date(date);
  hourStart.setMinutes(0, 0, 0);
  const hourStartTs = +hourStart;

  const record = await db.transaction("hourly").store.get([userId, hourStartTs]);
  if (!record || record.weight === 0) return null;
  if (record.finalized === 1 && record.avgAngle != null) {
    return record.avgAngle;
  }

  return record.sumWeighted / record.weight;
}

export async function getTodayCount(userId: string | undefined): Promise<number> {
  if (!userId) return 0;

  const db = await getDB();
  const tx = db.transaction("hourly");
  const store = tx.objectStore("hourly");
  const index = store.index("byUserHour");

  // 오늘 00:00 ~ 내일 00:00 - 1ms 범위
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startTs = +start;
  const endTs = startTs + 24 * 60 * 60 * 1000;

  const range = IDBKeyRange.bound([userId, startTs], [userId, endTs - 1]);

  let total = 0;

  for await (const cursor of index.iterate(range)) {
    total += cursor.value.count ?? 0;
  }

  return total;
}

export async function getTodayMeasuredSeconds(userId: string | undefined): Promise<number> {
  if (!userId) return 0;

  const db = await getDB();
  const tx = db.transaction("hourly");
  const store = tx.objectStore("hourly");
  const index = store.index("byUserHour");

  // 오늘 00:00 ~ 내일 00:00 - 1ms 범위
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startTs = +start;
  const endTs = startTs + 24 * 60 * 60 * 1000;

  const range = IDBKeyRange.bound([userId, startTs], [userId, endTs - 1]);

  let totalSeconds = 0;

  for await (const cursor of index.iterate(range)) {
    const row = cursor.value;
    totalSeconds += row.weight ?? 0; // weight = 초 단위 측정 시간
  }

  return totalSeconds;
}
