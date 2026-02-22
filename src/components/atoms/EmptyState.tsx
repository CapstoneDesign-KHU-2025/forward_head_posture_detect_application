import { cn } from "@/utils/cn";

type EmptyStateProps = {
  icon: React.ReactNode;
  message: string;
  className?: string;
};

export function EmptyState({ icon, message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center text-[#7a9585]",
        className
      )}
    >
      <div className="mb-2 text-[30px] leading-none">{icon}</div>
      <p className="text-[13px]">{message}</p>
    </div>
  );
}
