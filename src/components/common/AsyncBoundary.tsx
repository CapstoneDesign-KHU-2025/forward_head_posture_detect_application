"use client";

import { Suspense, ComponentProps } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import ErrorFallback from "./ErrorFallback";

type ErrorBoundaryProps = ComponentProps<typeof ErrorBoundary>;

// react-error-boundary는 fallback을 받는 방식이 3가지이고 섞어 쓰면 타입 에러 발생 가능있음
// 그래서 헷갈리지 않게 기존 타입을 싹 빼고 아래에서 우리가 쓸 방식 하나만 선택함
type PropsWithoutFallback = Omit<ErrorBoundaryProps, "fallback" | "FallbackComponent" | "fallbackRender">;

interface AsyncBoundaryProps extends PropsWithoutFallback {
  suspenseFallback: React.ReactNode; // 로딩 중에 보여줄 스켈레톤 UI (필수)
  children: React.ReactNode;
  
  // 기본 에러 화면 말고 다른 디자인 쓰고 싶을 때 사용 (로그인 페이지 등)
  // 안 넣으면 자동으로 ErrorFallback 적용됨
  errorFallback?: React.ComponentType<FallbackProps>; 
}

export default function AsyncBoundary({
  suspenseFallback,
  errorFallback,
  children,
  ...errorBoundaryProps // onReset 같은 나머지 기능들은 그대로 전달
}: AsyncBoundaryProps) {
  
  const Fallback = errorFallback || ErrorFallback;

  return (
    <ErrorBoundary FallbackComponent={Fallback} {...errorBoundaryProps}>
      <Suspense fallback={suspenseFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}