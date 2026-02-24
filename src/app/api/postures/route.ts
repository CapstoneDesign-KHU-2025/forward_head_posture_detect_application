import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { json, withApi, withApiReq } from "@/lib/api/utils";
export const runtime = "nodejs";

export const GET = withApi(
  async () => {
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
  },
  {
    path: "/api/postures GET",
  },
);

export const POST = withApiReq(
  async (req) => {
    const session = await auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { ts, angleDeg, isTurtle, hasPose, sessionId, sampleGapS } = body;

    if (typeof angleDeg !== "number" || typeof isTurtle !== "boolean") {
      return json({ error: "Invalid input: angleDeg and isTurtle are required." }, 400);
    }

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
  },
  { path: "/api/postures POST" },
);
