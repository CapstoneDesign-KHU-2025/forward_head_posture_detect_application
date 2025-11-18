// app/login/page.tsx
import React from "react";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4 border rounded-xl p-6">
        <h1 className="text-xl font-bold">로그인</h1>

        {/* GitHub 로그인 */}
        <form
          action={async () => {
            "use server";
            // provider id = "github"
            await signIn("github");
          }}
        >
          <button type="submit" className="w-full rounded-md border px-4 py-2 text-sm">
            GitHub로 로그인
          </button>
        </form>

        {/* Google 로그인 */}
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button type="submit" className="w-full rounded-md border px-4 py-2 text-sm">
            Google로 로그인
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-2">첫 로그인 시 자동으로 계정이 생성됩니다.</p>
      </div>
    </main>
  );
}
