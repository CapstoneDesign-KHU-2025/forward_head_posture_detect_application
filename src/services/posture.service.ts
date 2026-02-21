import { prisma } from "@/lib/db";

export type CreatePostureInput = {
  userId: string;
  ts?: number;
  angleDeg: number;
  isTurtle: boolean;
  hasPose?: boolean;
  sessionId?: string | number;
  sampleGapS?: number;
};

export async function createPostureSample(input: CreatePostureInput) {
  if (typeof input.angleDeg !== "number" || typeof input.isTurtle !== "boolean")
    throw new Error("Invalid input: angleDeg and isTurtle are required");

  const newSample = await prisma.postureSample.create({
    data: {
      userId: input.userId,
      ts: input.ts ? new Date(input.ts) : new Date(),
      angleDeg: input.angleDeg,
      isTurtle: input.isTurtle,
      hasPose: input.hasPose ?? true,
      sessionId: input.sessionId != null ? BigInt(input.sessionId) : null,
      sampleGapS: input.sampleGapS ?? null,
    },
  });
  return newSample;
}
