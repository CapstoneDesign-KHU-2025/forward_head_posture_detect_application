import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { json, withApi, withApiReq } from "@/lib/api/utils";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";
export const runtime = "nodejs";

const PostureSampleSchema = z
  .object({
    ts: z.coerce.date().optional(),
    angleDeg: z.number().gte(-180).lte(180),
    isTurtle: z.boolean(),
    hasPose: z.boolean().optional(),
    sessionId: z.union([z.string(), z.number()]).nullable().optional(),
    sampleGapS: z.number().gte(0).lte(3600).optional(),
  })
  .strict();

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

    const rate = checkRateLimit(`postures:create:${session.user.id}`, {
      windowMs: 60_000,
      max: 120,
    });
    if (!rate.ok) {
      return json({ error: "Too many posture samples. Please try again later." }, 429);
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = PostureSampleSchema.safeParse(rawBody);

    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }

    const { ts, angleDeg, isTurtle, hasPose, sessionId, sampleGapS } = parsed.data;

    const newSample = await prisma.postureSample.create({
      data: {
        userId: session.user.id,
        ts: ts ?? new Date(),
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
