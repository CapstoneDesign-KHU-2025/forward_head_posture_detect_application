import { ApiError } from "next/dist/server/api-utils";

const BASE_PATH = "/api";

export type ApiRequestArgs = {
  requestPath: string;
  init?: RequestInit;
};
async function readBody(res: Response): Promise<unknown> {
  if (res.status === 204 || res.status === 205) return null;

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await res.text();
    return text.length ? text : null;
  } catch {
    return null;
  }
}
export async function apiRequest<T>({ requestPath, init }: ApiRequestArgs): Promise<T> {
  const response = await fetch(`${BASE_PATH}/${requestPath}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const body = await readBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText || "Request Failed");
  }

  return body as T;
}
