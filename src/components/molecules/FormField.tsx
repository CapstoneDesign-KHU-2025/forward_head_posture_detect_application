"use client";

import * as React from "react";
import { Label } from "@/components/atoms/typography/Label";
import { TextInput } from "@/components/atoms/input/TextInput";

type FormFieldProps = {
  /** input id와 label htmlFor를 연결 */
  id: string;
  /** 라벨 텍스트 */
  label: React.ReactNode;
  /** 필수 표시 * */
  required?: boolean;
  /** 보조 설명 (에러 없을 때만 노출) */
  helperText?: string;
  /** 에러 메시지 (있으면 빨간색으로 노출) */
  error?: string;

  /** TextInput에 그대로 전달될 props */
  inputProps?: Omit<
    React.ComponentProps<typeof TextInput>,
    "id" | "helperText" | "error"
  >;

  /** 외부 컨테이너 클래스 */
  className?: string;
};

export default function FormField({
  id,
  label,
  required = false,
  helperText,
  error,
  inputProps,
  className,
}: FormFieldProps) {
  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      <TextInput
        id={id}
        aria-invalid={!!error}
        helperText={helperText}
        error={error}
        {...inputProps}
      />
    </div>
  );
}