"use client";

import { useState, useEffect } from "react";
import { ModalBackdrop } from "@/components/common/ModalBackdrop";
import { Toast } from "@/components/common/Toast";
import { FriendsModalHeader } from "./FriendsModalHeader";
import { SearchResultList } from "./SearchResultList";
import { IncomingRequestList } from "./IncomingRequestList";
import { OutgoingRequestList } from "./OutgoingRequestList";
import { FriendList } from "./FriendList";
import { useFriendsData } from "@/hooks/useFriendsData";
import { cn } from "@/utils/cn";

type TabId = "search" | "requests" | "friends";

type FriendsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FriendsModal({ isOpen, onClose }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("search");

  const {
    friends,
    incoming,
    outgoing,
    incomingCount,
    searchResults,
    sendRequest,
    cancelRequest,
    acceptRequest,
    declineRequest,
    deleteFriend,
    toastMessage,
    isToastVisible,
  } = useFriendsData();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop isOpen={isOpen} onClose={onClose} />
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-[101] flex h-[500px] w-[min(480px,95vw)] -translate-x-1/2 -translate-y-1/2",
          "flex-col overflow-hidden rounded-[24px] bg-white",
          "shadow-[0_20px_60px_rgba(74,124,89,0.2)]"
        )}
      >
        <FriendsModalHeader
          activeTab={activeTab}
          incomingCount={incomingCount}
          onTabChange={setActiveTab}
          onClose={onClose}
        />

        {activeTab === "search" ? (
          <SearchResultList
            searchResults={searchResults}
            onSendRequest={sendRequest}
          />
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-3 [scrollbar-color:#d4ead9_transparent] [scrollbar-width:thin]">
            {activeTab === "requests" ? (
              <>
                <IncomingRequestList
                  items={incoming}
                  onAccept={acceptRequest}
                  onDecline={declineRequest}
                />
                <div className="mt-5">
                  <OutgoingRequestList items={outgoing} onCancel={cancelRequest} />
                </div>
              </>
            ) : (
              <FriendList friends={friends} onDelete={deleteFriend} />
            )}
          </div>
        )}
      </div>

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
}
