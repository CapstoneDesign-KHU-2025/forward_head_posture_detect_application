"use client";

import { Icon } from "@/components/Icon";
import { UserRow } from "@/app/[locale]/(protected)/friends/components/UserRow";
import { EmptyState } from "@/components/EmptyState";
import { IconButton } from "@/components/IconButton";
import { X } from "lucide-react";
import { Friend } from "@/utils/types";
import { useTranslations } from "next-intl";
import { getAvatarColor, getInitial } from "./friends.utils";

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
            bgColor={getAvatarColor(f.user.id)}
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
                className="h-7 w-7 rounded-lg transition-colors"
              />
            }
          />
        ))
      )}
    </div>
  );
}
