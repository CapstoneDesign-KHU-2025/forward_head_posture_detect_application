import { getDB } from "./idb";

export async function exportLocalPostureData() {
  const db = await getDB();

  const allData = await db.getAll("samples");
  const allHourlyAverages = await db.getAll("hourly");

  return { samples: allData, hourly: allHourlyAverages };
}
