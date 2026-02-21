import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
};

export function orderUserPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

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
  console.error(`[API ERROR]${path}${hint}`, error);

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
