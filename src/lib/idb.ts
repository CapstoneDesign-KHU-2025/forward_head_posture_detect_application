import { openDB, DBSchema, IDBPDatabase } from "idb";

const HOUR_MS = 60 * 60 * 1000;

export function getHourStartTs(d: Date) {
  const x = new Date(d);
  x.setMinutes(0, 0, 0);
  return +x;
}
interface PostureDB extends DBSchema {
  samples: {
    key: number;
    value: {
      id?: number;
      userId: string;
      ts: number;
      angleDeg: number;
      isTurtle: boolean;
      hasPose: boolean;
      sessionId?: string;
      sampleGapS?: number;
      uploadedFlag?: 0 | 1;
    };
    indexes: {
      byTs: number;
      byUserTs: [string, number];
      byUploadedFlag: 0 | 1;
    };
  };

  hourly: {
    key: [string, number];
    value: {
      userId: string;
      hourStartTs: number;
      sumWeighted: number;
      weight: number;
      count: number;
      avgAngle?: number | null;
      finalized: 0 | 1;
    };
    indexes: {
      byUser: string;
      byUserHour: [string, number];
    };
  };
}

let _db: IDBPDatabase<PostureDB>;

export async function getDB() {
  if (_db) return _db;

  _db = await openDB<PostureDB>("posture-db", 1, {
    upgrade(db) {
      const store = db.createObjectStore("samples", { keyPath: "id", autoIncrement: true });
      store.createIndex("byTs", "ts");
      store.createIndex("byUserTs", ["userId", "ts"]);
      store.createIndex("byUploadedFlag", "uploadedFlag");

      const hour = db.createObjectStore("hourly", { keyPath: ["userId", "hourStartTs"] });
      hour.createIndex("byUser", "userId");
      hour.createIndex("byUserHour", ["userId", "hourStartTs"]);
    },
  });
  return _db;
}
