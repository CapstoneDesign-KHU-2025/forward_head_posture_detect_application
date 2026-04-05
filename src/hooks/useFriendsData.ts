"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { Friend, FriendRequestRow, SearchUser } from "@/utils/types";
import { useTranslations } from "next-intl";
import { RelationStatus, SearchResultItem } from "@/utils/types";

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

type FriendsBundle = {
  friends: Friend[];
  incoming: FriendRequestRow[];
  outgoing: FriendRequestRow[];
};

function assertFriendsOk(res: Response, json: FriendsApiResponse) {
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Failed to load friends");
  }
}

function assertRequestsOk(
  res: Response,
  json: FriendRequestsApiResponse,
  label: string,
) {
  if (!res.ok || !json.ok) {
    throw new Error(json.error || label);
  }
}

async function fetchFriendsBundle(): Promise<FriendsBundle> {
  const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
    fetch("/api/friends", { cache: "no-store" }),
    fetch("/api/friends/requests?type=incoming&status=PENDING", {
      cache: "no-store",
    }),
    fetch("/api/friends/requests?type=outgoing&status=PENDING", {
      cache: "no-store",
    }),
  ]);

  const [friendsJson, incomingJson, outgoingJson] = await Promise.all([
    friendsRes.json() as Promise<FriendsApiResponse>,
    incomingRes.json() as Promise<FriendRequestsApiResponse>,
    outgoingRes.json() as Promise<FriendRequestsApiResponse>,
  ]);

  assertFriendsOk(friendsRes, friendsJson);
  assertRequestsOk(
    incomingRes,
    incomingJson,
    "Failed to load incoming requests",
  );
  assertRequestsOk(
    outgoingRes,
    outgoingJson,
    "Failed to load outgoing requests",
  );

  return {
    friends: friendsJson.friends ?? [],
    incoming: incomingJson.rows ?? [],
    outgoing: outgoingJson.rows ?? [],
  };
}

function toSearchResultItem(
  u: SearchUser,
  relation: Record<string, RelationStatus>,
): SearchResultItem {
  return {
    id: u.id,
    name: u.name,
    image: u.image,
    email: u.email,
    initial: u.name?.charAt(0) ?? "?",
    color: "#6aab7a",
    relation: (relation[u.id] ?? "NONE") as RelationStatus | "NONE",
  };
}

function shouldIncludeUserInSearchPicker(
  userId: string,
  relation: Record<string, RelationStatus>,
) {
  const status = relation[userId] ?? "NONE";
  return status !== "FRIEND" && status !== "INCOMING";
}

function matchesSearchQuery(u: SearchResultItem, q: string) {
  const matchName = (u.name ?? "").toLowerCase().includes(q);
  const matchId = u.id.toLowerCase().includes(q);
  return matchName || matchId;
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
  const t = useTranslations("Friends");

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
      const bundle = await fetchFriendsBundle();
      setFriends(bundle.friends);
      setIncoming(bundle.incoming);
      setOutgoing(bundle.outgoing);
      setRelation(
        buildRelationMap(bundle.friends, bundle.incoming, bundle.outgoing),
      );
    } catch {
      showToast(t("Messages.loadError"));
    }
  }, [showToast, t]);

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
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`,
          {
            cache: "no-store",
          },
        );
        const json = (await res
          .json()
          .catch(() => ({}))) as SearchUsersApiResponse;

        if (!res.ok || !json.ok) {
          showToast(t("Messages.searchError"));
          setSearchUsers([]);
          return;
        }

        setSearchUsers(json.users ?? []);
      } catch {
        showToast(t("Messages.searchProblem"));
        setSearchUsers([]);
      }
    },
    [showToast, t],
  );

  const processedSearchResults = useMemo<SearchResultItem[]>(() => {
    if (!searchUsers || searchUsers.length === 0) return [];

    return searchUsers
      .filter((u) => shouldIncludeUserInSearchPicker(u.id, relation))
      .map((u) => toSearchResultItem(u, relation));
  }, [searchUsers, relation]);

  const incomingCount = incoming.filter((r) => r.status === "PENDING").length;

  const searchResults = useCallback(
    (query: string): SearchResultItem[] => {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];

      void fetchSearchUsers(query);

      return processedSearchResults.filter((u) => matchesSearchQuery(u, q));
    },
    [fetchSearchUsers, processedSearchResults],
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
          const message = json?.error || t("Messages.sendRequestError");
          showToast(message);
          return;
        }

        await refreshAll();
        showToast(
          `${user.name ?? t("Messages.defaultName")}${t("Messages.sendRequestSuccess")}`,
        );
      } catch {
        showToast(t("Messages.sendREquestProblem"));
      }
    },
    [refreshAll, showToast, t],
  );

  const cancelRequest = useCallback(
    async (requestId: string, toUserId: string, toUserName: string | null) => {
      try {
        const res = await fetch(
          `/api/friends/requests/${encodeURIComponent(requestId)}/cancel`,
          {
            method: "POST",
          },
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || t("Messages.cancelError");
          showToast(message);
          return;
        }

        await refreshAll();
        setRelation((prev) => ({ ...prev, [toUserId]: "NONE" }));
        showToast(
          `${toUserName ?? t("Messages.defaultName")}${t("Messages.cancelSuccess")}`,
        );
      } catch {
        showToast(t("Messages.cancelProblem"));
      }
    },
    [refreshAll, showToast, t],
  );

  const acceptRequest = useCallback(
    async (
      requestId: string,
      fromUser: { id: string; name: string | null; image: string | null },
    ) => {
      try {
        const res = await fetch(
          `/api/friends/requests/${encodeURIComponent(requestId)}/respond`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "ACCEPT" }),
          },
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || t("Messages.acceptError");
          showToast(message);
          return;
        }

        await refreshAll();
        showToast(
          `${fromUser.name ?? t("Messages.defaultName")}${t("Messages.acceptSuccess")}`,
        );
      } catch {
        showToast(t("Messages.acceptProblem"));
      }
    },
    [refreshAll, showToast, t],
  );

  const declineRequest = useCallback(
    async (requestId: string, fromUserId: string) => {
      try {
        const res = await fetch(
          `/api/friends/requests/${encodeURIComponent(requestId)}/respond`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "REJECT" }),
          },
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || t("Messages.declineError");
          showToast(message);
          return;
        }

        await refreshAll();
        setRelation((prev) => ({ ...prev, [fromUserId]: "NONE" }));
        showToast(t("Messages.declineSuccess"));
      } catch {
        showToast(t("Messages.declineProblem"));
      }
    },
    [refreshAll, showToast, t],
  );

  const deleteFriend = useCallback(
    async (friendshipId: string, user: { id: string; name: string | null }) => {
      try {
        const res = await fetch(
          `/api/friends/${encodeURIComponent(friendshipId)}`,
          {
            method: "DELETE",
          },
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          const message = json?.error || t("Messages.deleteError");
          showToast(message);
          return;
        }

        await refreshAll();
        setRelation((prev) => ({ ...prev, [user.id]: "NONE" }));
        showToast(
          `${user.name ?? t("Messages.defaultName")}${t("Messages.deleteSuccess")}`,
        );
      } catch {
        showToast(t("Messages.deleteProblem"));
      }
    },
    [refreshAll, showToast, t],
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
