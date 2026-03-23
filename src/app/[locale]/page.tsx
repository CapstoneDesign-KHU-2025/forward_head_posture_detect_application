import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { getDailySummaryAction } from "../actions/summaryActions";
import HomeClient, { WeeklySummaryData } from "@/components/templates/HomeClient";
import LoadingSkeleton from "@/components/molecules/LoadingSkeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

async function HomeDataWrapper({ userId, userName, userImage, tLabel }: any) {
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
        name: userName ?? tLabel,
        image: userImage ?? undefined,
      }}
    />
  );
}

export default async function Page({ params }: Props) {
  const session = await auth();
  const { locale } = await params;
  const t = await getTranslations("Basic");

  if (!session || !session?.user?.id) {
    return redirect({ href: "/landing", locale: locale });
  }

  return (
    <Suspense fallback={<LoadingSkeleton variant="home" />}>
      <HomeDataWrapper
        userId={session.user.id as string}
        userName={session.user.name}
        userImage={session.user.image}
        tLabel={t("user")}
      />
    </Suspense>
  );
}
