"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { BrandLink } from "@/components/atoms/BrandLink";
import { useSession, signIn } from "next-auth/react";
import { FriendsButton } from "@/components/molecules/FriendsButton";
import { UserButton } from "@/components/molecules/UserButton";
import { FriendsModal } from "@/components/organisms/friends/FriendsModal";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useState } from "react";
type HeaderProps = {
  user?: { name: string; avatarSrc?: string } | null;
  className?: string;
};
export default function Header({ user: initialUser, className }: HeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
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

  const UserActions = () => {
    if (isLoading) {
      return <span className="text-sm text-black/40">...</span>;
    }

    if (!user) {
      return <Button onClick={() => signIn()}>로그인</Button>;
    }

    return (
      <>
        <FriendsButton
          requestCount={friendsData?.incomingCount || 0}
          onClick={() => setIsFriendsModalOpen(true)}
        />
        <UserButton
          user={{
            name: user.name ?? "사용자",
            email: (user as any)?.email,
            image: (user as any)?.image,
            avatarSrc: (user as any)?.avatarSrc,
          }}
        />
        <FriendsModal
          isOpen={isFriendsModalOpen}
          onClose={() => setIsFriendsModalOpen(false)}
          friendsData={friendsData || undefined}
        />
      </>
    );
  };

  // 로그인, 캐릭터 선택, 랜딩 페이지에서는 헤더 숨김 (각 페이지에서 자체 네비게이션 사용)
  if (isLoginPage || isCharacterPage || isLandingPage) return null;

  return (
    <header
      className={["fixed top-0 left-0 right-0 w-full z-50 bg-[var(--green-pale)]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-full px-6 md:px-8">
        {isLandingPage ? (
          // 랜딩 페이지: 로고와 프로필만 있는 간단한 레이아웃
          <div className="flex h-[var(--header-height)] w-full items-center justify-between">
            <BrandLink
              icon={<img src="/icons/turtle.png" alt="" className="object-contain shrink-0" />}
              label="거북목 거북거북!"
            />
            <div className="flex items-center gap-2">
              <UserActions />
            </div>
          </div>
        ) : (
          // 일반 페이지: 좌 로고 / 중앙 탭 / 우측 아이콘 & 프로필
          <div className="relative flex h-[var(--header-height)] w-full items-center justify-between">
            {/* Left: Logo & brand */}
            <BrandLink
              icon={<img src="/icons/turtle.png" alt="" className="object-contain shrink-0" />}
              label="거북목 거북거북!"
            />

            {/* Center: 네비게이션 탭 */}
            <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
              {navItems.map((item) => {
                const isActive = (pathname ?? "/") === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "px-4 py-[7px] rounded-[10px] text-base font-semibold transition-colors duration-150",
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
            <div className="flex items-center gap-2">
              <UserActions />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
