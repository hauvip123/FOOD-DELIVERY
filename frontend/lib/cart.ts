import { apiRequest, jsonBody } from "@/lib/api";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type BackendCart = {
  id: number;
  userId: number;
  restaurantId: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type BackendCartItem = {
  id: number;
  cartId: number;
  dishId: number;
  quantity: number;
  name: string;
  price: number;
  note?: string;
};

export type BackendCartResponse = {
  cart: BackendCart | null;
  cartItem: BackendCartItem[];
};

export type AddCartItemPayload = {
  dishId: number;
  restaurantId: number;
  quantity: number;
  name: string;
  price: number;
  note?: string;
};

export type UpdateCartItemPayload = {
  quantity?: number;
  price?: number;
  note?: string;
};

export type ReplaceCartPayload = {
  items: Array<{
    dishId: number;
    restaurantId: number;
    quantity: number;
    name: string;
    price: number;
    note?: string;
  }>;
};

export async function getMyCart() {
  const response = await apiRequest<ApiResponse<BackendCartResponse>>("/carts");
  return response.data;
}

export async function addCartItem(payload: AddCartItemPayload) {
  const response = await apiRequest<ApiResponse<BackendCartResponse>>("/carts/items", {
    method: "POST",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function replaceMyCart(payload: ReplaceCartPayload) {
  const response = await apiRequest<ApiResponse<BackendCartResponse>>("/carts", {
    method: "PUT",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function updateCartItem(cartItemId: number, payload: UpdateCartItemPayload) {
  const response = await apiRequest<ApiResponse<BackendCartResponse>>(`/carts/items/${cartItemId}`, {
    method: "PATCH",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function deleteCartItem(cartItemId: number) {
  const response = await apiRequest<ApiResponse<BackendCartResponse>>(`/carts/items/${cartItemId}`, {
    method: "DELETE",
  });
  return response.data;
}

export async function clearMyCart() {
  const response = await apiRequest<ApiResponse<BackendCartResponse>>("/carts", {
    method: "DELETE",
  });
  return response.data;
}
