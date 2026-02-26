import { forwardRef } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "icon";
  size?: "lg" | "md" | "sm";
};

const base =
  "inline-flex items-center justify-center font-semibold transition-all duration-200 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

// 색상 스타일 (variant)
const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // .btn-save
  primary:
    "bg-[#4a7c59] text-white border border-transparent hover:bg-[#3a6147] " +
    "focus-visible:ring-[#4a7c59] ring-offset-white",
  // .btn-cancel (white background + green border)
  secondary:
    "bg-white text-[#7a9585] border border-[#d4ead9] hover:bg-[#f4faf6] " +
    "focus-visible:ring-[#4a7c59] ring-offset-white",
  // icon은 크기/색을 사용하는 쪽에서 완전히 제어하도록 기본 스타일을 비워둔다.
  icon: "",
};

// 사이즈 스타일 (padding + font-size + radius/hover)
const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  // lg: 측정하기, 측정 시작/중단 (.btn-measure)
  lg: "px-10 py-[13px] text-[15px] rounded-[14px] shadow-[0_4px_14px_rgba(74,124,89,0.3)] " +
      "hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(74,124,89,0.4)]",
  // md: 모달 확인/취소, 서브 버튼 (.btn-save/.btn-cancel)
  md: "px-5 py-2.5 text-[13px] rounded-[10px]",
  // sm: 친구 목록 내 버튼들
  sm: "px-[14px] py-[7px] text-[12px] rounded-[10px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          variant === "icon" ? "" : sizeClass[size], // 아이콘 버튼은 크기를 직접 지정
          variantClass[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
