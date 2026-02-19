import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDailySummaryAction } from "./actions/getDailySummaryAction";
import HomeClient from "@/components/templates/HomeClient";

export default async function Page() {
  const session = await auth();

  if (!session || !session?.user?.id) {
    return redirect("/landing");
  }
  const userId = session.user.id as string;
  const res = await getDailySummaryAction(null, { userId: userId });
  let weeklyData = null;
  if (!res.ok || !res.data) {
    return (
      <HomeClient
        weeklyData={null}
        user={{ id: userId, name: session.user.name ?? "거북거북", image: session.user.image ?? undefined }}
      />
    );
  }
  return (
    <HomeClient
      weeklyData={weeklyData}
      user={{
        id: userId,
        name: session.user.name ?? "거북거북",
        image: session.user.image ?? undefined,
      }}
    />
  );
}
