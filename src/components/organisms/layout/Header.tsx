"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { Home, Play } from "lucide-react";
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
    { label: "Home", href: "/", icon: <Home size={18} /> },
    { label: "Estimate", href: "/estimate", icon: <Play size={18} /> },
  ];

  const isLoading = status === "loading";
  const user = session?.user ?? initialUser ?? null;
  const isLandingPage = pathname === "/landing";
  const isLoginPage = pathname === "/login";
  const isCharacterPage = pathname === "/character";

  // 로그인 페이지와 캐릭터 선택 페이지에서는 헤더 숨김
  if (isLoginPage || isCharacterPage) return null;

  return (
    <header
      className={["fixed top-0 left-0 right-0 w-full bg-white z-50", className].filter(Boolean).join(" ")}
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
      <div className="mx-auto max-w-[1400px] px-8 py-4">
        {isLandingPage ? (
          // 랜딩 페이지: 로고와 프로필만 있는 간단한 레이아웃
          <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold"
                style={{ color: "#2D5F2E", textDecoration: "none" }}
              >
                <TurtleLogo size="s" />
                <span>거북목 거북거북!</span>
              </Link>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <span className="text-sm text-black/40">...</span>
              ) : user ? (
                <>
                  <FriendRequestIndicator
                    requestCount={friendsData.incomingCount}
                    onClick={() => setIsFriendsModalOpen(true)}
                  />
                  <div className="relative" ref={userMenuAnchorRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex h-11 min-h-11 items-center bg-[#E8F5E9] text-[#2D5F2E] border-2 border-[#7BC67E] px-5 py-2 rounded-[25px] font-semibold cursor-pointer transition-all duration-300 text-base hover:bg-[#7BC67E] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(123,198,126,0.3)]"
                  >
                    {user.name ?? "사용자"}
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
              ) : (
                <Button onClick={() => signIn()}>로그인</Button>
              )}
            </div>
          </div>
        ) : (
          // 일반 페이지: 3열 그리드 레이아웃
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            {/* Left: Logo */}
            <div className="flex items-center justify-start">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold"
                style={{ color: "#2D5F2E", textDecoration: "none" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E8F5E9" }}
                >
                  <img src="/icons/turtle.png" alt="거북이" className="w-8 h-8 object-contain" />
                </div>
                <span>거북목 거북거북!</span>
              </Link>
            </div>

            {/* Center: 네비게이션 */}
            <nav className="flex items-center justify-center gap-8">
              {navItems.map((item) => {
                const isActive = (pathname ?? "/") === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-base font-medium transition-all duration-300 ${
                      isActive ? "text-[#2D5F2E] font-semibold" : "text-[#4F4F4F] hover:text-[#2D5F2E]"
                    }`}
                    style={{ textDecoration: "none" }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: 프로필 */}
            <div className="flex items-center justify-end gap-2">
              {isLoading ? (
                <span className="text-sm text-black/40">...</span>
              ) : user ? (
                <>
                  <FriendRequestIndicator
                    requestCount={friendsData.incomingCount}
                    onClick={() => setIsFriendsModalOpen(true)}
                  />
                  <div className="relative" ref={userMenuAnchorRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex h-11 min-h-11 items-center bg-[#E8F5E9] text-[#2D5F2E] border-2 border-[#7BC67E] px-5 py-2 rounded-[25px] font-semibold cursor-pointer transition-all duration-300 text-base hover:bg-[#7BC67E] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(123,198,126,0.3)]"
                  >
                    {user.name ?? "사용자"}
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
              ) : (
                <Button onClick={() => signIn()}>로그인</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
