import type { Metadata } from "next";
import "./globals.css";
import { getTranslations } from "next-intl/server";

import React from "react";
const t = await getTranslations("Basic");

export const metadata: Metadata = {
  title: t("title"),
  description: t("description"),
  icons: { icon: "/icons/turtle.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900;1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex h-dvh flex-col overflow-hidden bg-[var(--green-pale)] text-black antialiased">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
