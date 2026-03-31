"use client";

import { useRef, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import UserMenuDropdown from "@/app/[locale]/components/header/UserMenuDropdown";
import { useTranslations } from "next-intl";
type UserButtonProps = {
  user: { name: string; email?: string; image?: string; avatarSrc?: string };
  className?: string;
};

export function UserButton({ user, className }: UserButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Basic");

  return (
    <div className={["relative", className].filter(Boolean).join(" ")} ref={anchorRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center rounded-full bg-transparent border-none p-0 cursor-pointer select-none focus:outline-none transition-opacity duration-150 hover:opacity-80"
        aria-label={t("usermenu")}
      >
        <UserAvatar
          initial={user.name ?? t("user")}
          bgColor="var(--green)"
          className="h-[34px] w-[34px] text-[14px] font-bold"
        />
      </button>
      <UserMenuDropdown
        userName={user.name ?? t("user")}
        userEmail={user.email}
        userImage={user.image || user.avatarSrc}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={anchorRef}
      />
    </div>
  );
}
