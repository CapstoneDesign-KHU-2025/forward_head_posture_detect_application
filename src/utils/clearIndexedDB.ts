// src/lib/clearPostureDB.ts
export async function clearIndexedDB(dbName = "posture-db") {
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn("IndexedDB delete blocked. Close other tabs using this site.");
    };
  });
}
