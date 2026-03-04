"use client";

import { usePathname } from "@/i18n/navigation";
import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isCharacterPage = pathname === "/character";

  if (isLoginPage || isCharacterPage) {
    return <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">{children}</main>;
  }

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto pt-[var(--header-height)]">{children}</main>
  );
}
