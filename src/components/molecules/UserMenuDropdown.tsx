"use client";

import * as React from "react";
import { Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import SensitivitySettingsModal from "./SensitivitySettingsModal";

type UserMenuDropdownProps = {
  userName: string;
  userEmail?: string;
  userImage?: string;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement>;
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

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-black/10 z-50"
      >
        {/* 사용자 정보 섹션 */}
        <div className="px-4 py-3 border-b border-black/10">
          <div className="flex items-center gap-3">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-black">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-black truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-black/60 truncate">{userEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* 메뉴 항목들 */}
        <div className="py-1">
          <button
            onClick={() => {
              setIsSensitivityModalOpen(true);
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-black hover:bg-black/5 flex items-center gap-3 transition-colors"
          >
            <Settings size={18} className="text-black/60" />
            <span>민감도 설정</span>
          </button>

          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-black hover:bg-black/5 flex items-center gap-3 transition-colors"
          >
            <LogOut size={18} className="text-black/60" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      <SensitivitySettingsModal
        isOpen={isSensitivityModalOpen}
        onClose={() => setIsSensitivityModalOpen(false)}
      />
    </>
  );
}
