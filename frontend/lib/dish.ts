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

type PaginatedApiResponse<T> = ApiResponse<T> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export type DishListQuery = {
  search?: string;
  categoryName?: string;
  categoryId?: number;
  isAvailable?: boolean;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
};

function buildDishQueryString(query: DishListQuery = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? "?" + queryString : "";
}

export async function getDishes(query: DishListQuery = {}) {
  const response = await apiRequest<PaginatedApiResponse<DishResponse[]>>(
    "/dishes" + buildDishQueryString(query),
  );
  return {
    data: response.data,
    meta: response.meta,
  };
}

export async function getAllDishes() {
  const response = await getDishes({ limit: 100 });
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
  const response = await apiRequest<ApiResponse<DishResponse[]>>(
    "/dishes/restaurant/" + restaurantId,
  );
  return response.data;
}

export async function updateDish(
  id: number,
  payload: Partial<CreateDishPayload> & { isAvailable?: boolean },
) {
  const response = await apiRequest<ApiResponse<DishResponse>>(
    "/dishes/" + id,
    {
      method: "PATCH",
      body: jsonBody(payload),
    },
  );
  return response.data;
}

export function deleteDish(id: number) {
  return apiRequest<ApiMessageResponse>("/dishes/" + id, {
    method: "DELETE",
  });
}
