/**
 * 서버 동기화 후 로컬 DB 정리
 * - 오래된 hourly, samples 레코드 삭제 (중복/오래된 데이터 방지, 브라우저 메모리 절약)
 */
import { getDB } from "@/lib/idb";
import { logger } from "@/lib/logger";

const DEBUG = process.env.NODE_ENV !== "production";

/** keepDays: 이 일수 이전 데이터 삭제 (기본 3일) */
export async function cleanupOldPostureData(
  userId: string,
  keepDays: number = 3
): Promise<{ hourlyDeleted: number; samplesDeleted: number }> {
  const db = await getDB();

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - keepDays);
  cutoff.setHours(0, 0, 0, 0);
  const cutoffTs = +cutoff;

  let hourlyDeleted = 0;
  let samplesDeleted = 0;

  try {
    // 1) hourly: userId + hourStartTs < cutoff 인 레코드 삭제
    const hourlyTx = db.transaction("hourly", "readwrite");
    const hourlyStore = hourlyTx.objectStore("hourly");
    const hourlyIndex = hourlyStore.index("byUserHour");

    const hourlyRange = IDBKeyRange.bound(
      [userId, 0],
      [userId, cutoffTs - 1],
      false,
      false
    );

    for await (const cursor of hourlyIndex.iterate(hourlyRange)) {
      await cursor.delete();
      hourlyDeleted++;
    }

    await hourlyTx.done;

    // 2) samples: ts < cutoff 인 레코드 삭제 (userId 상관없이 - 해당 사용자 것만 삭제하려면 byUserTs 사용)
    const samplesTx = db.transaction("samples", "readwrite");
    const samplesStore = samplesTx.objectStore("samples");
    const samplesIndex = samplesStore.index("byUserTs");

    const samplesRange = IDBKeyRange.bound(
      [userId, 0],
      [userId, cutoffTs - 1],
      false,
      false
    );

    for await (const cursor of samplesIndex.iterate(samplesRange)) {
      await cursor.delete();
      samplesDeleted++;
    }

    await samplesTx.done;

    if (DEBUG && (hourlyDeleted > 0 || samplesDeleted > 0)) {
      console.debug(
        `[cleanupOldPostureData] userId=${userId} keepDays=${keepDays} deleted: hourly=${hourlyDeleted} samples=${samplesDeleted}`
      );
    }

    return { hourlyDeleted, samplesDeleted };
  } catch (e) {
    logger.error("[cleanupOldPostureData] error:", e);
    return { hourlyDeleted, samplesDeleted };
  }
}
