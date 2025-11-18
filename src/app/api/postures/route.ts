import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return new NextResponse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

export async function GET() {
  try {
    const data = await prisma.postureSample.findMany({
      orderBy: { ts: "desc" },
      take: 100,
    });
    return json(data, 200); // ← BigInt-safe
  } catch (error: any) {
    console.error("[GET /api/postures] error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return json({ error: "Failed to fetch posture samples." }, 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ts, angleDeg, isTurtle, hasPose, sessionId, sampleGapS } = body;

    if (!userId || typeof angleDeg !== "number" || typeof isTurtle !== "boolean") {
      return json({ error: "Invalid input: userId, angleDeg, and isTurtle are required." }, 400);
    }

    const newSample = await prisma.postureSample.create({
      data: {
        userId,
        ts: ts ? new Date(ts) : new Date(),
        angleDeg,
        isTurtle,
        hasPose: hasPose ?? true,
        sessionId: sessionId != null ? BigInt(sessionId) : null,
        sampleGapS: sampleGapS ?? null,
      },
    });

    return json(newSample, 201);
  } catch (error: any) {
    console.error("[POST /api/postures] error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return json({ error: "Failed to create posture sample." }, 500);
  }
}
