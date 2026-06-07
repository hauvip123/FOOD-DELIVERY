import { apiRequest, jsonBody } from "@/lib/api";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

type PaginatedApiResponse<T> = ApiResponse<T> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  deliveryFee?: number;
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
  deliveryFee: number;
  createdAt: string;
  updatedAt: string;
};

export type FindRestaurantsParams = {
  search?: string;
  city?: string;
  address?: string;
  cuisine?: string;
  isOpen?: boolean;
  minRating?: number;
  maxRating?: number;
  sortBy?: "name" | "ratingAverage" | "createdAt";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
};

export type RestaurantsListResult = {
  data: RestaurantResponse[];
  meta: PaginatedApiResponse<RestaurantResponse[]>["meta"];
};

export async function getRestaurants(params: FindRestaurantsParams = {}): Promise<RestaurantsListResult> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  const response = await apiRequest<PaginatedApiResponse<RestaurantResponse[]>>(
    "/restaurants" + (queryString ? `?${queryString}` : ""),
  );

  return {
    data: response.data,
    meta: response.meta,
  };
}

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
export async function getFavoriteRestaurants() {
  const response = await apiRequest<ApiResponse<RestaurantResponse[]>>("/restaurants/favorites");
  return response.data;
}

export async function getFavoriteRestaurantIds() {
  const response = await apiRequest<ApiResponse<number[]>>("/restaurants/favorites/ids");
  return response.data;
}

export async function checkFavoriteRestaurant(id: number) {
  const response = await apiRequest<ApiResponse<{ isFavorite: boolean }>>(`/restaurants/${id}/favorite`);
  return response.data.isFavorite;
}

export async function addFavoriteRestaurant(id: number) {
  const response = await apiRequest<ApiResponse<RestaurantResponse>>(`/restaurants/${id}/favorite`, {
    method: "POST",
  });
  return response.data;
}

export async function removeFavoriteRestaurant(id: number) {
  return apiRequest<Omit<ApiResponse<never>, "data">>(`/restaurants/${id}/favorite`, {
    method: "DELETE",
  });
}
