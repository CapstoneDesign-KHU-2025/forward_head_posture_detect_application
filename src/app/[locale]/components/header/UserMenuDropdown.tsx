"use client";

import { Icon } from "@/components/Icon";
import { Settings, LogOut, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import SensitivitySettingsModal from "@/app/[locale]/components/header/SensitivitySettingsModal";
import CharacterSelectionModal from "@/app/[locale]/components/header/CharacterSelectionModal";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import Image from "next/image";
type UserMenuDropdownProps = {
  userName: string;
  userEmail?: string;
  userImage?: string;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
};

export default function UserMenuDropdown({
  userName,
  userEmail,
  userImage,
  isOpen,
  onClose,
  anchorRef,
}: UserMenuDropdownProps) {
  const t = useTranslations("useMenuDropdown");
  const [isSensitivityModalOpen, setIsSensitivityModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  return (
    <>
      <div
        ref={dropdownRef}
        className={`absolute right-0 top-[calc(100%+0.8rem)] min-w-[280px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2.5"
        }`}
      >
        <div className="px-6 py-6 flex items-center gap-4">
          {userImage ? (
            <div className="w-[50px] h-[50px] rounded-full relative overflow-hidden">
              <Image src={userImage} alt={userName} fill />
            </div>
          ) : (
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7BC67E 0%, #4A9D4D 100%)" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-[#2D5F2E] mb-1 truncate">{userName}</div>
            {userEmail && <div className="text-sm text-[#4F4F4F] truncate">{userEmail}</div>}
          </div>
        </div>

        <div className="py-2 px-2 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => {
              setIsSensitivityModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-black transition-colors duration-150 hover:bg-[var(--green-pale)] cursor-pointer text-left"
          >
            <Icon size="sm">
              <Settings className="text-black shrink-0" />
            </Icon>
            <span>{t("menu.sensitivity")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsCharacterModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-black transition-colors duration-150 hover:bg-[var(--green-pale)] cursor-pointer text-left"
          >
            <Icon size="sm">
              <UserCircle className="text-black shrink-0" />
            </Icon>
            <span>{t("menu.change_character")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              signOut();
              onClose();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-black transition-colors duration-150 hover:bg-[var(--green-pale)] cursor-pointer text-left"
          >
            <Icon size="sm">
              <LogOut className="text-black shrink-0" />
            </Icon>
            <span>{t("menu.logout")}</span>
          </button>
        </div>
      </div>

      <SensitivitySettingsModal isOpen={isSensitivityModalOpen} onClose={() => setIsSensitivityModalOpen(false)} />
      <CharacterSelectionModal isOpen={isCharacterModalOpen} onClose={() => setIsCharacterModalOpen(false)} />
    </>
  );
}
