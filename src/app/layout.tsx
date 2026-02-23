// 전역 레이아웃 컴포넌트 (서버 컴포넌트)
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/organisms/layout/Header";
import PageContainer from "@/components/organisms/layout/PageContainer";
import { auth } from "@/auth";

import Providers from "./providers";

export const metadata: Metadata = {
  title: "거북목 거북거북!",
  description: "자세 측정/지표로 거북목 개선하기",
  icons: {
    icon: "/icons/turtle.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const user = session?.user
    ? { name: session.user.name || "사용자", avatarSrc: session.user.image || undefined }
    : null;

  return (
    <html lang="ko">
      <body className="min-h-dvh bg-[#f4faf6] text-black antialiased">
        <Providers session={session}>
          <Header user={user} />
          <PageContainer>{children}</PageContainer>
        </Providers>
      </body>
    </html>
  );
}
