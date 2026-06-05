import { apiRequest, jsonBody } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type UpdateProfilePayload = {
  username?: string;
  email?: string;
  phoneNumber?: string | null;
  avatar?: string | null;
};

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const response = await apiRequest<ApiResponse<AuthUser>>("/users/me", {
    method: "PATCH",
    body: jsonBody(payload),
  });
  return response.data;
}
