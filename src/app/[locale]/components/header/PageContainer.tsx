"use client";

import { usePathname } from "@/i18n/navigation";
import { ReactNode } from "react";

const styles = {
  login_character: "flex min-h-0 w-full flex-1 flex-col overflow-y-auto",
  default: "flex min-h-0 w-full flex-1 flex-col overflow-y-auto pt-[var(--header-height)]",
  
}
type PageContainerProps = {
  children: ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isCharacterPage = pathname === "/character";

  
  if (isLoginPage || isCharacterPage) {
    return <main className={styles.login_character}>{children}</main>;
  }

  return (
    <main className={styles.default}>{children}</main>
  );
}
