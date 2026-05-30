const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function jsonBody(payload: unknown) {
  return JSON.stringify(payload);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(API_BASE_URL + path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody | T;

  if (!response.ok) {
    const message = (body as ApiErrorBody).message;
    const normalizedMessage = Array.isArray(message) ? message.join(". ") : message;
    throw new ApiError(normalizedMessage || (body as ApiErrorBody).error || "Không thể kết nối máy chủ.", response.status);
  }

  return body as T;
}
