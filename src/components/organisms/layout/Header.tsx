"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NavItem from "@/components/molecules/NavItem";

import { Button } from "@/components/atoms/button/Button";
import { Home, Play } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
type HeaderProps = {
  user?: { name: string; avatarSrc?: string } | null;
  className?: string;
};
export default function Header({ user: initialUser, className }: HeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navItems = [
    { label: "Home", href: "/", icon: <Home size={18} /> },
    { label: "Estimate", href: "/estimate", icon: <Play size={18} /> },
  ];

  const isLoading = status === "loading";
  const user = session?.user ?? initialUser ?? null;
  return (
    <header className={["w-full border-b border-black/10 bg-white", className].filter(Boolean).join(" ")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-4">
        {/* Left: Logo */}
        <Link href="/" className="shrink-0 text-lg font-semibold">
          거북목 거북거북!
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} active={(pathname ?? "/") === item.href}>
              {item.label}
            </NavItem>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="text-sm text-black/40">...</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm">
                {user.name ?? "사용자"}
              </span>
              <Button variant="secondary" onClick={() => signOut()}>
                로그아웃
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn()}>로그인</Button>
          )}
        </div>
      </div>
    </header>
  );
}
