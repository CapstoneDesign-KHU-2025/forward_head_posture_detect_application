import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { json, withApi } from "@/lib/api/utils";

export const GET = withApi(
  async () => {
    const session = await auth();
    const user = session?.user?.id;
    if (!user) return json({ error: "UNAUTHORIZED" }, 401);

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: user }, { userBId: user }],
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        createdAt: true,
        userAId: true,
        userBId: true,
        userA: { select: { id: true, name: true, image: true } },
        userB: { select: { id: true, name: true, image: true } },
      },
    });

    const friends = friendships.map((f) => {
      const other = f.userAId === user ? f.userB : f.userA;
      return {
        friendshipId: f.id,
        createdAt: f.createdAt,
        user: other,
      };
    });

    return json({ ok: true, friends }, 200);
  },
  { path: "/api/friends GET" },
);
