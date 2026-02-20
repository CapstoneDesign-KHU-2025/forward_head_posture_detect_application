import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
export const runtime = "nodejs";

const posturePostSchema = z.object({
  ts: z.string().optional(),
  angleDeg: z.number().refine(Number.isFinite, { message: "Must be a finite number" }),
  isTurtle: z.boolean(),
  hasPose: z.boolean().optional(),
  sessionId: z.number().optional().nullable(),
  sampleGapS: z.number().optional().nullable(),
});

function json(data: unknown, status = 200) {
  return new NextResponse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, 401);
    }

    const data = await prisma.postureSample.findMany({
      where: { userId: session.user.id },
      orderBy: { ts: "desc" },
      take: 100,
    });
    return json(data, 200);
  } catch (error) {
    console.error("[GET /api/postures] error:", error);
    return json({ error: "Failed to fetch posture samples." }, 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const parsed = posturePostSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Invalid input" }, 400);
    }

    const { ts, angleDeg, isTurtle, hasPose, sessionId, sampleGapS } = parsed.data;

    const newSample = await prisma.postureSample.create({
      data: {
        userId: session.user.id,
        ts: ts ? new Date(ts) : new Date(),
        angleDeg,
        isTurtle,
        hasPose: hasPose ?? true,
        sessionId: sessionId != null ? BigInt(sessionId) : null,
        sampleGapS: sampleGapS ?? null,
      },
    });

    return json(newSample, 201);
  } catch (error) {
    console.error("[POST /api/postures] error:", error);
    return json({ error: "Failed to create posture sample." }, 500);
  }
}
