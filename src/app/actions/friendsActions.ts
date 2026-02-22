"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { getFriends, getFriendRequests, createFriendRequest, respondToFriendRequest } from "@/services/friends.service";

// GET: get my friends
export async function getFriendsAction() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "unauthorized" } as const;

  try {
    const friends = await getFriends(session.user.id);
    return { ok: true, data: friends } as const;
  } catch (error: any) {
    console.error("[getFriendsAction] Error:", error);
    return { ok: false, message: "fail to get the friends list" } as const;
  }
}

const GetRequestsSchema = z.object({
  type: z.enum(["incoming", "outgoing"]).default("incoming"),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELED"]).nullable().default(null),
});
export type GetRequestsInput = z.infer<typeof GetRequestsSchema>;

// GET: get friend requests
export async function getFriendRequestsAction(data: GetRequestsInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "unauthorized" } as const;

  const parsed = GetRequestsSchema.safeParse(data);
  if (!parsed.success) return { ok: false, message: "wrong request parameters" } as const;

  try {
    const { type, status } = parsed.data;
    const requests = await getFriendRequests(session.user.id, type, status);
    return { ok: true, data: requests } as const;
  } catch (error: any) {
    console.error("[getFriendRequestsAction] Error:", error);
    return { ok: false, message: "can't fetch friends request list" } as const;
  }
}
//POST : post friend request
const PostFriendRequestSchema = z.object({
  toUserId: z.string().min(1, { message: "요청할 친구를 찾을 수 없습니다." }),
});
export type PostFriendRequestInput = z.infer<typeof PostFriendRequestSchema>;

export async function postFriendRequestAction(_prevState: any, data: PostFriendRequestInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "로그인이 필요합니다." } as const;

  const parsed = PostFriendRequestSchema.safeParse(data);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message } as const;

  try {
    const request = await createFriendRequest(session.user.id, parsed.data.toUserId);
    revalidateTag("friend_requests");

    return { ok: true, data: request } as const;
  } catch (error: any) {
    console.error("[postFriendRequestAction] Error:", error);
    return { ok: false, message: error.message || "친구 요청에 실패했습니다." } as const;
  }
}

// POST: accept/reject friend request
const RespondRequestSchema = z.object({
  requestId: z.string().min(1, { message: "잘못된 요청 ID입니다." }),
  action: z.enum(["ACCEPT", "REJECT"], { message: "올바르지 않은 동작입니다." }),
});
export type RespondRequestInput = z.infer<typeof RespondRequestSchema>;

export async function respondFriendRequestAction(_prevState: any, data: RespondRequestInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "로그인이 필요합니다." } as const;

  const parsed = RespondRequestSchema.safeParse(data);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message } as const;

  try {
    const { requestId, action } = parsed.data;
    const result = await respondToFriendRequest(session.user.id, requestId, action);
    revalidateTag("friend_requests");
    revalidateTag("friends_list");

    return { ok: true, data: result } as const;
  } catch (error: any) {
    console.error("[respondFriendRequestAction] Error:", error);
    return { ok: false, message: error.message || "요청 처리에 실패했습니다." } as const;
  }
}
