"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { useSession, signIn } from "next-auth/react";
import UserMenuDropdown from "@/components/molecules/UserMenuDropdown";
import TurtleLogo from "@/components/molecules/TurtleLogo";
import { FriendRequestIndicator } from "@/components/molecules/FriendRequestIndicator";
import { FriendsModal } from "@/components/organisms/friends/FriendsModal";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useRef, useState } from "react";
type HeaderProps = {
  user?: { name: string; avatarSrc?: string } | null;
  className?: string;
};
export default function Header({ user: initialUser, className }: HeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const userMenuAnchorRef = useRef<HTMLDivElement>(null);
  const friendsData = useFriendsData(); 

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Estimate", href: "/estimate" },
  ];

  const isLoading = status === "loading";
  const user = session?.user ?? initialUser ?? null;
  const isLandingPage = pathname === "/landing";
  const isLoginPage = pathname === "/login";
  const isCharacterPage = pathname === "/character";

  const Brand = () => (
    <div className="flex items-center gap-2">
      <TurtleLogo size="s" />
      <span
        className="text-[20px] font-extrabold"
        style={{ fontFamily: "Nunito, sans-serif", color: "var(--green)" }}
      >
        거북목 거북거북!
      </span>
    </div>
  );

  const UserActions = () => {
    if (isLoading) {
      return <span className="text-sm text-black/40">...</span>;
    }

    if (!user) {
      return <Button onClick={() => signIn()}>로그인</Button>;
    }

    return (
      <>
        <FriendRequestIndicator
          requestCount={friendsData.incomingCount}
          onClick={() => setIsFriendsModalOpen(true)}
        />
        <div className="relative" ref={userMenuAnchorRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green)] text-white font-semibold cursor-pointer transition-colors duration-200 hover:bg-[var(--green-dark)]"
          >
            {(user.name ?? "사용자").charAt(0)}
          </button>
          <UserMenuDropdown
            userName={user.name ?? "사용자"}
            userEmail={(user as any)?.email}
            userImage={(user as any)?.image || (user as any)?.avatarSrc}
            isOpen={isUserMenuOpen}
            onClose={() => setIsUserMenuOpen(false)}
            anchorRef={userMenuAnchorRef}
          />
        </div>
        <FriendsModal
          isOpen={isFriendsModalOpen}
          onClose={() => setIsFriendsModalOpen(false)}
          friendsData={friendsData}
        />
      </>
    );
  };

  // 로그인 페이지와 캐릭터 선택 페이지에서는 헤더 숨김
  if (isLoginPage || isCharacterPage) return null;

  return (
    <header
      className={["fixed top-0 left-0 right-0 w-full z-50 bg-[var(--green-pale)]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto max-w-[1400px] px-8">
        {isLandingPage ? (
          // 랜딩 페이지: 로고와 프로필만 있는 간단한 레이아웃
          <div className="flex h-[var(--header-height)] items-center">
            <Brand />
            <div className="ml-auto flex items-center gap-2">
              <UserActions />
            </div>
          </div>
        ) : (
          // 일반 페이지: 좌 로고 / 중앙 탭 / 우측 아이콘 & 프로필
          <div className="relative flex h-[var(--header-height)] items-center">
            {/* Left: Logo & brand */}
            <Brand />

            {/* Center: 네비게이션 탭 */}
            <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
              {navItems.map((item) => {
                const isActive = (pathname ?? "/") === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "px-4 py-[7px] rounded-[10px] text-[15px] font-semibold transition-colors duration-150",
                      isActive
                        ? "bg-[var(--green-light)] text-[var(--green)]"
                        : "text-[var(--text-sub)] hover:bg-[var(--green-light)] hover:text-[var(--green)]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ textDecoration: "none" }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: 친구 아이콘 + 프로필 */}
            <div className="ml-auto flex items-center gap-2">
              <UserActions />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
