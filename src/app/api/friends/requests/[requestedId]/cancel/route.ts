import { auth } from "@/auth";
import { json, withApiReq } from "@/lib/api/utils";
import { cancelFriendRequest } from "@/services/friends.service";

export const POST = withApiReq(
  async (_req, ctx) => {
    const session = await auth();
    if (!session?.user?.id) return json({ error: "UNAUTHORIZED" }, 401);

    const { requestedId } = ctx.params;
    const requestId = requestedId;

    const result = await cancelFriendRequest(session.user.id, requestId);

    return json({ ok: true, ...result }, 200);
  },
  { path: "/api/friends/requests/[requestedId]/cancel POST" },
);

