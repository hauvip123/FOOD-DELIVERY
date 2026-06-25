"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  CookingPot,
  Eye,
  Receipt,
  Storefront,
  Truck,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import {
  getManagedOrders,
  OrderResponse,
  updateOrderStatus,
} from "@/lib/order";
import { getMyRestaurants, RestaurantResponse } from "@/lib/restaurant";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

const statusConfig: Record<
  string,
  { label: string; tone: string; action?: { label: string; next: string } }
> = {
  pending: {
    label: "Chờ xác nhận",
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
    action: { label: "Xác nhận đơn", next: "confirmed" },
  },
  confirmed: {
    label: "Đã xác nhận",
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
    action: { label: "Bắt đầu chuẩn bị", next: "preparing" },
  },
  preparing: {
    label: "Đang chuẩn bị",
    tone: "bg-orange-50 text-orange-700 ring-orange-100",
    action: { label: "Chuyển giao hàng", next: "delivering" },
  },
  delivering: {
    label: "Đang giao",
    tone: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  completed: {
    label: "Đã nhận hàng",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  cancelled: { label: "Đã hủy", tone: "bg-red-50 text-red-700 ring-red-100" },
};

const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang chuẩn bị", value: "preparing" },
  { label: "Đang giao", value: "delivering" },
  { label: "Đã nhận hàng", value: "completed" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function ManageOrdersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  const ordersQuery = useQuery({
    queryKey: ["manage", "orders"],
    queryFn: async () => {
      const [orderData, restaurantData] = await Promise.all([
        getManagedOrders(),
        getMyRestaurants(),
      ]);
      const restaurantsById = Object.fromEntries(
        restaurantData.map((restaurant) => [restaurant.id, restaurant]),
      );
      return { orders: orderData, restaurantsById };
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
  });

  const orders = ordersQuery.data?.orders ?? [];
  const restaurantsById = ordersQuery.data?.restaurantsById ?? {};
  const isLoading = ordersQuery.isLoading;

  const updateMutation = useMutation({
    mutationFn: ({
      orderId,
      nextStatus,
    }: {
      orderId: number;
      nextStatus: string;
    }) => updateOrderStatus(orderId, nextStatus),
    onMutate: async ({ orderId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["manage", "orders"] });
      const previousOrdersData = queryClient.getQueryData<{
        orders: OrderResponse[];
        restaurantsById: Record<number, RestaurantResponse>;
      }>(["manage", "orders"]);

      if (previousOrdersData) {
        queryClient.setQueryData(["manage", "orders"], {
          ...previousOrdersData,
          orders: previousOrdersData.orders.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: nextStatus }
              : order,
          ),
        });
      }
      return { previousOrdersData };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrdersData) {
        queryClient.setQueryData(
          ["manage", "orders"],
          context.previousOrdersData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["manage", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["manage", "overview"] });
    },
  });

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => order.orderStatus === activeTab);
  }, [activeTab, orders]);

  const pendingCount = useMemo(
    () => orders.filter((order) => order.orderStatus === "pending").length,
    [orders],
  );
  const activeCount = useMemo(
    () =>
      orders.filter(
        (order) => !["completed", "cancelled"].includes(order.orderStatus),
      ).length,
    [orders],
  );
  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter(
        (order) =>
          order.orderStatus === "completed" &&
          new Date(order.createdAt).toDateString() === today,
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }, [orders]);

  const errorMessage = ordersQuery.error
    ? ordersQuery.error instanceof ApiError
      ? ordersQuery.error.message
      : "Không thể tải đơn hàng."
    : updateMutation.error
      ? updateMutation.error instanceof ApiError
        ? updateMutation.error.message
        : "Không thể cập nhật trạng thái đơn."
      : "";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
            Quản lý đơn
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#23140c]">
            Xác nhận đơn hàng
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
            Xem đơn mới từ khách, xác nhận và chuyển đơn sang giao hàng. Hoàn
            thành sẽ do khách xác nhận.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2.5rem] bg-white p-6 ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-[#23140c]">
                {pendingCount}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#704322]/45">
                Chờ xác nhận
              </p>
            </div>
            <Clock size={32} weight="bold" className="text-amber-500" />
          </div>
        </div>
        <div className="rounded-[2.5rem] bg-white p-6 ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-[#23140c]">
                {activeCount}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#704322]/45">
                Đang xử lý
              </p>
            </div>
            <CookingPot size={32} weight="bold" className="text-orange-500" />
          </div>
        </div>
        <div className="rounded-[2.5rem] bg-[#23140c] p-6 text-white ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-orange-400">
                {formatMoney(todayRevenue)}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-white/35">
                Đã nhận hôm nay
              </p>
            </div>
            <Receipt size={32} weight="bold" className="text-orange-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-all active:scale-95 ${activeTab === tab.value ? "bg-[#23140c] text-white" : "bg-white text-[#704322]/70 ring-1 ring-black/5 hover:text-[#ff6b00]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div className=" rounded-3xl bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[2.5rem] bg-white ring-1 ring-black/5"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-[#23140c]/10 bg-white px-6 py-20 text-center">
          <Receipt
            size={48}
            weight="bold"
            className="mx-auto text-orange-200"
          />
          <h2 className="mt-5 text-2xl font-black text-[#23140c]">
            Không có đơn hàng
          </h2>
          <p className="mt-3 text-sm font-bold text-[#704322]/55">
            Chưa có đơn nào trong trạng thái đang chọn.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const status =
              statusConfig[order.orderStatus] ?? statusConfig.pending;
            const restaurant = restaurantsById[order.restaurantId];
            const isUpdating =
              updateMutation.isPending &&
              updateMutation.variables?.orderId === order.id;
            return (
              <article
                key={order.id}
                className="rounded-[2.5rem] bg-white p-5 shadow-[0_18px_45px_-28px_rgba(35,20,12,0.35)] ring-1 ring-black/5 sm:p-7"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black text-[#23140c]">
                        Đơn #{order.id}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${status.tone}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-[#704322]/60">
                      <span>{formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <Link
                        href={`/manage/restaurants/${order.restaurantId}`}
                        className="inline-flex items-center gap-1 text-[#ff6b00] hover:text-[#e45f00]"
                      >
                        <Storefront size={16} weight="bold" />
                        {restaurant?.name ?? "Nhà hàng"}
                      </Link>
                      <span>•</span>
                      <span>{order.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-2xl font-black text-[#ff6b00]">
                      {formatMoney(order.totalAmount)}
                    </p>
                    <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#704322]/45">
                      {order.paymentMethod === "cash" ? "Tiền mặt" : "Thẻ"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-bold text-[#704322]/55">
                    Tạm tính {formatMoney(order.subtotal)} • Phí giao{" "}
                    {formatMoney(order.deliveryFee)}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#23140c] px-5 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
                    >
                      <Eye size={18} weight="bold" />
                      Chi tiết
                    </Link>
                    {status.action ? (
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            orderId: order.id,
                            nextStatus: status.action!.next,
                          })
                        }
                        disabled={isUpdating}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white transition-all hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                      >
                        {status.action.next === "delivering" ? (
                          <Truck size={18} weight="bold" />
                        ) : (
                          <CheckCircle size={18} weight="bold" />
                        )}
                        {isUpdating ? "Đang cập nhật..." : status.action.label}
                      </button>
                    ) : order.orderStatus === "delivering" ? (
                      <span className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-50 px-5 text-sm font-black text-sky-700 ring-1 ring-sky-100">
                        Chờ khách xác nhận
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
