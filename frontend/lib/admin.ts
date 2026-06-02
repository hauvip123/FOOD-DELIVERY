import { apiRequest } from "@/lib/api";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type AdminOverviewResponse = {
  summary: {
    totalUsers: number;
    customerCount: number;
    restaurantOwnerCount: number;
    adminCount: number;
    activeUserCount: number;
    totalRestaurants: number;
    openRestaurantCount: number;
    closedRestaurantCount: number;
    averageRestaurantRating: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  usersByStatus: Array<{ status: string; count: number }>;
  restaurantsByStatus: Array<{ status: string; label: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
  topCuisines: Array<{ cuisine: string; count: number }>;
  recentUsers: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
  recentRestaurants: Array<{
    id: number;
    ownerId: number | null;
    name: string;
    city: string;
    cuisine: string;
    isOpen: boolean;
    ratingAverage: number;
    createdAt: string;
  }>;
};

export async function getAdminOverview() {
  const response = await apiRequest<ApiResponse<AdminOverviewResponse>>("/users/admin/overview");
  return response.data;
}
