import { openDB, DBSchema, IDBPDatabase } from "idb";

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
      sessionId?: string | number;
      sampleGapS?: number;
      uploadedFlag?: 0 | 1;
    };
    indexes: {
      byTs: number;
      byUserTs: [string, number];
      byUploadedFlag: 0 | 1;
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
    },
  });
  return _db;
}
