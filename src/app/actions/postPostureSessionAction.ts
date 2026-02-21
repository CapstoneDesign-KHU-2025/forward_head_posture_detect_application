"use server";

import { createPostureSample } from "@/services/posture.service";
import * as Sentry from "@sentry/nextjs";
type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

export async function postPostureSessionAction(data: any): Promise<ApiResult<any>> {
  try {
    const result = await createPostureSample(data);

    return { ok: true, data: result };
  } catch (error: any) {
    console.error("[Action Error]", error);
    Sentry.captureException(error);

    return {
      ok: false,
      message: error.message || "error occurs during server action",
    };
  }
}
