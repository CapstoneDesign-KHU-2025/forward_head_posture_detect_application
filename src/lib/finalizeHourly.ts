import { getDB } from "./idb";

export async function finalizeHourlyRecords(userId: string) {
  const db = await getDB();
  const tx = db.transaction("hourly", "readwrite");
  const store = tx.store;

  let cursor = await store.openCursor();
  while (cursor) {
    const record = cursor.value;
    const blockEnd = record.hourStartTs + 60 * 60 * 1000;
    const now = Date.now();

    if (record.userId === userId && record.finalized === 0 && now > blockEnd) {
      const avg = record.sumWeighted / record.weight;
      record.avgAngle = avg;
      record.finalized = 1;
      await cursor.update(record);
      console.log(`${new Date(record.hourStartTs).getHours()}시 평균 확정: ${avg.toFixed(2)}°`);
    }

    cursor = await cursor.continue();
  }

  await tx.done;
}
