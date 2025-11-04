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

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/postures] Database fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posture samples." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, ts, angleDeg, isTurtle, hasPose, sessionId, sampleGapS } = body;

    if (!userId || typeof angleDeg !== "number" || typeof isTurtle !== "boolean") {
      return NextResponse.json(
        { error: "Invalid input: userId, angleDeg, and isTurtle are required." },
        { status: 400 }
      );
    }

    const newSample = await prisma.postureSample.create({
      data: {
        userId,
        ts: ts ? new Date(ts) : new Date(),
        angleDeg,
        isTurtle,
        hasPose: hasPose ?? true,
        sessionId: sessionId ?? null,
        sampleGapS: sampleGapS ?? null,
      },
    });

    return NextResponse.json(newSample, { status: 201 });
  } catch (error) {
    console.error("[POST /api/postures] Database insert error:", error);
    return NextResponse.json({ error: "Failed to create posture sample." }, { status: 500 });
  }
}
