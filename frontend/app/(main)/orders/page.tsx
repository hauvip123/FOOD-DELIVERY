"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CookingPot,
  CreditCard,
  Eye,
  Package,
  Receipt,
  Star,
  Truck,
  XCircle,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import {
  cancelOrder,
  confirmOrderReceived,
  createVnpayPaymentUrl,
  getMyOrders,
  OrderResponse,
} from "@/lib/order";
import { getRestaurantById, RestaurantResponse } from "@/lib/restaurant";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const statusConfig: Record<
  string,
  { label: string; tone: string; step: number }
> = {
  pending: {
    label: "Chờ xác nhận",
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
    step: 0,
  },
  confirmed: {
    label: "Đã xác nhận",
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
    step: 1,
  },
  preparing: {
    label: "Đang chuẩn bị",
    tone: "bg-orange-50 text-orange-700 ring-orange-100",
    step: 2,
  },
  delivering: {
    label: "Đang giao",
    tone: "bg-sky-50 text-sky-700 ring-sky-100",
    step: 3,
  },
  completed: {
    label: "Đã nhận hàng",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    step: 4,
  },
  cancelled: {
    label: "Đã hủy",
    tone: "bg-red-50 text-red-700 ring-red-100",
    step: -1,
  },
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Tiền mặt",
  online_card: "Thẻ / ví online",
  bank_transfer: "Chuyển khoản QR",
  vnpay: "VNPay",
};

const paymentStatusConfig: Record<string, { label: string; tone: string }> = {
  pending: {
    label: "Chờ thanh toán",
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  awaiting_payment: {
    label: "Chờ thanh toán online",
    tone: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  paid: {
    label: "Đã thanh toán",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  failed: {
    label: "Thanh toán lỗi",
    tone: "bg-red-50 text-red-700 ring-red-100",
  },
};

function isOnlinePayment(value: string) {
  return value === "vnpay";
}

const steps = [
  { label: "Chờ xác nhận", icon: Clock },
  { label: "Xác nhận", icon: CheckCircle },
  { label: "Chuẩn bị", icon: CookingPot },
  { label: "Đang giao", icon: Truck },
  { label: "Đã nhận", icon: Package },
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

export default function OrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
 
  const queryClient = useQueryClient();
  const [payingId, setPayingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [receivingId, setReceivingId] = useState<number | null>(null);
  const [customError, setCustomError] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const orders = await getMyOrders();
      const restaurantIds = [
        ...new Set(orders.map((order) => order.restaurantId)),
      ];
      const restaurants = await Promise.all(
        restaurantIds.map((id) => getRestaurantById(id).catch(() => null)),
      );
      return {
        orders,
        restaurants: Object.fromEntries(
          restaurants.filter(Boolean).map((r) => [r!.id, r!]),
        ),
      };
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const orders = data?.orders ?? [];
  const restaurantsById = data?.restaurants ?? {};

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) => !["completed", "cancelled"].includes(order.orderStatus),
      ),
    [orders],
  );

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onMutate: (id) => {
      setCancellingId(id);
      setCustomError("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myOrders"],
      });
    },
    onError: (err) => {
      setCustomError(err instanceof ApiError ? err.message : "Có lỗi xảy ra khi hủy đơn.");
    },
    onSettled: () => {
      setCancellingId(null);
    },
  });

  const confirmReceivedMutation = useMutation({
    mutationFn: (id: number) => confirmOrderReceived(id),
    onMutate: (id) => {
      setReceivingId(id);
      setCustomError("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (err) => {
      setCustomError(err instanceof ApiError ? err.message : "Có lỗi xảy ra khi xác nhận nhận hàng.");
    },
    onSettled: () => {
      setReceivingId(null);
    },
  });

  async function handleConfirmPayment(id: number) {
    setPayingId(id);
    setCustomError("");
    try {
      const { paymentUrl } = await createVnpayPaymentUrl(id);
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("Không lấy được đường dẫn thanh toán.");
      }
    } catch (err) {
      setCustomError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Không thể xác nhận thanh toán.",
      );
      setPayingId(null);
    }
  }

  async function handleCancel(id: number) {
    cancelMutation.mutate(id);
  }

  async function handleConfirmReceived(id: number) {
    confirmReceivedMutation.mutate(id);
  }

  const errorMessage = (error instanceof Error ? error.message : "") || customError;

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
          <h1 className="text-2xl font-black text-[#23140c]">
            Bạn cần đăng nhập
          </h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">
            Đăng nhập để xem trạng thái đơn hàng của bạn.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf8] pt-32 pb-24 lg:pt-40">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/restaurants"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff6b00] hover:text-[#e45f00]"
            >
              <ArrowLeft size={18} weight="bold" />
              Tiếp tục mua sắm
            </Link>
            <h1 className="text-5xl font-black tracking-tight text-[#23140c] sm:text-6xl">
              Đơn hàng
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
              Theo dõi trạng thái xác nhận, chuẩn bị và giao hàng.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-black/5">
            <p className="text-3xl font-black text-[#23140c]">
              {activeOrders.length}
            </p>
            <p className="text-xs font-black uppercase tracking-widest text-[#704322]/50">
              Đơn đang xử lý
            </p>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-8 rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-[2rem] bg-white ring-1 ring-black/5"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#23140c]/10 bg-white px-6 py-24 text-center">
            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[1.5rem] bg-orange-50 text-[#ff6b00]">
              <Receipt size={42} weight="bold" />
            </div>
            <h2 className="text-2xl font-black text-[#23140c]">
              Chưa có đơn hàng
            </h2>
            <p className="mt-3 text-sm font-bold text-[#704322]/55">
              Khi bạn đặt hàng, trạng thái đơn sẽ xuất hiện tại đây.
            </p>
            <Link
              href="/restaurants"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
            >
              Chọn món ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status =
                statusConfig[order.orderStatus] ?? statusConfig.pending;
              const paymentStatus =
                paymentStatusConfig[order.paymentStatus] ??
                paymentStatusConfig.pending;
              const canPayOnline =
                isOnlinePayment(order.paymentMethod) &&
                order.paymentStatus !== "paid" &&
                order.orderStatus !== "cancelled";
              const canCancel = ["pending", "confirmed"].includes(
                order.orderStatus,
              );
              const canReceive = order.orderStatus === "delivering";
              const canReview = order.orderStatus === "completed";
              const restaurant = restaurantsById[order.restaurantId];
              return (
                <article
                  key={order.id}
                  className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${paymentStatus.tone}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-[#704322]/55">
                        {formatDate(order.createdAt)} •{" "}
                        {restaurant ? (
                          <Link
                            href={`/restaurants/${restaurant.id}`}
                            className="text-[#ff6b00] hover:text-[#e45f00]"
                          >
                            {restaurant.name}
                          </Link>
                        ) : (
                          <Link
                            href={`/restaurants/${order.restaurantId}`}
                            className="text-[#ff6b00] hover:text-[#e45f00]"
                          >
                            Nhà hàng
                          </Link>
                        )}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-2xl font-black text-[#ff6b00]">
                        {formatMoney(order.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#704322]/45">
                        {paymentMethodLabels[order.paymentMethod] ??
                          "Thanh toán online"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-5">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isDone = status.step >= index;
                      const isCancelled = order.orderStatus === "cancelled";
                      return (
                        <div
                          key={step.label}
                          className={`rounded-[1.25rem] px-3 py-4 text-center ring-1 ${isCancelled ? "bg-red-50 text-red-300 ring-red-100" : isDone ? "bg-[#23140c] text-white ring-[#23140c]" : "bg-[#fffcf8] text-[#704322]/35 ring-[#23140c]/5"}`}
                        >
                          <Icon size={24} weight="bold" className="mx-auto" />
                          <p className="mt-2 text-[11px] font-black uppercase tracking-widest">
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-bold text-[#704322]/55">
                      Tạm tính {formatMoney(order.subtotal)} • Phí giao{" "}
                      {formatMoney(order.deliveryFee)}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-[#23140c] px-5 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
                      >
                        <Eye size={18} weight="bold" />
                        Xem chi tiết
                      </Link>
                      {canPayOnline && (
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          disabled={payingId === order.id}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-orange-50 px-5 text-sm font-black text-orange-600 ring-1 ring-orange-100 transition-all hover:bg-orange-100 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                        >
                          <CreditCard size={18} weight="bold" />
                          {payingId === order.id
                            ? "Đang chuyển..."
                            : order.paymentStatus === "failed"
                              ? "Thanh toán lại"
                              : "Thanh toán"}
                        </button>
                      )}
                      {canReceive && (
                        <button
                          onClick={() => handleConfirmReceived(order.id)}
                          disabled={receivingId === order.id}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-emerald-500 px-5 text-sm font-black text-white transition-all hover:bg-emerald-600 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                        >
                          <Package size={18} weight="bold" />
                          {receivingId === order.id
                            ? "Đang xác nhận..."
                            : "Đã nhận hàng"}
                        </button>
                      )}
                      {canReview && (
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-orange-50 px-5 text-sm font-black text-orange-600 ring-1 ring-orange-100 transition-all hover:bg-orange-100 active:scale-95"
                        >
                          <Star size={18} weight="fill" />
                          Đánh giá
                        </Link>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-red-50 px-5 text-sm font-black text-red-600 ring-1 ring-red-100 transition-all hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                        >
                          <XCircle size={18} weight="bold" />
                          {cancellingId === order.id
                            ? "Đang hủy..."
                            : "Hủy đơn"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
