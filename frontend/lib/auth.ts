const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type LoginResponse = {
  statusCode: number;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
};

type RegisterResponse = {
  statusCode: number;
  message: string;
};

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

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(API_BASE_URL + path, {
    ...init,
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

export function register(payload: { username: string; email: string; password: string }) {
  return request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveAuthSession(data: LoginResponse["data"]) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));
}
