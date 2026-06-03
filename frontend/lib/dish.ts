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

export type DishResponse = {
  id: number;
  restaurantId: number;
  categoryId: number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    id: number;
    name: string;
    city: string;
  };
  category?: {
    id: number;
    name: string;
  };
};

export type CreateDishPayload = {
  restaurantId: number;
  categoryId: number;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

export async function getAllDishes() {
  const response = await apiRequest<ApiResponse<DishResponse[]>>("/dishes");
  return response.data;
}

export async function createDish(payload: CreateDishPayload) {
  const response = await apiRequest<ApiResponse<DishResponse>>("/dishes", {
    method: "POST",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function getDishesByRestaurantId(restaurantId: number) {
  const response = await apiRequest<ApiResponse<DishResponse[]>>("/dishes/restaurant/" + restaurantId);
  return response.data;
}

export async function updateDish(id: number, payload: Partial<CreateDishPayload> & { isAvailable?: boolean }) {
  const response = await apiRequest<ApiResponse<DishResponse>>("/dishes/" + id, {
    method: "PATCH",
    body: jsonBody(payload),
  });
  return response.data;
}

export function deleteDish(id: number) {
  return apiRequest<ApiMessageResponse>("/dishes/" + id, {
    method: "DELETE",
  });
}
