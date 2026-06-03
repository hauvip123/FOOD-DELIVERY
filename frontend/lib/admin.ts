import { apiRequest, jsonBody } from "@/lib/api";

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

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserRestaurant = {
  id: number;
  ownerId: number | null;
  name: string;
  address: string;
  city: string;
  cuisine: string;
  imgage: string | null;
  description: string | null;
  phoneNumber: string | null;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  ratingAverage: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserDetail = AdminUser & {
  restaurants: AdminUserRestaurant[];
};

export async function getAdminUsers() {
  const response = await apiRequest<ApiResponse<AdminUser[]>>("/users/admin/list");
  return response.data;
}

export type AdminRestaurant = {
  id: number;
  ownerId: number | null;
  name: string;
  city: string;
  address: string;
  cuisine: string;
  isOpen: boolean;
  ratingAverage: number;
  imageUrl: string | null;
  description: string | null;
  createdAt: string;
  owner?: AdminUser;
  ownerRestaurantsCount?: number;
};

export async function getAdminRestaurants() {
  const response = await apiRequest<ApiResponse<AdminRestaurant[]>>("/restaurants/admin/list");
  return response.data;
}

export async function getAdminUserDetail(userId: number) {
  const response = await apiRequest<ApiResponse<AdminUserDetail>>("/users/admin/" + userId);
  return response.data;
}

export async function updateAdminUserRole(userId: number, role: string) {
  const response = await apiRequest<ApiResponse<AdminUser>>("/users/admin/" + userId + "/role", {
    method: "PATCH",
    body: jsonBody({ role }),
  });

  return response.data;
}

export async function updateAdminUserStatus(userId: number, status: string) {
  const response = await apiRequest<ApiResponse<AdminUser>>("/users/admin/" + userId + "/status", {
    method: "PATCH",
    body: jsonBody({ status }),
  });

  return response.data;
}
