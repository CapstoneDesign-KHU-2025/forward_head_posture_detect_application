"use client";

import { cn } from "@/utils/cn";

type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <input
      type="text"
      className={cn(
        "w-full rounded-xl border border-[#d4ead9] bg-[#f4faf6] px-4 py-2.5",
        "text-sm text-[#2d3b35] outline-none transition-colors",
        "placeholder:text-[#7a9585] focus:border-[#6aab7a]",
        className
      )}
      placeholder="이메일로 친구를 검색해보세요..."
      {...props}
    />
  );
}
