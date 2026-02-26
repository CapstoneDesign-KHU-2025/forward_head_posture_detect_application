"use client";

import { useState, useCallback, useMemo } from "react";
import type { Friend, FriendRequestRow } from "@/types/friends";
import {
  MOCK_FRIENDS,
  MOCK_INCOMING,
  MOCK_OUTGOING,
  MOCK_SEARCH_POOL,
  MOCK_RELATION,
} from "@/mocks/friends";

type RelationStatus = "NONE" | "OUTGOING" | "INCOMING" | "FRIEND";

export type SearchResultItem = {
  id: string;
  name: string | null;
  image: string | null;
  initial: string;
  color: string;
  relation: RelationStatus;
};

export function useFriendsData() {
  const [friends, setFriends] = useState<Friend[]>(() => [...MOCK_FRIENDS]);
  const [incoming, setIncoming] = useState<FriendRequestRow[]>(() => [...MOCK_INCOMING]);
  const [outgoing, setOutgoing] = useState<FriendRequestRow[]>(() => [...MOCK_OUTGOING]);
  const [relation, setRelation] = useState<Record<string, RelationStatus>>(() => ({ ...MOCK_RELATION }));

  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    const timer = setTimeout(() => {
      setIsToastVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const incomingCount = incoming.filter((r) => r.status === "PENDING").length;

  const searchResults = useCallback(
    (query: string): SearchResultItem[] => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];

      return MOCK_SEARCH_POOL.filter((u) => {
        const status = relation[u.id] ?? "NONE";
        if (status === "FRIEND" || status === "INCOMING") return false;
        const matchName = (u.name ?? "").toLowerCase().includes(q);
        const matchId = u.id.toLowerCase().includes(q);
        return matchName || matchId;
      }).map((u) => ({
        id: u.id,
        name: u.name,
        image: u.image,
        initial: u.initial ?? u.name?.charAt(0) ?? "?",
        color: u.color ?? "#6aab7a",
        relation: (relation[u.id] ?? "NONE") as RelationStatus,
      }));
    },
    [relation]
  );

  const sendRequest = useCallback(
    (user: SearchResultItem) => {
      setRelation((prev) => ({ ...prev, [user.id]: "OUTGOING" }));
      setOutgoing((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          status: "PENDING",
          fromUser: { id: "me", name: "Jimin Nam", image: null },
          toUser: { id: user.id, name: user.name, image: user.image },
        },
      ]);
      showToast(`${user.name ?? "친구"}님께 친구 요청을 보냈어요! 🐢`);
    },
    [showToast]
  );

  const cancelRequest = useCallback(
    (requestId: string, toUserId: string, toUserName: string | null) => {
      setRelation((prev) => ({ ...prev, [toUserId]: "NONE" }));
      setOutgoing((prev) => prev.filter((r) => r.id !== requestId));
      showToast(`${toUserName ?? "친구"}님께 보낸 요청을 취소했어요`);
    },
    [showToast]
  );

  const acceptRequest = useCallback(
    (requestId: string, fromUser: { id: string; name: string | null; image: string | null }) => {
      setIncoming((prev) => prev.filter((r) => r.id !== requestId));
      setRelation((prev) => ({ ...prev, [fromUser.id]: "FRIEND" }));
      setFriends((prev) => [
        { friendshipId: `fr-${Date.now()}`, user: fromUser },
        ...prev,
      ]);
      showToast(`${fromUser.name ?? "친구"}님과 친구가 됐어요! 🎉`);
    },
    [showToast]
  );

  const declineRequest = useCallback(
    (requestId: string, fromUserId: string) => {
      setRelation((prev) => ({ ...prev, [fromUserId]: "NONE" }));
      setIncoming((prev) => prev.filter((r) => r.id !== requestId));
      showToast("요청을 거절했어요");
    },
    [showToast]
  );

  const deleteFriend = useCallback(
    (friendshipId: string, user: { id: string; name: string | null }) => {
      setRelation((prev) => ({ ...prev, [user.id]: "NONE" }));
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      showToast(`${user.name ?? "친구"}님을 친구 목록에서 삭제했어요`);
    },
    [showToast]
  );

  return {
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
    showToast,
  };
}
