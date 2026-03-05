"use client";

import { Icon } from "@/components/atoms/Icon";
import { UserRow } from "@/components/molecules/UserRow";
import { EmptyState } from "@/components/atoms/EmptyState";
import { IconButton } from "@/components/atoms/IconButton";
import { X } from "lucide-react";
import type { Friend } from "@/types/friends";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
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
  onDelete: (friendshipId: string, user: { id: string; name: string | null }) => void | Promise<void>;
};

export function FriendList({ friends, onDelete }: FriendListProps) {
  const t = useTranslations("FriendList");
  return (
    <div className="space-y-0">
      {friends.length === 0 ? (
        <EmptyState icon={<span>🐢</span>} message={t("EmptyState.message")} />
      ) : (
        friends.map((f) => (
          <UserRow
            key={f.friendshipId}
            name={f.user.name ?? t("UserRow.unknown")}
            email={f.user.email ?? ""}
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
                title={t("IconButton.title")}
                aria-label={t("IconButton.title")}
                className={cn("h-7 w-7 rounded-lg", "transition-colors")}
              />
            }
          />
        ))
      )}
    </div>
  );
}
