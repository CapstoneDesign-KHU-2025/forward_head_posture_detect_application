import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";

import { getDailySummaryAction } from "../actions/summaryActions";
import HomeClient, { WeeklySummaryData } from "@/components/templates/HomeClient";
import { getTranslations } from "next-intl/server";
type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const session = await auth();
  const { locale } = await params;
  const t = await getTranslations("Basic");
  if (!session || !session?.user?.id) {
    return redirect({ href: "/landing", locale: locale });
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
        name: session.user.name ?? t("Basic.user"),
        image: session.user.image ?? undefined,
      }}
    />
  );
}
