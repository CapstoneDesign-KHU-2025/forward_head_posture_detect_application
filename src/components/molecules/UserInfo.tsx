import * as React from "react";
import { Avatar } from "@/components/atoms/avatar/Avatar";
import { Text } from "@/components/atoms/typography/Text";

type UserInfoProps = {
  /** 사용자 표시 이름 */
  name: string;
  /** 보조 문구 (상태/이메일/역할 등) */
  subtitle?: string;

  /** 아바타 이미지 */
  avatarSrc?: string;
  /** 접근성용 대체 텍스트 (이니셜 생성에도 사용) */
  avatarAlt?: string;

  /** 크기 프리셋 */
  size?: "sm" | "md" | "lg";
  /** 수평/수직 배치 */
  layout?: "horizontal" | "vertical";

  /** 오른쪽(또는 아래) 액션 영역 (버튼/링크 등) */
  trailing?: React.ReactNode;

  className?: string;
};

const nameClassBySize: Record<NonNullable<UserInfoProps["size"]>, string> = {
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-lg font-semibold",
};

const subClassBySize: Record<NonNullable<UserInfoProps["size"]>, string> = {
  sm: "text-xs text-black/60",
  md: "text-sm text-black/60",
  lg: "text-sm text-black/60",
};

const avatarSizeMap: Record<NonNullable<UserInfoProps["size"]>, "sm" | "md" | "lg" | "xl"> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export default function UserInfo({
  name,
  subtitle,
  avatarSrc,
  avatarAlt = name,
  size = "md",
  layout = "horizontal",
  trailing,
  className,
}: UserInfoProps) {
  const isRow = layout === "horizontal";

  return (
    <div
      className={[
        "flex",
        isRow ? "items-center gap-3" : "flex-col items-start gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Avatar src={avatarSrc} alt={avatarAlt} size={avatarSizeMap[size]} />

      <div className={isRow ? "flex-1 min-w-0" : "min-w-0"}>
        <div className={nameClassBySize[size]}>{name}</div>
        {subtitle ? <Text className={subClassBySize[size]}>{subtitle}</Text> : null}
      </div>

      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </div>
  );
}