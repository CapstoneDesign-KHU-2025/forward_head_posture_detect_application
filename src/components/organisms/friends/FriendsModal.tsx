"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Modal } from "@/components/atoms/Modal";
import { ModalHeader } from "@/components/atoms/ModalHeader";
import { ModalTabBar } from "@/components/organisms/friends/ModalTabBar";
import { Toast } from "@/components/atoms/Toast";
import { SearchResultList } from "@/components/organisms/friends/SearchResultList";
import { IncomingRequestList } from "@/components/organisms/friends/IncomingRequestList";
import { OutgoingRequestList } from "@/components/organisms/friends/OutgoingRequestList";
import { FriendList } from "@/components/organisms/friends/FriendList";
import { useFriendsData } from "@/hooks/useFriendsData";

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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} contentClassName="h-[500px] max-w-[480px]">
        <div className="flex shrink-0 flex-col border-b border-[#d4ead9] bg-white">
          <ModalHeader
            title="친구 관리"
            subtitle="친구와 함께 거북목 탈출!"
            icon={<Users size={18} className="text-[#4a7c59]" strokeWidth={2.2} />}
            onClose={onClose}
          />
          <div className="px-6">
            <ModalTabBar
              activeTab={activeTab}
              incomingCount={incomingCount}
              onTabChange={setActiveTab}
            />
          </div>
        </div>

        {activeTab === "search" ? (
          <SearchResultList searchResults={searchResults} onSendRequest={sendRequest} />
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-3 [scrollbar-color:#d4ead9_transparent] [scrollbar-width:thin]">
            {activeTab === "requests" ? (
              <>
                <IncomingRequestList items={incoming} onAccept={acceptRequest} onDecline={declineRequest} />
                <div className="mt-5">
                  <OutgoingRequestList items={outgoing} onCancel={cancelRequest} />
                </div>
              </>
            ) : (
              <FriendList friends={friends} onDelete={deleteFriend} />
            )}
          </div>
        )}
      </Modal>

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
}
