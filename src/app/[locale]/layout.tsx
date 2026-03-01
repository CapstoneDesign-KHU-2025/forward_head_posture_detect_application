import "../globals.css";
import Header from "@/components/organisms/layout/Header";
import Footer from "@/components/organisms/layout/Footer";
import PageContainer from "@/components/organisms/layout/PageContainer";
import { auth } from "@/auth";

import Providers from "../providers";
import { MeasurementProvider } from "@/providers/MeasurementProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/navigation";
import { getTranslations } from "next-intl/server";
export type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("Basic");
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  setRequestLocale(locale);
  const session = await auth();
  const messages = await getMessages();

  const user = session?.user
    ? { name: session.user.name || t("Basic.user"), avatarSrc: session.user.image || undefined }
    : null;

  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-neutral-50 text-black antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers session={session}>
            <MeasurementProvider>
              <Header user={user} />
              <PageContainer>{children}</PageContainer>
              <Footer
                links={[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact Us", href: "/contact" },
                ]}
              />
            </MeasurementProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
