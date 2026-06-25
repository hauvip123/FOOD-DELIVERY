"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bank,
  CheckCircle,
  Clock,
  CookingPot,
  MapPin,
  Package,
  Phone,
  Receipt,
  ShieldCheck,
  Star,
  Truck,
  XCircle,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import {
  cancelOrder,
  confirmOrderReceived,
  createVnpayPaymentUrl,
  getOrderDetail,
} from "@/lib/order";
import { getRestaurantById } from "@/lib/restaurant";
import { createReview, getOrderReview } from "@/lib/review";
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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = Number(id);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const {
    data: detail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const data = await getOrderDetail(orderId);
      const [restaurantData, reviewData] = await Promise.all([
        getRestaurantById(data.order.restaurantId).catch(() => null),
        getOrderReview(data.order.id).catch(() => null),
      ]);
      return { ...data, restaurant: restaurantData, review: reviewData };
    },
    enabled: isAuthenticated && !Number.isNaN(orderId),
  });
  const review = detail?.review;
  const restaurant = detail?.restaurant;
  const order = detail?.order;
  const status = order
    ? (statusConfig[order.orderStatus] ?? statusConfig.pending)
    : statusConfig.pending;
  const paymentStatus = order
    ? (paymentStatusConfig[order.paymentStatus] ?? paymentStatusConfig.pending)
    : paymentStatusConfig.pending;
  const canPayOnline = Boolean(
    order &&
    isOnlinePayment(order.paymentMethod) &&
    order.paymentStatus !== "paid" &&
    order.orderStatus !== "cancelled",
  );
  const canCancel = Boolean(
    order && ["pending", "confirmed"].includes(order.orderStatus),
  );
  const canReceive = Boolean(order && order.orderStatus === "delivering");
  const canReview = Boolean(
    order && order.orderStatus === "completed" && !review,
  );

  const itemTotal = useMemo(() => {
    return (
      detail?.orderItem.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ) ?? 0
    );
  }, [detail]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["order", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["myOrders"],
      });
    },
  });
  async function handleConfirmPayment() {
    if (!order) return;

    setIsConfirmingPayment(true);
    setErrorMessage("");
    try {
      const { paymentUrl } = await createVnpayPaymentUrl(order.id);
      window.location.href = paymentUrl;
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Không thể xác nhận thanh toán.",
      );
    } finally {
      setIsConfirmingPayment(false);
    }
  }

  const confirmReceivedMutation = useMutation({
    mutationFn: () => confirmOrderReceived(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["order", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["myOrders"],
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: (createdReview) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      if (detail?.restaurant) {
        queryClient.invalidateQueries({
          queryKey: ["reviews", detail.restaurant.id],
        });
      }
    },
  });

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-4xl bg-white p-8 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
          <h1 className="text-2xl font-black text-[#23140c]">
            Bạn cần đăng nhập
          </h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">
            Đăng nhập để xem chi tiết đơn hàng.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
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
              href="/orders"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff6b00] hover:text-[#e45f00]"
            >
              <ArrowLeft size={18} weight="bold" />
              Quay lại đơn hàng
            </Link>
            <h1 className="text-5xl font-black tracking-tight text-[#23140c] sm:text-6xl">
              Chi tiết đơn #{id}
            </h1>
            {order && (
              <p className="mt-4 text-sm font-bold text-[#704322]/60">
                Đặt lúc {formatDate(order.createdAt)} •{" "}
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
            )}
          </div>
          {order && (
            <div className="flex flex-wrap gap-2">
              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-black ring-1 ${status.tone}`}
              >
                {status.label}
              </span>
              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-black ring-1 ${paymentStatus.tone}`}
              >
                {paymentStatus.label}
              </span>
            </div>
          )}
        </header>

        {errorMessage && (
          <div className="mb-8 rounded-3xl bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="h-96 animate-pulse rounded-4xl bg-white ring-1 ring-black/5" />
            <div className="h-80 animate-pulse rounded-4xl bg-white ring-1 ring-black/5" />
          </div>
        ) : !detail || !order ? (
          <div className="rounded-4xl border border-dashed border-[#23140c]/10 bg-white px-6 py-24 text-center">
            <h2 className="text-2xl font-black text-[#23140c]">
              Không tìm thấy đơn hàng
            </h2>
            <p className="mt-3 text-sm font-bold text-[#704322]/55">
              Đơn hàng không tồn tại hoặc chưa thể tải dữ liệu.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <section className="space-y-6">
              <div className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7">
                <h2 className="mb-5 text-2xl font-black text-[#23140c]">
                  Tiến trình
                </h2>
                <div className="grid gap-3 sm:grid-cols-5">
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
              </div>

              <div className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7">
                <h2 className="mb-5 text-2xl font-black text-[#23140c]">
                  Món đã đặt
                </h2>
                <div className="divide-y divide-[#23140c]/5">
                  {detail.orderItem.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-sm font-black text-[#ff6b00]">
                        {item.quantity}x
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-[#23140c]">
                          {item.name}
                        </h3>
                        {item.note && (
                          <p className="mt-1 text-xs font-bold text-[#704322]/50">
                            Ghi chú món: {item.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#23140c]">
                          {formatMoney(item.price * item.quantity)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#704322]/40">
                          {formatMoney(item.price)} / món
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7">
                <h2 className="mb-5 text-2xl font-black text-[#23140c]">
                  Giao hàng
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex gap-3 rounded-[1.25rem] bg-[#fffcf8] p-4 ring-1 ring-[#23140c]/5">
                    <MapPin
                      size={22}
                      weight="bold"
                      className="shrink-0 text-[#ff6b00]"
                    />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#704322]/40">
                        Địa chỉ
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#23140c]">
                        {detail.deliveryAddress?.street},{" "}
                        {detail.deliveryAddress?.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-[1.25rem] bg-[#fffcf8] p-4 ring-1 ring-[#23140c]/5">
                    <Phone
                      size={22}
                      weight="bold"
                      className="shrink-0 text-[#ff6b00]"
                    />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#704322]/40">
                        Số điện thoại
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#23140c]">
                        {order.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
                {detail.deliveryAddress?.note && (
                  <p className="mt-4 rounded-[1.25rem] bg-orange-50 p-4 text-sm font-bold text-[#704322]">
                    Ghi chú: {detail.deliveryAddress.note}
                  </p>
                )}
              </div>

              {order.orderStatus === "completed" && (
                <div className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
                        Đánh giá
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-[#23140c]">
                        Trải nghiệm đơn hàng
                      </h2>
                    </div>
                    {review && (
                      <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                        Đã gửi đánh giá
                      </span>
                    )}
                  </div>

                  {review ? (
                    <div className=" rounded-3xl bg-[#fffcf8] p-5 ring-1 ring-[#23140c]/5">
                      <div className="flex items-center gap-1 text-orange-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={22}
                            weight={index < review.rating ? "fill" : "bold"}
                            className={
                              index < review.rating
                                ? "text-orange-500"
                                : "text-[#704322]/20"
                            }
                          />
                        ))}
                      </div>
                      <p className="mt-4 text-sm font-bold leading-relaxed text-[#704322]/70">
                        {review.comment || "Bạn đã đánh giá đơn hàng này."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-[#704322]/40">
                          Số sao
                        </label>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const value = index + 1;
                            return (
                              <button
                                key={value}
                                onClick={() => setReviewRating(value)}
                                className="grid size-11 place-items-center rounded-2xl bg-[#fffcf8] text-orange-500 ring-1 ring-[#23140c]/5 transition-all hover:bg-orange-50 active:scale-95"
                              >
                                <Star
                                  size={24}
                                  weight={
                                    value <= reviewRating ? "fill" : "bold"
                                  }
                                  className={
                                    value <= reviewRating
                                      ? "text-orange-500"
                                      : "text-[#704322]/20"
                                  }
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="review-comment"
                          className="text-xs font-black uppercase tracking-widest text-[#704322]/40"
                        >
                          Nhận xét
                        </label>
                        <textarea
                          id="review-comment"
                          value={reviewComment}
                          onChange={(event) =>
                            setReviewComment(event.target.value)
                          }
                          rows={4}
                          placeholder="Món ăn, đóng gói và giao hàng thế nào?"
                          className="mt-2 w-full resize-none rounded-[1.25rem] bg-[#fffcf8] px-4 py-3 text-sm font-bold text-[#23140c] outline-none ring-1 ring-[#23140c]/10 transition-all placeholder:text-[#704322]/30 focus:ring-2 focus:ring-[#ff6b00]"
                        />
                      </div>
                      <button
                        onClick={() =>
                          reviewMutation.mutate({
                            orderId,
                            rating: reviewRating,
                            comment: reviewComment,
                          })
                        }
                        disabled={reviewMutation.isPending}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff6b00] px-6 text-sm font-black text-white transition-all hover:bg-[#e45f00] disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                      >
                        <Star size={18} weight="fill" />
                        {reviewMutation.isPending
                          ? "Đang gửi..."
                          : "Gửi đánh giá"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <aside className="rounded-4xl bg-[#23140c] p-6 text-white shadow-[0_24px_60px_-25px_rgba(35,20,12,0.5)] sm:p-8 lg:sticky lg:top-32">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-black tracking-tight">
                <Receipt size={28} weight="bold" className="text-orange-500" />
                Thanh toán
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-white/55">
                  <span>Tổng món</span>
                  <span>{formatMoney(itemTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white/55">
                  <span>Phí giao hàng</span>
                  <span>{formatMoney(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm font-bold text-white/55">
                  <span>Phương thức</span>
                  <span className="text-right">
                    {paymentMethodLabels[order.paymentMethod] ??
                      "Thanh toán online"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm font-bold text-white/55">
                  <span>Trạng thái</span>
                  <span className="text-right">{paymentStatus.label}</span>
                </div>
                <div className="border-t border-white/10 pt-5">
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-bold">Tổng cộng</span>
                    <span className="text-3xl font-black tracking-tight text-orange-500">
                      {formatMoney(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {canPayOnline && (
                <div className="mt-8 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Bank size={20} weight="bold" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Thanh toán online
                    </p>
                  </div>
                  <div className="mt-3 space-y-2 text-sm font-bold text-white/60">
                    <p>
                      Bấm nút bên dưới để quay lại cổng VNPay và hoàn tất giao
                      dịch.
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isConfirmingPayment}
                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6b00] text-sm font-black text-white transition-all hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                  >
                    <ShieldCheck size={18} weight="bold" />
                    {isConfirmingPayment
                      ? "Đang chuyển..."
                      : order.paymentStatus === "failed"
                        ? "Thanh toán lại"
                        : "Thanh toán qua VNPay"}
                  </button>
                </div>
              )}

              {canReceive && (
                <button
                  onClick={() => confirmReceivedMutation.mutate()}
                  disabled={confirmReceivedMutation.isPending}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-sm font-black text-white transition-all hover:bg-emerald-600 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                >
                  <Package size={18} weight="bold" />
                  {confirmReceivedMutation.isPending
                    ? "Đang xác nhận..."
                    : "Đã nhận hàng"}
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-black text-white transition-all hover:bg-red-600 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                >
                  <XCircle size={18} weight="bold" />
                  {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn"}
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
