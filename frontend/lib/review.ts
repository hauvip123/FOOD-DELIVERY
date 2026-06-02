import { apiRequest, jsonBody } from "@/lib/api";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ReviewResponse = {
  id: number;
  userId: number;
  restaurantId: number;
  orderId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ManagedReviewResponse = ReviewResponse & {
  restaurantName: string;
};

export type ReviewQueryParams = {
  rating?: number | "all";
  restaurantId?: number | "all";
};

export type CreateReviewPayload = {
  orderId: number;
  rating: number;
  comment?: string;
};

export type UpdateReviewPayload = {
  rating?: number;
  comment?: string;
};

export async function createReview(payload: CreateReviewPayload) {
  const response = await apiRequest<ApiResponse<ReviewResponse>>("/reviews", {
    method: "POST",
    body: jsonBody(payload),
  });
  return response.data;
}

function buildReviewQuery(params: ReviewQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.rating && params.rating !== "all") {
    searchParams.set("rating", String(params.rating));
  }
  if (params.restaurantId && params.restaurantId !== "all") {
    searchParams.set("restaurantId", String(params.restaurantId));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getRestaurantReviews(restaurantId: number, params: Pick<ReviewQueryParams, "rating"> = {}) {
  const response = await apiRequest<ApiResponse<ReviewResponse[]>>(`/reviews/restaurant/${restaurantId}${buildReviewQuery(params)}`);
  return response.data;
}

export async function getManagedReviews(params: ReviewQueryParams = {}) {
  const response = await apiRequest<ApiResponse<ManagedReviewResponse[]>>(`/reviews/manage/my-reviews${buildReviewQuery(params)}`);
  return response.data;
}

export async function getOrderReview(orderId: number) {
  const response = await apiRequest<ApiResponse<ReviewResponse | null>>(`/reviews/order/${orderId}`);
  return response.data;
}

export async function updateReview(id: number, payload: UpdateReviewPayload) {
  const response = await apiRequest<ApiResponse<ReviewResponse>>(`/reviews/${id}`, {
    method: "PATCH",
    body: jsonBody(payload),
  });
  return response.data;
}

export async function deleteReview(id: number) {
  await apiRequest<ApiResponse<undefined>>(`/reviews/${id}`, {
    method: "DELETE",
  });
}
