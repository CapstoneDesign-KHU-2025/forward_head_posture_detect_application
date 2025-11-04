// prisma.config.ts
import { defineConfig } from "@prisma/config";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

// CWD 기준으로 .env 찾기
const envPath = path.join(process.cwd(), ".env");
console.log("[prisma.config] Looking for .env at:", envPath);
console.log("[prisma.config] Exists:", fs.existsSync(envPath));

dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error("[prisma.config] DATABASE_URL is missing! Check file location or spelling.");
  throw new Error("DATABASE_URL is not set in .env");
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
