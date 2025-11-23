"use client";

import * as React from "react";
import { Settings, LogOut, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import SensitivitySettingsModal from "./SensitivitySettingsModal";
import CharacterSelectionModal from "./CharacterSelectionModal";

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
  const [isSensitivityModalOpen, setIsSensitivityModalOpen] = React.useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  React.useEffect(() => {
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
        className={`absolute right-0 top-[calc(100%+0.8rem)] min-w-[280px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2 border-[#E8F5E9] z-50 transition-all duration-300 ease-in-out ${
          isOpen 
            ? "opacity-100 visible translate-y-0" 
            : "opacity-0 invisible -translate-y-2.5"
        }`}
      >
        {/* 프로필 헤더 */}
        <div className="px-6 py-6 border-b-2 border-[#F0F9F0] flex items-center gap-4">
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="w-[50px] h-[50px] rounded-full"
            />
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
            {userEmail && (
              <div className="text-sm text-[#4F4F4F] truncate">{userEmail}</div>
            )}
          </div>
        </div>

        {/* 메뉴 항목들 */}
        <div className="py-2">
          <button
            onClick={() => {
              setIsSensitivityModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-black transition-all duration-200 hover:bg-[#F8FBF8] hover:pl-7 cursor-pointer"
          >
            <Settings size={20} className="text-black" />
            <span>민감도 설정</span>
          </button>

          <button
            onClick={() => {
              setIsCharacterModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-black border-t-2 border-[#F0F9F0] transition-all duration-200 hover:bg-[#F8FBF8] hover:pl-7 cursor-pointer"
          >
            <UserCircle size={20} className="text-black" />
            <span>캐릭터 변경</span>
          </button>

          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-black border-t-2 border-[#F0F9F0] transition-all duration-200 hover:bg-[#F8FBF8] hover:pl-7 cursor-pointer"
          >
            <LogOut size={20} className="text-black" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      <SensitivitySettingsModal
        isOpen={isSensitivityModalOpen}
        onClose={() => setIsSensitivityModalOpen(false)}
      />
      <CharacterSelectionModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
      />
    </>
  );
}
