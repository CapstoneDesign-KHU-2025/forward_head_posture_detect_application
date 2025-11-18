"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NavItem from "@/components/molecules/NavItem";

import { Button } from "@/components/atoms/button/Button";
import { Home, Play } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import UserMenuDropdown from "@/components/molecules/UserMenuDropdown";
type HeaderProps = {
  user?: { name: string; avatarSrc?: string } | null;
  className?: string;
};
export default function Header({ user: initialUser, className }: HeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuAnchorRef = React.useRef<HTMLDivElement>(null);

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
        <Link href="/" className="shrink-0 flex items-center gap-2 text-lg font-semibold">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: "#EAFBE8" }}
          >
            <img
              src="/icons/turtle.png"
              alt="거북이"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span>거북목 거북거북!</span>
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
            <div className="relative" ref={userMenuAnchorRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm hover:bg-black/10 transition-colors"
              >
                {user.name ?? "사용자"}
              </button>
              <UserMenuDropdown
                userName={user.name ?? "사용자"}
                userEmail={(user as any)?.email}
                userImage={user.avatarSrc}
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                anchorRef={userMenuAnchorRef}
              />
            </div>
          ) : (
            <Button onClick={() => signIn()}>로그인</Button>
          )}
        </div>
      </div>
    </header>
  );
}
