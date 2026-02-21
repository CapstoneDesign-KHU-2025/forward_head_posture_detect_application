import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { json, orderUserPair } from "@/lib/api/utils";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user?.id;
  if (!user) return json({ error: "UNAUTHORIZED" }, 401);

  const body = await req.json().catch(() => null);
  const toUserId = body?.toUserId as string | undefined;

  if (!toUserId) return json({ error: "We can't find this friend!" }, 400);
  if (toUserId === user) return json({ error: "Cannot friend-request yourself" }, 400);

  const target = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true },
  });

  if (!target) return json({ error: "We can't find this friend! Please try it again" }, 404);

  const [userAId, userBId] = orderUserPair(user, toUserId);
  const alreadyFriends = await prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
    select: { id: true },
  });
  if (alreadyFriends) return json({ error: "You are already friends" }, 409);

  const existingPending = await prisma.friendRequest.findFirst({
    where: {
      status: "PENDING",
      OR: [
        { fromUserId: user, toUserId },
        { fromUserId: toUserId, toUserId: user },
      ],
    },
    select: { id: true, fromUserId: true, toUserId: true },
  });
  if (existingPending) return json({ error: "Friend request is already pending" }, 409);

  try {
    const created = await prisma.friendRequest.create({
      data: { fromUserId: user, toUserId, status: "PENDING" },
      select: { id: true, status: true, createdAt: true, fromUserId: true, toUserId: true },
    });
    return json({ ok: true, request: created }, 201);
  } catch (e) {
    return json({ error: "Failed to create friend request" }, 500);
  }
}

/*
GET /api/friends/requests?type=incoming|outgoing&status=PENDING|ACCEPTED|REJECTED|CANCELED
 */
export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user?.id;
  if (!user) return json({ error: "UNAUTHORIZED" }, 401);

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "incoming") as "incoming" | "outgoing";
  const status = searchParams.get("status") as "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | null;

  const where =
    type === "incoming"
      ? { toUserId: user, ...(status ? { status } : {}) }
      : { fromUserId: user, ...(status ? { status } : {}) };

  const rows = await prisma.friendRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      createdAt: true,
      respondedAt: true,
      fromUser: { select: { id: true, name: true, image: true } },
      toUser: { select: { id: true, name: true, image: true } },
    },
  });

  return json({ ok: true, rows }, 200);
}
