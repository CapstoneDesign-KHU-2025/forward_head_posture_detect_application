"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isCharacterPage = pathname === "/character";
  const isLandingPage = pathname === "/landing";
  
  // 로그인 페이지, 캐릭터 선택 페이지, 랜딩 페이지를 제외한 모든 페이지에 헤더 높이만큼 상단 마진
  if (isLoginPage || isCharacterPage || isLandingPage) {
    return <div className="w-full">{children}</div>;
  }
  
  return <div className="w-full pt-18">{children}</div>;
}

