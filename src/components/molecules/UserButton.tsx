"use client";

import { useRef, useState } from "react";
import { UserAvatar } from "@/components/atoms/UserAvatar";
import UserMenuDropdown from "@/components/molecules/UserMenuDropdown";

type UserButtonProps = {
  user: { name: string; email?: string; image?: string; avatarSrc?: string };
  className?: string;
};

export function UserButton({ user, className }: UserButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className={["relative", className].filter(Boolean).join(" ")} ref={anchorRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center rounded-full bg-transparent border-none p-0 cursor-pointer select-none focus:outline-none transition-opacity duration-150 hover:opacity-80"
        aria-label="사용자 메뉴"
      >
        <UserAvatar
          initial={user.name ?? "사용자"}
          bgColor="var(--green)"
          className="h-[34px] w-[34px] text-[14px] font-bold"
        />
      </button>
      <UserMenuDropdown
        userName={user.name ?? "사용자"}
        userEmail={user.email}
        userImage={user.image || user.avatarSrc}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={anchorRef}
      />
    </div>
  );
}
