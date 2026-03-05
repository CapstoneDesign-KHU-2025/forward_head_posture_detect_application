import "../globals.css";
import Header from "@/components/organisms/layout/Header";
import PageContainer from "@/components/organisms/layout/PageContainer";
import { auth } from "@/auth";

import Providers from "../providers";
import { MeasurementProvider } from "@/providers/MeasurementProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
export type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("Basic");
  const session = await auth();
  const messages = await getMessages();
  console.log("layout locale:", locale, "sample:", (messages as any)?.Basic?.user);
  const user = session?.user
    ? { name: session.user.name || t("user"), avatarSrc: session.user.image || undefined }
    : null;

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <Providers session={session}>
        <MeasurementProvider>
          <div className="h-dvh flex flex-col min-h-0">
            <Header user={user} />
            <PageContainer>{children}</PageContainer>
          </div>
        </MeasurementProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}
