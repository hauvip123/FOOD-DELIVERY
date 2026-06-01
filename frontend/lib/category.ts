import { apiRequest, jsonBody } from "@/lib/api";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

type ApiMessageResponse = {
  statusCode: number;
  message: string;
};

export type CategoryResponse = {
  id: number;
  restaurantId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryPayload = {
  restaurantId: number;
  name: string;
};

export async function createCategory(payload: CreateCategoryPayload) {
  const response = await apiRequest<ApiResponse<CategoryResponse>>("/categories", {
    method: "POST",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function getAllCategories() {
  const response = await apiRequest<ApiResponse<CategoryResponse[]>>("/categories");
  return response.data;
}

export async function updateCategory(id: number, name: string) {
  const response = await apiRequest<ApiResponse<CategoryResponse>>("/categories/" + id, {
    method: "PATCH",
    body: jsonBody({ name }),
  });
  return response.data;
}

export function deleteCategory(id: number) {
  return apiRequest<ApiMessageResponse>("/categories/" + id, {
    method: "DELETE",
  });
}
