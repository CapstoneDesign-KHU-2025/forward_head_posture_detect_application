// 전역 레이아웃 컴포넌트 (서버 컴포넌트)
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/organisms/layout/Header"; // ✅ HeaderClient → Header
import Footer from "@/components/organisms/layout/Footer";

export const metadata: Metadata = {
  title: "거북목 거북거북!",
  description: "자세 측정/지표로 거북목 개선하기",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = { name: "허준 님", avatarSrc: "https://i.pravatar.cc/100?img=5" };

  return (
    <html lang="ko">
      <body className="min-h-dvh bg-neutral-50 text-black antialiased">
        {/* 공통 헤더 */}
        <Header
          user={user}
        />

        {/* 본문 */}
        <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>

        {/* 공통 푸터 */}
        <Footer
          links={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Contact Us", href: "/contact" },
          ]}
        />
      </body>
    </html>
  );
}