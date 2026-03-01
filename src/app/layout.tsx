import type { Metadata } from "next";
import "./globals.css";
import { getTranslations } from "next-intl/server";

const t = await getTranslations("Basic");
export const metadata: Metadata = {
  title: t("Basic.title"),
  description: t("Basic.description"),
  icons: { icon: "/icons/turtle.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900;1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-neutral-50 text-black antialiased">{children}</body>
    </html>
  );
}
