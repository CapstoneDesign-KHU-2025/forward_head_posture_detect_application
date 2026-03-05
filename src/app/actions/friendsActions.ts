"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import {
  getFriends,
  getFriendRequests,
  createFriendRequest,
  respondToFriendRequest,
  searchUsers,
} from "@/services/friends.service";
import { ActionState, SERVER_MESSAGES } from "@/lib/api/utils";
import { logger } from "@/lib/logger";

// GET: get my friends
export async function getFriendsAction() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: SERVER_MESSAGES.AUTH_REQUIRED } as const;

  try {
    const friends = await getFriends(session.user.id);
    return { ok: true, data: friends } as const;
  } catch (error: any) {
    logger.error("[getFriendsAction] Error:", error);
    return { ok: false, status: 500, message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR } as const;
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
  if (!session?.user?.id) return { ok: false, message: SERVER_MESSAGES.AUTH_REQUIRED } as const;

  const parsed = GetRequestsSchema.safeParse(data);
  if (!parsed.success) return { ok: false, message: SERVER_MESSAGES.INVALID_INPUT } as const;

  try {
    const { type, status } = parsed.data;
    const requests = await getFriendRequests(session.user.id, type, status);
    return { ok: true, data: requests } as const;
  } catch (error: any) {
    logger.error("[getFriendRequestsAction] Error:", error);
    return { ok: false, status: 500, message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR } as const;
  }
}

//POST : post friend request
const PostFriendRequestSchema = z.object({
  toUserId: z.string().min(1, { message: SERVER_MESSAGES.FRIEND_NOT_FOUND.en }),
});
export type PostFriendRequestInput = z.infer<typeof PostFriendRequestSchema>;

export async function postFriendRequestAction(_prevState: ActionState<unknown>, data: PostFriendRequestInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: SERVER_MESSAGES.AUTH_REQUIRED } as const;

  const parsed = PostFriendRequestSchema.safeParse(data);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message } as const;

  try {
    const request = await createFriendRequest(session.user.id, parsed.data.toUserId);
    revalidateTag("friend_requests");

    return { ok: true, data: request } as const;
  } catch (error: any) {
    logger.error("[postFriendRequestAction] Error:", error);
    return { ok: false, status: 500, message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR } as const;
  }
}

// POST: accept/reject friend request
const RespondRequestSchema = z.object({
  requestId: z.string().min(1, { message: SERVER_MESSAGES.STALE_REQUEST.en }),
  action: z.enum(["ACCEPT", "REJECT"], { message: SERVER_MESSAGES.REQUEST_FAILED.en }),
});
export type RespondRequestInput = z.infer<typeof RespondRequestSchema>;

export async function respondFriendRequestAction(_prevState: ActionState<unknown>, data: RespondRequestInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: SERVER_MESSAGES.AUTH_REQUIRED } as const;

  const parsed = RespondRequestSchema.safeParse(data);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message } as const;

  try {
    const { requestId, action } = parsed.data;
    const result = await respondToFriendRequest(session.user.id, requestId, action);
    revalidateTag("friend_requests");
    revalidateTag("friends_list");

    return { ok: true, data: result } as const;
  } catch (error: any) {
    logger.error("[respondFriendRequestAction] Error:", error);
    return { ok: false, status: 500, message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR } as const;
  }
}
//get : search users
const SearchUsersSchema = z.object({
  query: z.string().min(2, { message: "검색어는 최소 2글자 이상이어야 합니다." }),
});
export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;

export async function searchUsersAction(_prevState: ActionState<unknown>, data: SearchUsersInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, data: [], status: 401, message: SERVER_MESSAGES.AUTH_REQUIRED } as const;
  }

  const parsed = SearchUsersSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, data: [], status: 400, message: SERVER_MESSAGES.FETCH_FAILED } as const;
  }

  try {
    const users = await searchUsers(session.user.id, parsed.data.query);

    return {
      ok: true,
      data: users,
    } as const;
  } catch (error: any) {
    logger.error("[searchUsersAction] Error:", error);
    return {
      ok: false,
      status: 500,
      message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
    } as const;
  }
}
