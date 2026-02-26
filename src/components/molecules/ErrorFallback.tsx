"use client";

import { FallbackProps } from "react-error-boundary";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-[#2C3E50] text-white p-6 rounded-[20px]"
      style={{ aspectRatio: "4/3" }}
    >
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-2">오류가 발생했습니다</h2>
      <p className="text-sm text-gray-300 mb-6 text-center max-w-[80%] break-keep">
        {(error as Error)?.message || "알 수 없는 오류가 발생했습니다."}
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={() => {
            startTransition(() => {
              router.refresh();
              resetErrorBoundary();
            });
          }}
          className="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
        >
          새로고침
        </button>
        <button
          onClick={resetErrorBoundary}
          className="px-5 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
