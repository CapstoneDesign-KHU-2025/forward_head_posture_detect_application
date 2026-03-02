import { auth } from "@/auth";
import { json, withApiReq } from "@/lib/api/utils";
import { deleteFriendship } from "@/services/friends.service";

export const DELETE = withApiReq(
  async (_req, ctx) => {
    const session = await auth();
    if (!session?.user?.id) return json({ error: "UNAUTHORIZED" }, 401);

    const { friendshipId } = ctx.params;

    const result = await deleteFriendship(session.user.id, friendshipId);

    return json({ ok: true, ...result }, 200);
  },
  { path: "/api/friends/[friendshipId] DELETE" },
);

