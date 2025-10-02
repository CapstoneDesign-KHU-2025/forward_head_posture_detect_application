"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { TextInput } from "@/components/atoms/input/TextInput";

type SearchBarProps = {
  placeholder?: string;
  value?: string; 
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
};

export default function SearchBar({
  placeholder = "Search in site",
  value,
  onChange,
  onSubmit,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(value ?? "");

  // 외부 value가 바뀌면 내부 상태 동기화(제어형 지원)
  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (value === undefined) setInternalValue(v); // 비제어형일 때 내부 업데이트
    onChange?.(v);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit?.(internalValue);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "relative flex w-full items-center rounded-md border border-black/20 bg-white",
        "focus-within:ring-2 focus-within:ring-black/40",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <TextInput
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className="flex-1 border-none bg-transparent pl-3 pr-9 focus:ring-0"
      />

      <button
        type="submit"
        className="absolute right-2 grid h-8 w-8 place-items-center text-black/60 hover:text-black"
        aria-label="검색"
      >
        <Search size={18} strokeWidth={2} />
      </button>
    </form>
  );
}