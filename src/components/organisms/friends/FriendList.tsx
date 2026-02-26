"use client";

import { Icon } from "@/components/atoms/Icon";
import { UserRow } from "@/components/molecules/UserRow";
import { EmptyState } from "@/components/atoms/EmptyState";
import { IconButton } from "@/components/atoms/IconButton";
import { X } from "lucide-react";
import type { Friend } from "@/types/friends";
import { cn } from "@/utils/cn";

const AVATAR_COLORS = ["#ff9f6b", "#6b9fff", "#ffc46b", "#b06bff", "#6aab7a", "#ff8c8c"];

function getAvatarStyle(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name: string | null, id: string) {
  return name?.charAt(0)?.toUpperCase() ?? id?.charAt(0)?.toUpperCase() ?? "?";
}

type FriendListProps = {
  friends: Friend[];
  onDelete: (friendshipId: string, user: { id: string; name: string | null }) => void;
};

export function FriendList({ friends, onDelete }: FriendListProps) {
  return (
    <div className="space-y-0">
      {friends.length === 0 ? (
        <EmptyState
          icon={<span>🐢</span>}
          message="친구가 없어요. 검색에서 친구를 추가해보세요!"
        />
      ) : (
        friends.map((f) => (
          <UserRow
            key={f.friendshipId}
            name={f.user.name ?? "알 수 없음"}
            email={f.user.id}
            initial={getInitial(f.user.name, f.user.id)}
            bgColor={getAvatarStyle(f.user.id)}
            actions={
              <IconButton
                variant="ghost"
                size="sm"
                icon={
                  <Icon size="xs">
                    <X />
                  </Icon>
                }
                onClick={() => onDelete(f.friendshipId, f.user)}
                title="친구 삭제"
                aria-label="친구 삭제"
                className={cn("h-7 w-7 rounded-lg", "transition-colors")}
              />
            }
          />
        ))
      )}
    </div>
  );
}
