import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { logger } from "../logger";

export type ApiErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
};

export function orderUserPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
export type ActionState<T = undefined> = {
  ok: boolean;
  message?: { ko: string; en: string };
  status?: number;
  data?: T;
} | null;

export function json(data: unknown, status = 200) {
  return new NextResponse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

export function safeDetails(details: unknown) {
  if (process.env.NODE_ENV === "production") return undefined;
  return details;
}

export function apiError(error: unknown, context?: { path?: string; hint?: string }, statusFallback = 500) {
  const path = context?.path ? `${context.path}` : "";
  const hint = context?.hint ? `${context.hint}` : "";
  logger.error(`[API ERROR]${path}${hint}`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return json(
        {
          error: "Already exist",
          code: error.code,
          details: safeDetails(error.meta),
        },
        409,
      );
    }

    if (error.code === "P2025") {
      return json(
        {
          error: "Can't find the object",
          code: error.code,
          details: safeDetails(error.meta),
        },
        404,
      );
    }
    return json(
      {
        error: "Error occurs during DB request",
        code: error.code,
        details: safeDetails(error.meta),
      },
      400,
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return json(
      {
        error: "Wrong request formation",
        code: "PRISMA_VALIDATION_ERROR",
        details: safeDetails(error.message),
      },
      400,
    );
  }

  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        api_path: context?.path || "unknown",
        error_hint: context?.hint || "none",
      },
    });
    Sentry.captureException(error, {
      tags: {
        api_path: context?.path || "unknown",
        error_hint: context?.hint || "none",
      },
    });
    return json(
      {
        error: error.message || "Server error",
        code: "INTERNAL_ERROR",
        details: safeDetails(error.stack),
      },
      statusFallback,
    );
  }

  return json(
    {
      error: "Unknown server error",
      code: "UNKNOWN_ERROR",
      details: safeDetails(error),
    },
    statusFallback,
  );
}

export function withApi<T>(
  handler: () => Promise<NextResponse>,
  context?: { path?: string; hint?: string },
  statusFallback?: number,
) {
  return async () => {
    try {
      return await handler();
    } catch (e) {
      return apiError(e, context, statusFallback);
    }
  };
}

export function withApiReq(
  handler: (req: Request, context: any) => Promise<NextResponse>,
  contextInfo?: { path?: string; hint?: string },
  statusFallback?: number,
) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (e) {
      return apiError(e, contextInfo, statusFallback);
    }
  };
}
export const SERVER_MESSAGES = {
  AUTH_REQUIRED: {
    ko: "앗! 로그인이 필요한 서비스예요. 로그인을 먼저 해 주시겠어요? 🔑",
    en: "Oops! You need to log in first. Could you sign in for us? 🔑",
  },

  INVALID_INPUT: {
    ko: "음... 입력하신 정보 중에 빠진 게 있거나 잘못된 정보인가 봐요! 다시 한번 확인해 주세요 🧐",
    en: "Hmm... something's missing or wrong! Could you double-check? 🧐",
  },
  SYSTEM_MESSAGES: {
    ko: "서버가 응답을 받지 않네요! 저희에게 현상을 신고해주시면 신속히 고쳐드릴게요 🙊",
    en: "Server is not answering! Could you report us this situation? We are going to solve it soon 🙊",
  },

  STALE_REQUEST: {
    ko: "앗, 상태가 바뀌었나 봐요! 새로고침 후 다시 확인해 볼까요? 🔄",
    en: "Oops! It looks like this request was already handled or is no longer available. Let's refresh and check again! 🔄",
  },

  FRIEND_NOT_FOUND: {
    ko: "아직 저희 서비스를 이용하지 않는 친구 같아요. 이 기회에 초대해 보는 건 어떨까요? 💌",
    en: "It looks like your friend hasn't joined us yet. Why not invite them? 💌",
  },

  FETCH_FAILED: {
    ko: "데이터를 불러오는 중에 살짝 길을 잃었어요! 잠시 후 다시 시도해 주시겠어요? 📍",
    en: "We lost our way while fetching data! Could you try again in a bit? 📍",
  },

  REQUEST_FAILED: {
    ko: "요청하신 작업을 처리하지 못했어요. 다시 한번만 눌러주세요! 🔄",
    en: "We couldn't finish your request. Give it one more try! 🔄",
  },
  INTERNAL_SERVER_ERROR: {
    ko: "죄송해요, 서버가 잠시 쉬고 싶나 봐요. 얼른 깨워놓을게요! 조금만 기다려 주세요 💤",
    en: "Sorry, the server is taking a quick nap. We'll wake it up shortly! 💤",
  },
};
