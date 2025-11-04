import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data.json");

export async function saveRecord(entry: any) {
  let existing: any[] = [];
  if (fs.existsSync(DB_PATH)) {
    existing = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  }
  existing.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(DB_PATH, JSON.stringify(existing, null, 2));
}
