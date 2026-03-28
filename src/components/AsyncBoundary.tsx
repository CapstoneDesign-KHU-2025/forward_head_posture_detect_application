"use client";

import { Suspense, ComponentProps } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import ErrorFallback from "./ErrorFallback";

type ErrorBoundaryProps = ComponentProps<typeof ErrorBoundary>;

// react-error-boundary has three ways to get fallback => choose one
type PropsWithoutFallback = Omit<ErrorBoundaryProps, "fallback" | "FallbackComponent" | "fallbackRender">;

interface AsyncBoundaryProps extends PropsWithoutFallback {
  suspenseFallback: React.ReactNode;
  children: React.ReactNode;
  errorFallback?: React.ComponentType<FallbackProps>;
}

export default function AsyncBoundary({
  suspenseFallback,
  errorFallback,
  children,
  ...errorBoundaryProps
}: AsyncBoundaryProps) {
  const Fallback = errorFallback || ErrorFallback;

  return (
    <ErrorBoundary FallbackComponent={Fallback} {...errorBoundaryProps}>
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
