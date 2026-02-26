import { json, withApiReq } from "@/lib/api/utils";

export const GET = withApiReq(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q"); // "nickname" 추출

  if (!query) return json({ ok: true, users: [] }, 200);

  const users = await searchUsers(query);
  return json({ ok: true, users }, 200);
});
