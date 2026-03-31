import { prisma } from "@/lib/db";

type FriendUserSummary = {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
};

type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";

type FriendshipRowForUser = {
  id: string;
  createdAt: Date;
  userAId: string;
  userBId: string;
  userA: FriendUserSummary;
  userB: FriendUserSummary;
};

type FriendRequestRowForUser = {
  id: string;
  status: FriendRequestStatus;
  createdAt: Date;
  respondedAt: Date | null;
  fromUser: FriendUserSummary;
  toUser: FriendUserSummary;
};

export async function findFriendshipsForUser(userId: string): Promise<FriendshipRowForUser[]> {
  return prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      userAId: true,
      userBId: true,
      userA: { select: { id: true, name: true, image: true, email: true } },
      userB: { select: { id: true, name: true, image: true, email: true } },
    },
  });
}

export async function findFriendRequests(params: {
  userId: string;
  type: "incoming" | "outgoing";
  status?: FriendRequestStatus | null;
}): Promise<FriendRequestRowForUser[]> {
  const { userId, type, status } = params;

  const where =
    type === "incoming"
      ? { toUserId: userId, ...(status ? { status } : {}) }
      : { fromUserId: userId, ...(status ? { status } : {}) };

  return prisma.friendRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      createdAt: true,
      respondedAt: true,
      fromUser: { select: { id: true, name: true, image: true, email: true } },
      toUser: { select: { id: true, name: true, image: true, email: true } },
    },
  });
}

export async function findUserId(userId: string): Promise<null | { id: string }> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
}

export async function findFriendshipByOrderedPair(params: { userAId: string; userBId: string }) {
  const { userAId, userBId } = params;
  return prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
    select: { id: true },
  });
}

export async function findPendingFriendRequestBetween(params: {
  fromUserId: string;
  toUserId: string;
}): Promise<null | { id: string }> {
  const { fromUserId, toUserId } = params;

  return prisma.friendRequest.findFirst({
    where: {
      status: "PENDING",
      OR: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    },
    select: { id: true },
  });
}

export async function createFriendRequestRow(params: { fromUserId: string; toUserId: string }) {
  const { fromUserId, toUserId } = params;

  return prisma.friendRequest.create({
    data: { fromUserId, toUserId, status: "PENDING" },
    select: { id: true, status: true, createdAt: true, fromUserId: true, toUserId: true },
  });
}

export async function findFriendRequestById(
  requestId: string,
): Promise<null | { id: string; status: FriendRequestStatus; fromUserId: string; toUserId: string }> {
  return prisma.friendRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, fromUserId: true, toUserId: true },
  });
}

export async function rejectFriendRequest(requestId: string) {
  const updated = await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", respondedAt: new Date() },
    select: { id: true, status: true, respondedAt: true },
  });

  return { request: updated };
}

export async function acceptFriendRequestTransaction(params: { requestId: string; userAId: string; userBId: string }) {
  const { requestId, userAId, userBId } = params;

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

export async function cancelFriendRequestRow(requestId: string) {
  const updated = await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: "CANCELED", respondedAt: new Date() },
    select: { id: true, status: true, respondedAt: true },
  });

  return { request: updated };
}

export async function findFriendshipById(friendshipId: string) {
  return prisma.friendship.findUnique({
    where: { id: friendshipId },
    select: { id: true, userAId: true, userBId: true },
  });
}

export async function deleteFriendshipById(friendshipId: string) {
  const deleted = await prisma.friendship.delete({
    where: { id: friendshipId },
    select: { id: true },
  });

  return { friendship: deleted };
}

export async function searchUsers(params: { currentUserId: string; query: string }) {
  const { currentUserId, query } = params;
  const trimmedQuery = query.trim();

  return prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: trimmedQuery, mode: "insensitive" } },
            { email: { contains: trimmedQuery, mode: "insensitive" } },
          ],
        },
        {
          NOT: [
            { id: currentUserId },
            {
              OR: [
                { friendshipsA: { some: { userBId: currentUserId } } },
                { friendshipsB: { some: { userAId: currentUserId } } },
              ],
            },
            {
              OR: [{ outgoingFriendRequests: { some: { toUserId: currentUserId, status: "PENDING" } } }],
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
    take: 20,
  });
}
