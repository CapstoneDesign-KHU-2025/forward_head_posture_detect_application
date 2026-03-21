import "../globals.css";
import Header from "@/components/organisms/layout/Header";
import PageContainer from "@/components/organisms/layout/PageContainer";
import TempFooter from "@/components/organisms/layout/TempFooter";
import { auth } from "@/auth";

import Providers from "../providers";
import { MeasurementProvider } from "@/providers/MeasurementProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { SoundProvider } from "@/providers/SoundContext";
import { Gothic_A1 } from "next/font/google";
import { Nunito } from "next/font/google";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BoogiBoogi",
  description: "Improve turtle neck posture with AI metrics",
  icons: { icon: "/icons/turtle.png" },
};
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-gothic",
});

export type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

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
            <SoundProvider>
              <MeasurementProvider>
                <div className="h-dvh flex flex-col min-h-0">
                  <Header user={user} />
                  <PageContainer>{children}</PageContainer>
                  <TempFooter />
                </div>
              </MeasurementProvider>
            </SoundProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
