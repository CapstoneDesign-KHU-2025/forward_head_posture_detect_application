import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDailySummaryAction } from "./actions/summaryActions";
import HomeClient, { WeeklySummaryData } from "@/components/templates/HomeClient";

export default async function Page() {
  const session = await auth();

  if (!session || !session?.user?.id) {
    return redirect("/landing");
  }
  const userId = session.user.id as string;
  const result = await getDailySummaryAction(null, { days: 7 });
  let weeklyData: WeeklySummaryData | null = null;

  if (result.ok && result.data) {
    weeklyData = result.data as WeeklySummaryData;
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
