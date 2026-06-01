import { apiRequest, jsonBody } from "@/lib/api";
export { ApiError } from "@/lib/api";

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

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};

export function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? "";
}

const MANAGE_ROLES = ["restaurant", "admin"];

const POST_LOGIN_REDIRECT_BY_ROLE: Record<string, string> = {
  restaurant: "/manage",
  admin: "/manage",
};

export function canAccessManage(role?: string | null) {
  return MANAGE_ROLES.includes(normalizeRole(role));
}

export function getPostLoginRedirectPath(role?: string | null) {
  return POST_LOGIN_REDIRECT_BY_ROLE[normalizeRole(role)] ?? "/";
}

type AuthResponse = {
  statusCode: number;
  message: string;
  data: AuthSession;
};

type RegisterResponse = {
  statusCode: number;
  message: string;
};

type LogoutResponse = {
  statusCode: number;
  message: string;
};

type ForgotPasswordResponse = {
  statusCode: number;
  message: string;
};

type ResetPasswordResponse = {
  statusCode: number;
  message: string;
};

export function register(payload: { username: string; email: string; password: string }) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export function refreshAccessToken() {
  return apiRequest<AuthResponse>("/auth/refresh", {
    method: "POST",
  });
}

export function logout() {
  return apiRequest<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}

export function forgotPassword(payload: { email: string }) {
  return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export function resetPassword(payload: { token: string; password: string }) {
  return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    body: jsonBody(payload),
  });
}
