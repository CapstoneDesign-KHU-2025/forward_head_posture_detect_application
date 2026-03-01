"use client";

import React from "react";

import { Icon } from "@/components/atoms/Icon";
import OauthButton from "@/components/molecules/OauthButton";
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
        </div>
      </div>
    </div>
  );
}
