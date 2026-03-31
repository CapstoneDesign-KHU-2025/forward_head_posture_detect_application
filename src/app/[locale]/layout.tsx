import "../globals.css";
import Header from "@/app/[locale]/components/header/Header";
import PageContainer from "@/app/[locale]/components/header/PageContainer";
import { auth } from "@/auth";

import Providers from "../providers";
import { MeasurementController } from "@/controllers/MeasurementController";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { SoundController } from "@/controllers/SoundController";
import { Nunito } from "next/font/google";
import { Metadata } from "next";
import { PiPController } from "@/controllers/PipController";
import { GlobalPipRenderer } from "@/app/[locale]/(protected)/estimate/components/GlobalPipRenderer";
import { Props } from "@/utils/types";
export const metadata: Metadata = {
  title: "BoogiBoogi",
  description: "Improve turtle neck posture with AI metrics",
  icons: { icon: "/icons/turtle.png" },
  verification: {
    google: process.env.GOOGLE_META_TAG,
  },
};
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-gothic",
});

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("Basic");
  const session = await auth();
  const messages = await getMessages();

  const user = session?.user
    ? { name: session.user.name || t("user"), avatarSrc: session.user.image || undefined }
    : null;

  return (
    <html lang={locale} className={`${nunito.variable} font-sans`}>
      <body>
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
          <Providers session={session}>
            <PiPController>
              <SoundController>
                <MeasurementController>
                  <div className="h-dvh flex flex-col min-h-0">
                    <Header user={user} />
                    <PageContainer>
                      {children}
                      <GlobalPipRenderer />
                    </PageContainer>
                  </div>
                </MeasurementController>
              </SoundController>
            </PiPController>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
