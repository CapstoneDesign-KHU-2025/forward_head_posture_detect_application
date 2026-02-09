const BASE_PATH = "/api";

export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; status: number; message: string; body?: unknown };
export type ApiResult<T> = ApiOk<T> | ApiFail;

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
export async function apiRequest<T>({
  requestPath,
  init,
}: {
  requestPath: string;
  init?: RequestInit;
}): Promise<ApiResult<T>> {
  try {
    const isJsonBody = init?.body && typeof init.body === "object" && !(init.body instanceof FormData);
    const headers = new Headers(init?.headers);

    if (isJsonBody && !headers.has("Content-Type")) {
      headers.set("Content-type", "application/json");
    }

    const response = await fetch(`${BASE_PATH}/${requestPath}`, {
      ...init,
      headers,
      body: isJsonBody ? JSON.stringify(init.body) : init?.body,
    });

    const body = await readBody(response);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: response.statusText || "unknown error",
        body: body,
      };
    }

    return { ok: true, data: body as T };
  } catch (error) {
    throw error;
  }
}
