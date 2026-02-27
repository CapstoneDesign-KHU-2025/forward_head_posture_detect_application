"use client";

import { useState, useCallback, useEffect, useMemo, useRef, useActionState } from "react";
import type { Friend, FriendRequestRow, RelationStatus, SearchUser } from "@/types/friends";
import { searchUsersAction } from "@/app/actions/friendsActions";

export type SearchResultItem = {
  id: string;
  name: string | null;
  image: string | null;
  email?: string | null;
  initial: string;
  color: string;
  relation: RelationStatus | "NONE";
};

type FriendsApiResponse = {
  ok: boolean;
  friends?: Friend[];
  error?: string;
};

type FriendRequestsApiResponse = {
  ok: boolean;
  rows?: FriendRequestRow[];
  error?: string;
};

type SearchUsersApiResponse = {
  ok?: boolean;
  users?: SearchUser[];
  error?: string | { ko: string; en: string };
};

function buildRelationMap(
  friendsList: Friend[],
  incomingList: FriendRequestRow[],
  outgoingList: FriendRequestRow[],
): Record<string, RelationStatus> {
  const map: Record<string, RelationStatus> = {};

  friendsList.forEach((f) => {
    map[f.user.id] = "FRIEND";
  });

  incomingList
    .filter((r) => r.status === "PENDING")
    .forEach((r) => {
      if (!map[r.fromUser.id]) {
        map[r.fromUser.id] = "INCOMING";
      }
    });

  outgoingList
    .filter((r) => r.status === "PENDING")
    .forEach((r) => {
      if (!map[r.toUser.id]) {
        map[r.toUser.id] = "OUTGOING";
      }
    });

  return map;
}

export function useFriendsData() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestRow[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestRow[]>([]);
  const [relation, setRelation] = useState<Record<string, RelationStatus>>({});
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const lastSearchQueryRef = useRef<string>("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [searchState, searchAction, isSearching] = useActionState(searchUsersAction, null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    const timer = setTimeout(() => {
      setIsToastVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        fetch("/api/friends", { cache: "no-store" }),
        fetch("/api/friends/requests?type=incoming&status=PENDING", { cache: "no-store" }),
        fetch("/api/friends/requests?type=outgoing&status=PENDING", { cache: "no-store" }),
      ]);

      const [friendsJson, incomingJson, outgoingJson] = await Promise.all([
        friendsRes.json() as Promise<FriendsApiResponse>,
        incomingRes.json() as Promise<FriendRequestsApiResponse>,
        outgoingRes.json() as Promise<FriendRequestsApiResponse>,
      ]);

      if (!friendsRes.ok || !(friendsJson as FriendsApiResponse).ok) {
        throw new Error((friendsJson as FriendsApiResponse).error || "Failed to load friends");
      }

      if (!incomingRes.ok || !(incomingJson as FriendRequestsApiResponse).ok) {
        throw new Error((incomingJson as FriendRequestsApiResponse).error || "Failed to load incoming requests");
      }

      if (!outgoingRes.ok || !(outgoingJson as FriendRequestsApiResponse).ok) {
        throw new Error((outgoingJson as FriendRequestsApiResponse).error || "Failed to load outgoing requests");
      }

      const friendsData = (friendsJson as FriendsApiResponse).friends ?? [];
      const incomingRows = (incomingJson as FriendRequestsApiResponse).rows ?? [];
      const outgoingRows = (outgoingJson as FriendRequestsApiResponse).rows ?? [];

      setFriends(friendsData);
      setIncoming(incomingRows);
      setOutgoing(outgoingRows);
      setRelation(buildRelationMap(friendsData, incomingRows, outgoingRows));
    } catch (error) {
      showToast("친구 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  }, [showToast]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const fetchSearchUsers = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setSearchUsers([]);
        lastSearchQueryRef.current = "";
        return;
      }

      if (trimmed === lastSearchQueryRef.current) return;
      lastSearchQueryRef.current = trimmed;

      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`, {
          cache: "no-store",
        });
        const json = (await res.json().catch(() => ({}))) as SearchUsersApiResponse;

        if (!res.ok || !json.ok) {
          showToast("사용자 검색에 실패했어요. 잠시 후 다시 시도해주세요.");
          setSearchUsers([]);
          return;
        }

        setSearchUsers(json.users ?? []);
      } catch {
        showToast("사용자 검색 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
        setSearchUsers([]);
      }
    },
    [showToast],
  );

  const processedSearchResults = useMemo<SearchResultItem[]>(() => {
    if (!searchUsers || searchUsers.length === 0) return [];

    return searchUsers
      .filter((u) => {
        const status = relation[u.id] ?? "NONE";
        return status !== "FRIEND" && status !== "INCOMING";
      })
      .map((u) => ({
        id: u.id,
        name: u.name,
        image: u.image,
        email: u.email,
        initial: u.name?.charAt(0) ?? "?",
        color: "#6aab7a",
        relation: (relation[u.id] ?? "NONE") as RelationStatus | "NONE",
      }));
  }, [searchUsers, relation]);

  const incomingCount = incoming.filter((r) => r.status === "PENDING").length;

  const searchResults = useCallback(
    (query: string): SearchResultItem[] => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];

      void fetchSearchUsers(query);

      return processedSearchResults
        .filter((u) => {
          const status = relation[u.id] ?? "NONE";
          if (status === "FRIEND" || status === "INCOMING") return false;
          const matchName = (u.name ?? "").toLowerCase().includes(q);
          const matchId = u.id.toLowerCase().includes(q);
          return matchName || matchId;
        })
        .map((u) => ({
          id: u.id,
          name: u.name,
          image: u.image,
          email: u.email,
          initial: u.initial ?? u.name?.charAt(0) ?? "?",
          color: u.color ?? "#6aab7a",
          relation: (relation[u.id] ?? "NONE") as RelationStatus | "NONE",
        }));
    },
    [fetchSearchUsers, processedSearchResults, relation],
  );

  const sendRequest = useCallback(
    async (user: SearchResultItem) => {
      try {
        const res = await fetch("/api/friends/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toUserId: user.id }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || "친구 요청을 보내지 못했어요.";
          showToast(message);
          return;
        }

        await refreshAll();
        showToast(`${user.name ?? "친구"}님께 친구 요청을 보냈어요! 🐢`);
      } catch {
        showToast("친구 요청 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      }
    },
    [refreshAll, showToast],
  );

  const cancelRequest = useCallback(
    async (requestId: string, toUserId: string, toUserName: string | null) => {
      try {
        const res = await fetch(`/api/friends/requests/${encodeURIComponent(requestId)}/cancel`, {
          method: "POST",
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || "친구 요청을 취소하지 못했어요.";
          showToast(message);
          return;
        }

        await refreshAll();
        setRelation((prev) => ({ ...prev, [toUserId]: "NONE" }));
        showToast(`${toUserName ?? "친구"}님께 보낸 요청을 취소했어요`);
      } catch {
        showToast("친구 요청을 취소하는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      }
    },
    [refreshAll, showToast],
  );

  const acceptRequest = useCallback(
    async (requestId: string, fromUser: { id: string; name: string | null; image: string | null }) => {
      try {
        const res = await fetch(`/api/friends/requests/${encodeURIComponent(requestId)}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ACCEPT" }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || "친구 요청 수락에 실패했어요.";
          showToast(message);
          return;
        }

        await refreshAll();
        showToast(`${fromUser.name ?? "친구"}님과 친구가 됐어요! 🎉`);
      } catch {
        showToast("친구 요청을 수락하는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      }
    },
    [refreshAll, showToast],
  );

  const declineRequest = useCallback(
    async (requestId: string, fromUserId: string) => {
      try {
        const res = await fetch(`/api/friends/requests/${encodeURIComponent(requestId)}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "REJECT" }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || "친구 요청 거절에 실패했어요.";
          showToast(message);
          return;
        }

        await refreshAll();
        setRelation((prev) => ({ ...prev, [fromUserId]: "NONE" }));
        showToast("요청을 거절했어요");
      } catch {
        showToast("친구 요청을 거절하는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      }
    },
    [refreshAll, showToast],
  );

  const deleteFriend = useCallback(
    async (friendshipId: string, user: { id: string; name: string | null }) => {
      try {
        const res = await fetch(`/api/friends/${encodeURIComponent(friendshipId)}`, {
          method: "DELETE",
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || "친구 삭제에 실패했어요.";
          showToast(message);
          return;
        }

        await refreshAll();
        setRelation((prev) => ({ ...prev, [user.id]: "NONE" }));
        showToast(`${user.name ?? "친구"}님을 친구 목록에서 삭제했어요`);
      } catch {
        showToast("친구를 삭제하는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      }
    },
    [refreshAll, showToast],
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
