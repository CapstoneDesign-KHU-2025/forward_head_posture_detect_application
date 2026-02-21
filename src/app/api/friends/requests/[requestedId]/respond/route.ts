import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { json, orderUserPair, withApiReq } from "@/lib/api/utils";

type RespondBody = { action: "ACCEPT" | "REJECT" };

export const POST = withApiReq(
  async (req, ctx) => {
    const session = await auth();
    const user = session?.user?.id;
    if (!user) return json({ error: "UNAUTHORIZED" }, 401);

    const { requestId } = await ctx.params;

    const body = (await req.json().catch(() => null)) as RespondBody | null;
    const action = body?.action;

    if (action !== "ACCEPT" && action !== "REJECT") {
      return json({ error: "not a correct action" }, 400);
    }

    //double check if the request is exist
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true, fromUserId: true, toUserId: true },
    });
    if (!friendRequest) return json({ error: "Friend request not found" }, 404);
    if (friendRequest.toUserId !== user) return json({ error: "FORBIDDEN" }, 403);
    if (friendRequest.status !== "PENDING") return json({ error: "Request already handled" }, 409);

    //rejection
    if (action === "REJECT") {
      const updated = await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED", respondedAt: new Date() },
        select: { id: true, status: true, respondedAt: true },
      });
      return json({ ok: true, request: updated }, 200);
    }

    //accepting
    const [userAId, userBId] = orderUserPair(friendRequest.fromUserId, friendRequest.toUserId);

    try {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.friendRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED", respondedAt: new Date() },
          select: { id: true, status: true, respondedAt: true, fromUserId: true, toUserId: true },
        });

        // upsert because they could be already friends
        const friendship = await tx.friendship.upsert({
          where: { userAId_userBId: { userAId, userBId } },
          create: { userAId, userBId },
          update: {},
          select: { id: true, userAId: true, userBId: true, createdAt: true },
        });

        return { updated, friendship };
      });

      return json({ ok: true, ...result }, 200);
    } catch (e) {
      return json({ error: "Failed to accept request" }, 500);
    }
  },
  {
    path: "/api/friends/requests/[requestsId]/respond POST",
  },
);
