// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/db";

// NextAuth 설정
export const {
  handlers, // API route 핸들러 (GET, POST)
  auth, // 서버에서 세션 조회용
  signIn, // 서버 액션에서 로그인
  signOut, // 서버 액션에서 로그아웃
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    // Session 모델 쓰는 DB 세션 방식 (지금 스키마랑 맞음)
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30일 후 만료
    updateAge: 24 * 60 * 60,   // 24시간마다 만료일 갱신
  },
  providers: [
    GitHub, // env: AUTH_GITHUB_ID / AUTH_GITHUB_SECRET 자동 사용
    Google, // env: AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET 자동 사용
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // 여기서 DB User.id를 세션에 강제로 주입
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 로그인 성공 후 리다이렉트 처리
      // 캐릭터 선택 페이지로 이동
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      // 기본값: 캐릭터 선택 페이지
      return `${baseUrl}/character`;
    },
  },
  pages: {
    signIn: "/login", // 커스텀 로그인 페이지 경로
  },
});
