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

  // 이 샘플이 대표하는 시간 간격(초) — 기본 10초
  const w = data.sampleGapS ?? 10;

  // 이 샘플이 속한 "시" 단위 구간 시작 시각 (예: 13:27 → 13:00:00.000)
  const hourStart = new Date(data.ts);
  hourStart.setMinutes(0, 0, 0);
  const hourStartTs = +hourStart;

  // samples 스토어에 넣을 레코드
  const record: StoredPostureRecord = {
    ...data,
    // sessionId가 숫자/기타 타입이어도 문자열로 강제
    sessionId: data.sessionId != null ? String(data.sessionId) : undefined,
    uploadedFlag: 0,
  };

  // samples + hourly 두 스토어를 한 트랜잭션에서 처리
  const tx = db.transaction(["samples", "hourly"], "readwrite");

  // 1) samples 스토어에 개별 샘플 저장
  await tx.objectStore("samples").put(record);

  // 2) hourly 스토어에 가중 평균용 누적
  const hourlyStore = tx.objectStore("hourly");
  const key: [string, number] = [data.userId, hourStartTs];

  // hourly 레코드 타입 (IndexedDB에 실제로 저장되는 구조)
  type HourlyRecord = {
    userId: string;
    hourStartTs: number;
    sumWeighted: number; // 각도 * 시간 의 합
    weight: number; // 시간(초) 누적
    count: number; // 거북목 감지 횟수
    avgAngle: number | null;
    finalized: 0 | 1;
  };

  const cur = (await hourlyStore.get(key)) as HourlyRecord | undefined;

  if (cur) {
    // 이미 이 시간대(hourStartTs)에 레코드가 있으면 누적
    cur.sumWeighted += data.angleDeg * w;
    cur.weight += w;

    if (data.isTurtle) {
      cur.count += 1;
    }

    cur.finalized = 0; // 새 데이터 들어왔으니 다시 미확정 상태
    await hourlyStore.put(cur);
  } else {
    // 이 시간대 첫 레코드면 새로 생성
    const newRow: HourlyRecord = {
      userId: record.userId,
      hourStartTs,
      sumWeighted: data.angleDeg * w,
      weight: w,
      count: data.isTurtle ? 1 : 0,
      avgAngle: null,
      finalized: 0,
    };
    await hourlyStore.put(newRow);
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
