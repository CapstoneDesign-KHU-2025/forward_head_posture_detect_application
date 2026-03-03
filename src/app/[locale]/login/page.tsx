import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";

import { Card } from "@/components/atoms/Card";
import OauthButton from "@/components/molecules/OauthButton";
<<<<<<< HEAD:src/app/[locale]/login/page.tsx
import { useTranslations } from "next-intl";
export default function LoginPage() {
  const t = useTranslations("Login");
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#F8FBF8] w-screen flex items-center justify-center p-8">
      <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-12 max-w-[450px] w-full">
        <div className="text-center flex flex-col items-center mb-8 gap-2">
          <Icon size="2xl">
            <img src="/icons/turtle.png" alt={t("alt.icon")} className="object-contain shrink-0" />
          </Icon>
          <h1 className="text-[1.8rem] text-[#2D5F2E] mb-2">{t("header.title")}</h1>
          <p className="text-[#4F4F4F] text-[1.1rem]">{t("header.description")}</p>
        </div>

        <div className="mt-8">
          <div className="text-center mb-8">
            <h2 className="text-[1.5rem] text-[#1A1A1A] mb-2">{t("body.recommendation")}</h2>
          </div>

          <div className="flex flex-col gap-4">
            <OauthButton provider="github" />
            <OauthButton provider="google" />
          </div>
=======

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    return redirect("/");
  }
  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-8 bg-[var(--green-pale)] relative overflow-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 login-bg-dots" />
        <div
          className="absolute text-[120px] opacity-[0.04] leading-none select-none login-bg-turtle"
          style={{ top: "5%", left: "5%" }}
        >
          🐢
        </div>
        <div
          className="absolute text-[90px] opacity-[0.03] leading-none select-none login-bg-turtle"
          style={{ top: "15%", right: "8%", animationDelay: "2s" }}
        >
          🐢
        </div>
        <div
          className="absolute text-[140px] opacity-[0.035] leading-none select-none login-bg-turtle"
          style={{ bottom: "10%", left: "12%", animationDelay: "4s" }}
        >
          🐢
        </div>
        <div
          className="absolute text-[80px] opacity-[0.025] leading-none select-none login-bg-turtle"
          style={{ bottom: "20%", right: "5%", animationDelay: "1s" }}
        >
          🐢
        </div>
        <div
          className="absolute text-[60px] opacity-[0.03] leading-none select-none login-bg-turtle"
          style={{ top: "45%", left: "2%", animationDelay: "3s" }}
        >
          🐢
>>>>>>> develop:src/app/login/page.tsx
        </div>
      </div>

      {/* 카드 */}
      <Card
        className="relative z-10 w-[460px] max-w-full px-11 pt-12 pb-10 rounded-[28px]"
        style={{
          boxShadow: "0 24px 80px rgba(74,124,89,0.18), 0 4px 20px rgba(74,124,89,0.08)",
        }}
      >
        {/* 브랜딩 */}
        <div className="flex flex-col items-center mb-7" style={{ fontFamily: "Nunito, sans-serif" }}>
          <div
            className="text-[56px] mb-3 login-turtle-bounce"
            style={{ filter: "drop-shadow(0 4px 12px rgba(74,124,89,0.25))" }}
          >
            🐢
          </div>
          <h1 className="text-[30px] font-black text-[var(--green)] tracking-tight">거북목 거북거북!</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">AI 자세 교정 프로그램</p>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex-1 h-px bg-[var(--green-border)]" />
          <span className="text-xs text-[var(--text-muted)] font-semibold whitespace-nowrap">간편하게 시작하기</span>
          <div className="flex-1 h-px bg-[var(--green-border)]" />
        </div>

        {/* 로그인 버튼 */}
        <div className="flex flex-col gap-2.5">
          <OauthButton provider="github" variant="login" />
          <OauthButton provider="google" variant="login" />
        </div>

        {/* 푸터 */}
        <p
          className="text-center mt-5 text-[11px] text-[var(--text-muted)] leading-relaxed"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          로그인 시{" "}
          <Link href="/terms" className="text-[var(--green)] no-underline font-semibold">
            이용약관
          </Link>{" "}
          및{" "}
          <Link href="/privacy" className="text-[var(--green)] no-underline font-semibold">
            개인정보처리방침
          </Link>
          에
          <br />
          동의하는 것으로 간주됩니다.
        </p>
      </Card>
    </div>
  );
}
