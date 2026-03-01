"use client";

import { usePathname } from "next/navigation";

type FooterProps = {
  links: { label: string; href: string; underline?: boolean }[];
  className?: string;
};

export default function Footer({ links, className }: FooterProps) {
  const pathname = usePathname();

  // 랜딩 페이지는 LandingTemplate 내부에 푸터 포함 (스크롤 끝에 배치)
  if (pathname === "/landing") return null;

  return null;
}
