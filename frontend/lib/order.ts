import { apiRequest, jsonBody } from "@/lib/api";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type OrderResponse = {
  id: number;
  userId: number;
  restaurantId: number;
  deliveryPersonId?: number | null;
  phoneNumber: string;
  deliveryFee: number;
  subtotal: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  paymentUrl?: string;
  vnpayTxnRef?: string | null;
  vnpayTransactionNo?: string | null;
};

export type OrderItemResponse = {
  id: number;
  orderId: number;
  dishId: number;
  quantity: number;
  price: number;
  name: string;
  note?: string;
};

export type DeliveryAddressResponse = {
  id: number;
  orderId: number;
  street: string;
  city: string;
  note?: string;
};

export type OrderDetailResponse = {
  order: OrderResponse;
  orderItem: OrderItemResponse[];
  deliveryAddress: DeliveryAddressResponse | null;
};


export type ManagedOverviewResponse = {
  summary: {
    restaurantCount: number;
    openRestaurantCount: number;
    totalOrders: number;
    pendingOrders: number;
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    averageOrderValue: number;
  };
  revenueSeries: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    label: string;
    count: number;
  }>;
  topRestaurants: Array<{
    id: number;
    name: string;
    isOpen: boolean;
    ratingAverage: number;
    orderCount: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    restaurantId: number;
    restaurantName: string;
    phoneNumber: string;
    totalAmount: number;
    orderStatus: string;
    paymentMethod: string;
    createdAt: string;
  }>;
};

export type CreateOrderPayload = {
  phoneNumber: string;
  deliveryFee?: number;
  paymentMethod?: string;
  street: string;
  city: string;
  note?: string;
};

export async function createOrder(payload: CreateOrderPayload) {
  const response = await apiRequest<ApiResponse<OrderResponse>>("/orders", {
    method: "POST",
    body: jsonBody(payload),
  });
  return response.data;
}


export async function getMyOrders() {
  const response = await apiRequest<ApiResponse<OrderResponse[]>>("/orders/my-orders");
  return response.data;
}

export async function cancelOrder(id: number) {
  const response = await apiRequest<ApiResponse<OrderResponse>>(`/orders/${id}/cancel`, {
    method: "PATCH",
  });
  return response.data;
}


export async function getOrderDetail(id: number) {
  const response = await apiRequest<ApiResponse<OrderDetailResponse>>(`/orders/${id}`);
  return response.data;
}

export async function confirmOrderReceived(id: number) {
  const response = await apiRequest<ApiResponse<OrderResponse>>(`/orders/${id}/received`, {
    method: "PATCH",
  });
  return response.data;
}

export async function confirmOrderPayment(id: number) {
  const response = await apiRequest<ApiResponse<OrderResponse>>(`/orders/${id}/payment`, {
    method: "PATCH",
  });
  return response.data;
}

export async function createVnpayPaymentUrl(id: number) {
  const response = await apiRequest<ApiResponse<{ order: OrderResponse; paymentUrl: string }>>(`/orders/${id}/vnpay-payment-url`, {
    method: "POST",
  });
  return response.data;
}

export type VnpayReturnResponse = {
  order: OrderResponse;
  isSuccess: boolean;
  responseCode?: string;
  transactionStatus?: string;
};

export async function verifyVnpayReturn(queryString: string) {
  const response = await apiRequest<ApiResponse<VnpayReturnResponse>>(`/orders/vnpay-return?${queryString}`);
  return response.data;
}

export async function getManagedOverview() {
  const response = await apiRequest<ApiResponse<ManagedOverviewResponse>>("/orders/manage/overview");
  return response.data;
}


export async function getManagedOrders() {
  const response = await apiRequest<ApiResponse<OrderResponse[]>>("/orders/manage/my-orders");
  return response.data;
}

export async function updateOrderStatus(id: number, orderStatus: string) {
  const response = await apiRequest<ApiResponse<OrderResponse>>(`/orders/${id}/status`, {
    method: "PATCH",
    body: jsonBody({ orderStatus }),
  });
  return response.data;
}
