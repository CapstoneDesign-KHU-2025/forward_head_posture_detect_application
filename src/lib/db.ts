// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const prismaLog: ("query" | "info" | "warn" | "error")[] =
  process.env.NODE_ENV === "production" ? ["warn", "error"] : ["query", "info", "warn", "error"];

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: prismaLog,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
