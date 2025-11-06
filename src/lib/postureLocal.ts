import { getDB } from "./idb";

export type Sample = {
  id?: number;
  userId: string;
  ts: number;
  angleDeg: number;
  isTurtle: boolean;
  hasPose: boolean;
  sessionId?: string | number;
  sampleGapS?: number;
  uploadedFlag?: 0 | 1;
};

export async function getPendingBatch(limit = 200) {
  const db = await getDB();
  const idx = db.transaction("samples").store.index("byUploadedFlag");
  const cursor = await idx.openCursor(0);
  const batch: Sample[] = [];
  let cur = cursor;
  while (cur && batch.length < limit) {
    batch.push(cur.value);
    cur = await cur.continue();
  }
  return batch;
}

export async function markUploaded(ids: number[]) {
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
