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

  // 로그인 페이지, 캐릭터 선택 페이지를 제외한 모든 페이지에 fixed 헤더 높이만큼 상단 패딩을 준다.
  if (isLoginPage || isCharacterPage) {
    return <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">{children}</div>;
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto pt-[var(--header-height)]">{children}</div>
  );
}

