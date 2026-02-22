"use client";

import { useState, useEffect } from "react";
import { Toast } from "@/components/common/Toast";
import { FriendsModalHeader } from "./FriendsModalHeader";
import { SearchResultList } from "./SearchResultList";
import { IncomingRequestList } from "./IncomingRequestList";
import { OutgoingRequestList } from "./OutgoingRequestList";
import { FriendList } from "./FriendList";
import { useFriendsData } from "@/hooks/useFriendsData";
import { cn } from "@/utils/cn";

type TabId = "search" | "requests" | "friends";

export type FriendsModalData = ReturnType<typeof useFriendsData>;

type FriendsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  friendsData?: FriendsModalData;
};

export function FriendsModal({ isOpen, onClose, friendsData: externalData }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("search");

  const internalData = useFriendsData();
  const data = externalData ?? internalData;

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
  } = data;

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

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center p-4",
          "bg-black/40 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      >
        <div
          className={cn(
            "flex h-[500px] w-full max-w-[480px] flex-col overflow-hidden",
            "rounded-2xl bg-white shadow-2xl",
            "transform transition-all duration-200",
            isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
          )}
          onClick={(e) => e.stopPropagation()}
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
      </div>

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
}
