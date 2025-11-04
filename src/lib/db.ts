// lib/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";
import { neon, neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Put it in .env.local and restart dev server.");
}

neonConfig.fetchConnectionCache = true;

// Pool 인스턴스 생성
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 타입 캐스팅으로 어댑터 생성
const adapter = new PrismaNeonHTTP(pool as any);

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
