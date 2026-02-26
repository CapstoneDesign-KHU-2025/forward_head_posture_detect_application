"use client";

import React from "react";

import OauthButton from "@/components/molecules/OauthButton";
import TurtleLogo from "@/components/molecules/TurtleLogo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#F8FBF8] w-screen flex items-center justify-center p-8">
      <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-12 max-w-[450px] w-full">
        <div className="text-center flex flex-col items-center mb-8 gap-2">
          <TurtleLogo iconSize="2xl" />
          <h1 className="text-[1.8rem] text-[#2D5F2E] mb-2">거북목 거북거북!</h1>
          <p className="text-[#4F4F4F] text-[1.1rem]">AI 자세 교정 프로그램</p>
        </div>

        <div className="mt-8">
          <div className="text-center mb-8">
            <h2 className="text-[1.5rem] text-[#1A1A1A] mb-2">거북목 관리를 시작해보세요</h2>
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
