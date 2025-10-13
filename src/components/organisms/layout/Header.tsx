"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NavItem from "@/components/molecules/NavItem";
import SearchBar from "@/components/molecules/SearchBar";
import { Button } from "@/components/atoms/button/Button";
import { Home, BarChart2, Play } from "lucide-react";

type HeaderProps = {
  user?: { name: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  className?: string;
};

export default function Header({ user, onLogin, onLogout, className }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home",     href: "/",         icon: <Home size={18} /> },
    { label: "Estimate", href: "/estimate", icon: <Play size={18} /> },
    { label: "Metrics",  href: "/metrics",  icon: <BarChart2 size={18} /> },
  ];

  return (
    <header className={["w-full border-b border-black/10 bg-white", className].filter(Boolean).join(" ")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-4">
        {/* Left: Logo */}
        <Link href="/" className="shrink-0 text-lg font-semibold">
          거북목 거북거북!
        </Link>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={(pathname ?? "/") === item.href}
            >
              {item.label}
            </NavItem>
          ))}
        </nav>

        {/* Right: Search + User/Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-64">
            <SearchBar placeholder="Search in site" />
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {/* 이름 배지 */}
              <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm">
                {user.name}
              </span>
              {onLogout && (
                <Button variant="secondary" onClick={onLogout}>
                  로그아웃
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={onLogin}>로그인</Button>
          )}
        </div>
      </div>
    </header>
  );
}