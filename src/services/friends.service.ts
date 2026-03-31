import { orderUserPair } from "@/lib/api/utils";
import { unstable_cache } from "next/cache";
import {
  acceptFriendRequestTransaction,
  createFriendRequestRow,
  findFriendRequests,
  findFriendRequestById,
  findFriendshipById,
  findFriendshipByOrderedPair,
  findFriendshipsForUser,
  findPendingFriendRequestBetween,
  findUserId,
  cancelFriendRequestRow,
  deleteFriendshipById,
  rejectFriendRequest,
  searchUsers as searchUsersRepository,
} from "@/repositories/friends.repository";
export interface FriendItem {
  friendshipId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
}
export async function getFriends(userId: string): Promise<FriendItem[]> {
  const getCachedFriends = unstable_cache(
    async () => {
      const friendships = await findFriendshipsForUser(userId);
      return friendships.map((f) => {
        const other = f.userAId === userId ? f.userB : f.userA;
        return {
          friendshipId: f.id,
          createdAt: f.createdAt,
          user: other,
        };
      });
    },
    ["friend-list", userId],
    { tags: ["friends_list"], revalidate: 3600 },
  );

  return getCachedFriends();
}

export async function getFriendRequests(
  userId: string,
  type: "incoming" | "outgoing",
  status?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | null,
) {
  return findFriendRequests({ userId, type, status });
}

export async function createFriendRequest(fromUserId: string, toUserId: string) {
  if (fromUserId === toUserId) throw new Error("Cannot friend-request yourself");

  const target = await findUserId(toUserId);
  if (!target) throw new Error("User not found");

  const [userAId, userBId] = orderUserPair(fromUserId, toUserId);
  const alreadyFriends = await findFriendshipByOrderedPair({ userAId, userBId });
  if (alreadyFriends) throw new Error("You are already friends");

  const existingPending = await findPendingFriendRequestBetween({ fromUserId, toUserId });
  if (existingPending) throw new Error("Friend request is already pending");

  return createFriendRequestRow({ fromUserId, toUserId });
}

export async function respondToFriendRequest(userId: string, requestId: string, action: "ACCEPT" | "REJECT") {
  const friendRequest = await findFriendRequestById(requestId);

  if (!friendRequest) throw new Error("Friend request not found");
  if (friendRequest.toUserId !== userId) throw new Error("Forbidden: Not your request");
  if (friendRequest.status !== "PENDING") throw new Error("Request already handled");

  if (action === "REJECT") {
    return rejectFriendRequest(requestId);
  }

  const [userAId, userBId] = orderUserPair(friendRequest.fromUserId, friendRequest.toUserId);

  return acceptFriendRequestTransaction({ requestId, userAId, userBId });
}

export async function cancelFriendRequest(userId: string, requestId: string) {
  const friendRequest = await findFriendRequestById(requestId);

  if (!friendRequest) throw new Error("Friend request not found");
  if (friendRequest.fromUserId !== userId) throw new Error("Forbidden: Not your request");
  if (friendRequest.status !== "PENDING") throw new Error("Request already handled");

  return cancelFriendRequestRow(requestId);
}

export async function deleteFriendship(userId: string, friendshipId: string) {
  const friendship = await findFriendshipById(friendshipId);

  if (!friendship) throw new Error("Friendship not found");
  if (friendship.userAId !== userId && friendship.userBId !== userId) {
    throw new Error("Forbidden: Not your friendship");
  }

  return deleteFriendshipById(friendshipId);
}

export async function searchUsers(currentUserId: string, query: string) {
  if (!query || query.trim().length < 2) return [];

  return searchUsersRepository({ currentUserId, query });
}
