import * as React from "react";

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** 에러 메시지 */
  error?: string;
  /** 보조 설명 */
  helperText?: string;
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 크기 */
  fieldSize?: "sm" | "md" | "lg";
};

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const sizeClass: Record<NonNullable<TextInputProps["fieldSize"]>, string> = {
  sm: "h-9 text-sm",
  md: "h-10 text-sm",
  lg: "h-11 text-base",
};

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, helperText, leftIcon, fieldSize = "md", type = "text", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const helperId = helperText ? `${id ?? "input"}-help` : undefined;
    const errorId = error ? `${id ?? "input"}-error` : undefined;

    return (
      <div className="w-full">
        <div
          className={cn(
            "relative flex items-center rounded-md border bg-white",
            error ? "border-red-400" : "border-black/15",
            "focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2"
          )}
        >
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 inline-flex">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperId}
            className={cn(
              "w-full rounded-md bg-transparent px-3 outline-none placeholder:text-black/40",
              sizeClass[fieldSize],
              !!leftIcon && "pl-9",
              isPassword && "pr-9",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-black/60 hover:text-black"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          )}
        </div>

        {helperText && !error && (
          <p id={helperId} className="mt-1 text-xs text-black/50">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
TextInput.displayName = "TextInput";