"use client";

import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

export function SearchInput({ className, ...props }: SearchInputProps) {
  const t = useTranslations("SearchInput");
  return (
    <input
      type="text"
      className={cn(
        "w-full rounded-xl border border-[#d4ead9] bg-[#f4faf6] px-4 py-2.5",
        "text-[15px] text-[#2d3b35] outline-none transition-colors",
        "placeholder:text-[15px] placeholder:text-[#7a9585] focus:border-[#6aab7a]",
        className,
      )}
      placeholder={t("placeholder")}
      {...props}
    />
  );
}
