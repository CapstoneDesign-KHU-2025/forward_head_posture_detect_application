import { auth } from "@/auth";
import { json, withApi } from "@/lib/api/utils";
import { getFriends } from "@/services/friends.service";

export const GET = withApi(
  async () => {
    const session = await auth();
    if (!session?.user?.id) return json({ error: "UNAUTHORIZED" }, 401);

    const friends = await getFriends(session.user.id);
    return json({ ok: true, friends }, 200);
  },
  { path: "/api/friends GET" },
);
