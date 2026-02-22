import { auth } from "@/auth";
import { json, withApiReq } from "@/lib/api/utils";
import { getFriendRequests, createFriendRequest } from "@/services/friends.service";
import { z } from "zod";

const CreateRequestSchema = z.object({
  toUserId: z.string().min(1, "We can't find this friend!"),
});

export const POST = withApiReq(
  async (req) => {
    const session = await auth();
    if (!session?.user?.id) return json({ error: "UNAUTHORIZED" }, 401);

    const body = await req.json().catch(() => ({}));
    const parsed = CreateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.issues[0].message }, 400);
    }

    const request = await createFriendRequest(session.user.id, parsed.data.toUserId);
    return json({ ok: true, request }, 201);
  },
  { path: "/api/friends/requests POST" },
);

const GetRequestsQuerySchema = z.object({
  type: z.enum(["incoming", "outgoing"]).default("incoming"),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELED"]).nullable().default(null),
});

export const GET = withApiReq(
  async (req) => {
    const session = await auth();
    if (!session?.user?.id) return json({ error: "UNAUTHORIZED" }, 401);

    const { searchParams } = new URL(req.url);
    const parsedQuery = GetRequestsQuerySchema.safeParse({
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
    });

    if (!parsedQuery.success) {
      return json({ error: "Invalid query parameters" }, 400);
    }

    const { type, status } = parsedQuery.data;
    const rows = await getFriendRequests(session.user.id, type, status);

    return json({ ok: true, rows }, 200);
  },
  { path: "/api/friends/requests GET" },
);
