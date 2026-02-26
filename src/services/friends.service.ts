import { prisma } from "@/lib/db";
import { orderUserPair } from "@/lib/api/utils";

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      userAId: true,
      userBId: true,
      userA: { select: { id: true, name: true, image: true } },
      userB: { select: { id: true, name: true, image: true } },
    },
  });

  return friendships.map((f) => {
    const other = f.userAId === userId ? f.userB : f.userA;
    return {
      friendshipId: f.id,
      createdAt: f.createdAt,
      user: other,
    };
  });
}

export async function getFriendRequests(
  userId: string,
  type: "incoming" | "outgoing",
  status?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | null,
) {
  const where =
    type === "incoming"
      ? { toUserId: userId, ...(status ? { status } : {}) }
      : { fromUserId: userId, ...(status ? { status } : {}) };

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

  return rows;
}

export async function createFriendRequest(fromUserId: string, toUserId: string) {
  if (fromUserId === toUserId) throw new Error("Cannot friend-request yourself");

  const target = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true },
  });
  if (!target) throw new Error("User not found");

  const [userAId, userBId] = orderUserPair(fromUserId, toUserId);
  const alreadyFriends = await prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
    select: { id: true },
  });
  if (alreadyFriends) throw new Error("You are already friends");

  const existingPending = await prisma.friendRequest.findFirst({
    where: {
      status: "PENDING",
      OR: [
        { fromUserId: fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    },
    select: { id: true },
  });
  if (existingPending) throw new Error("Friend request is already pending");

  return prisma.friendRequest.create({
    data: { fromUserId, toUserId, status: "PENDING" },
    select: { id: true, status: true, createdAt: true, fromUserId: true, toUserId: true },
  });
}

export async function respondToFriendRequest(userId: string, requestId: string, action: "ACCEPT" | "REJECT") {
  const friendRequest = await prisma.friendRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, fromUserId: true, toUserId: true },
  });

  if (!friendRequest) throw new Error("Friend request not found");
  if (friendRequest.toUserId !== userId) throw new Error("Forbidden: Not your request");
  if (friendRequest.status !== "PENDING") throw new Error("Request already handled");

  if (action === "REJECT") {
    const updated = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", respondedAt: new Date() },
      select: { id: true, status: true, respondedAt: true },
    });
    return { request: updated };
  }

  const [userAId, userBId] = orderUserPair(friendRequest.fromUserId, friendRequest.toUserId);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.friendRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
      select: { id: true, status: true, respondedAt: true, fromUserId: true, toUserId: true },
    });

    const friendship = await tx.friendship.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId },
      update: {},
      select: { id: true, userAId: true, userBId: true, createdAt: true },
    });

    return { updated, friendship };
  });
}

export async function cancelFriendRequest(userId: string, requestId: string) {
  const friendRequest = await prisma.friendRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, fromUserId: true },
  });

  if (!friendRequest) throw new Error("Friend request not found");
  if (friendRequest.fromUserId !== userId) throw new Error("Forbidden: Not your request");
  if (friendRequest.status !== "PENDING") throw new Error("Request already handled");

  const updated = await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: "CANCELED", respondedAt: new Date() },
    select: { id: true, status: true, respondedAt: true },
  });

  return { request: updated };
}

export async function deleteFriendship(userId: string, friendshipId: string) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    select: { id: true, userAId: true, userBId: true },
  });

  if (!friendship) throw new Error("Friendship not found");
  if (friendship.userAId !== userId && friendship.userBId !== userId) {
    throw new Error("Forbidden: Not your friendship");
  }

  const deleted = await prisma.friendship.delete({
    where: { id: friendshipId },
    select: { id: true },
  });

  return { friendship: deleted };
}
