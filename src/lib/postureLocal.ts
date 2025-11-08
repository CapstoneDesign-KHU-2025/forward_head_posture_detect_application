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

export type StoredPostureRecord = PostureMeasurement & { id?: number; uploadFlag: 0 | 1 };
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
    uploadFlag: 0,
  };

  const tx = db.transaction(["samples", "hourly"], "readwrite");
  await tx.objectStore("samples").put(record);

  const key: [string, number] = [data.userId, hourStartTs];
  const hourly = tx.objectStore("hourly");
  const cur = await hourly.get(key);

  if (cur) {
    cur.sumWeighted += data.angleDeg * w;
    cur.weight += w;
    cur.count += 1;
    cur.finalized = 0;
    await hourly.put(cur);
  } else {
    await hourly.put({
      userId: record.userId,
      hourStartTs,
      sumWeighted: data.angleDeg * w,
      weight: w,
      count: 1,
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
