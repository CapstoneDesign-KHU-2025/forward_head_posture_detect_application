import { auth } from "@/auth";
import { json, SERVER_MESSAGES, withApiReq } from "@/lib/api/utils";
import { searchUsers } from "@/services/friends.service";

export const GET = withApiReq(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) return json({ error: "UNAUTHORIZED" }, 401);
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) return json({ ok: true, users: [] }, 200);

  try {
    const users = await searchUsers(session.user.id, query);
    return json({ ok: true, users }, 200);
  } catch (error) {
    return json({ error: SERVER_MESSAGES.INTERNAL_SERVER_ERROR }, 500);
  }
});
