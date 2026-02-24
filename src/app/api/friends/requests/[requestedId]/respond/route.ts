import { auth } from "@/auth";
import { json, withApiReq } from "@/lib/api/utils";
import { respondToFriendRequest } from "@/services/friends.service";
import { z } from "zod";

const RespondSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"], {
    message: "not a correct action",
  }),
});

export const POST = withApiReq(
  async (req, ctx) => {
    const session = await auth();
    if (!session?.user?.id) return json({ error: "UNAUTHORIZED" }, 401);

    const { requestId } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const parsed = RespondSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0].message }, 400);
    }

    const result = await respondToFriendRequest(session.user.id, requestId, parsed.data.action);

    return json({ ok: true, ...result }, 200);
  },
  { path: "/api/friends/requests/[requestsId]/respond POST" },
);
