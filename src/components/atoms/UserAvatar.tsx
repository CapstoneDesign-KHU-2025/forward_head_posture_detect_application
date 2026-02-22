import { cn } from "@/utils/cn";

type UserAvatarProps = {
  initial: string;
  bgColor?: string;
  className?: string;
};

export function UserAvatar({ initial, bgColor = "#6aab7a", className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
        "text-[15px] font-bold text-white",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {initial.charAt(0).toUpperCase()}
    </div>
  );
}
