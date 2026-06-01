import { apiRequest, jsonBody } from "@/lib/api";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type RestaurantPayload = {
  name: string;
  address: string;
  city: string;
  cuisine: string;
  imgage?: string;
  description?: string;
  phoneNumber?: string;
  openTime: string;
  closeTime: string;
};

export type RestaurantResponse = {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  city: string;
  cuisine: string;
  imgage?: string;
  description?: string;
  phoneNumber?: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  ratingAverage: number;
  createdAt: string;
  updatedAt: string;
};

export async function createRestaurant(payload: RestaurantPayload) {
  const response = await apiRequest<ApiResponse<RestaurantResponse>>("/restaurants", {
    method: "POST",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function updateRestaurant(id: number, payload: Partial<RestaurantPayload>) {
  const response = await apiRequest<ApiResponse<RestaurantResponse>>(`/restaurants/${id}`, {
    method: "PATCH",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function getRestaurantById(id: number) {
  const response = await apiRequest<ApiResponse<RestaurantResponse>>(`/restaurants/${id}`);
  return response.data;
}

export async function getMyRestaurants() {
  const response = await apiRequest<ApiResponse<RestaurantResponse[]>>("/restaurants/my-restaurants");
  return response.data;
}
