"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  MoneyWavy,
  Phone,
  Receipt,
  Truck,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { createOrder, OrderResponse } from "@/lib/order";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getRestaurantById } from "@/lib/restaurant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const paymentOptions = [
  {
    value: "cash",
    label: "Tiền mặt",
    description: "Thanh toán khi nhận hàng",
    icon: MoneyWavy,
  },
  {
    value: "vnpay",
    label: "VNPay",
    description: "Thanh toán qua cổng VNPay",
    icon: CreditCard,
  },
];

function isOnlinePayment(value: string) {
  return value === "vnpay";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CheckoutPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { items, totalItems, totalPrice, clearCart, flushCartSync } = useCart();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [errorMessage, setErrorMessage] = useState("");
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const queryClient = useQueryClient();
  const restaurantId = items[0]?.restaurantId;

  const { data: deliveryFee = 0 } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => getRestaurantById(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    select: (data) => Number(data.deliveryFee || 0), // ⭐ Chỉ lấy deliveryFee
  });
  const grandTotal = useMemo(
    () => totalPrice + deliveryFee,
    [deliveryFee, totalPrice],
  );

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async (order) => {
      await clearCart();
      queryClient.invalidateQueries({ queryKey: ["myOrders"] }); // ⭐ Chuẩn bị sẵn cho Orders page
      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        setCreatedOrder(order);
      }
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Không thể tạo đơn hàng.",
      );
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await flushCartSync();
    createOrderMutation.mutate({
      phoneNumber,
      street,
      city,
      note,
      paymentMethod,
      deliveryFee,
    });
  }

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
          <h1 className="text-2xl font-black text-[#23140c]">
            Bạn cần đăng nhập
          </h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">
            Đăng nhập để tiếp tục đặt hàng và lưu thông tin đơn của bạn.
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

  if (createdOrder) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4 text-center">
        <div className="max-w-lg rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[1.5rem] bg-emerald-50 text-emerald-600">
            <CheckCircle size={44} weight="fill" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#23140c]">
            Đặt hàng thành công
          </h1>
          <p className="mt-3 text-sm font-bold text-[#704322]/60">
            Mã đơn hàng #{createdOrder.id}. Nhà hàng sẽ xác nhận đơn trong thời
            gian sớm nhất.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/orders"
              className="inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
            >
              Xem trạng thái đơn
            </Link>
            <Link
              href="/restaurants"
              className="inline-flex h-12 items-center justify-center rounded-[1rem] bg-orange-50 px-6 text-sm font-black text-[#ff6b00] transition-all hover:bg-orange-100 active:scale-95"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#fffcf8] pt-32 pb-24 lg:pt-40">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <header className="mb-10">
          <Link
            href="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff6b00] hover:text-[#e45f00]"
          >
            <ArrowLeft size={18} weight="bold" />
            Quay lại giỏ hàng
          </Link>
          <h1 className="text-5xl font-black tracking-tight text-[#23140c] sm:text-6xl">
            Checkout
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
            Kiểm tra món, nhập thông tin giao hàng rồi xác nhận đặt hàng.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.18)] ring-1 ring-black/5 sm:p-8"
          >
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-black text-[#23140c]">
                <Truck size={28} weight="bold" className="text-[#ff6b00]" />
                Thông tin giao hàng
              </h2>
              {user?.username && (
                <p className="mt-2 text-sm font-bold text-[#704322]/55">
                  Người đặt: {user.username}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="rounded-[1rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
                {errorMessage}
              </p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-black text-[#23140c]">
                  Số điện thoại
                </span>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35"
                    size={20}
                    weight="bold"
                  />
                  <input
                    required
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="0901234567"
                    className="h-14 w-full rounded-[1rem] border border-[#23140c]/10 bg-[#fffcf8] pl-12 pr-4 text-sm font-bold text-[#23140c] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-black text-[#23140c]">
                  Thành phố
                </span>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35"
                    size={20}
                    weight="bold"
                  />
                  <input
                    required
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Hồ Chí Minh"
                    className="h-14 w-full rounded-[1rem] border border-[#23140c]/10 bg-[#fffcf8] pl-12 pr-4 text-sm font-bold text-[#23140c] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-black text-[#23140c]">
                Địa chỉ giao hàng
              </span>
              <input
                required
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder="Số nhà, tên đường, phường/xã"
                className="h-14 w-full rounded-[1rem] border border-[#23140c]/10 bg-[#fffcf8] px-4 text-sm font-bold text-[#23140c] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-black text-[#23140c]">Ghi chú</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ví dụ: gọi trước khi giao, không lấy hành..."
                rows={4}
                className="w-full resize-none rounded-[1rem] border border-[#23140c]/10 bg-[#fffcf8] px-4 py-3 text-sm font-bold text-[#23140c] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <div className="space-y-3">
              <p className="text-sm font-black text-[#23140c]">Thanh toán</p>
              <div className="grid gap-3 md:grid-cols-3">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = paymentMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPaymentMethod(option.value)}
                      className={`min-h-24 rounded-[1rem] p-4 text-left transition-all active:scale-95 ${isSelected ? "bg-[#23140c] text-white" : "bg-[#fffcf8] text-[#704322] ring-1 ring-[#23140c]/10 hover:text-[#ff6b00]"}`}
                    >
                      <Icon
                        size={24}
                        weight="bold"
                        className={
                          isSelected ? "text-orange-400" : "text-[#ff6b00]"
                        }
                      />
                      <span className="mt-3 block text-sm font-black">
                        {option.label}
                      </span>
                      <span
                        className={`mt-1 block text-xs font-bold ${isSelected ? "text-white/55" : "text-[#704322]/45"}`}
                      >
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
              {isOnlinePayment(paymentMethod) && (
                <div className="flex gap-3 rounded-[1.25rem] bg-orange-50 p-4 text-sm font-bold text-[#704322] ring-1 ring-orange-100">
                  <CreditCard
                    size={22}
                    weight="bold"
                    className="shrink-0 text-[#ff6b00]"
                  />
                  <p>
                    Bạn sẽ được chuyển sang cổng VNPay để chọn ngân hàng/thẻ và
                    hoàn tất thanh toán.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={createOrderMutation.isPending || items.length === 0}
              className="flex h-14 w-full items-center justify-center rounded-[1rem] bg-[#ff6b00] text-sm font-black text-white transition-all hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
            >
              {createOrderMutation.isPending ? "Đang đặt hàng..." : "Đặt hàng"}
            </button>
          </form>

          <aside className="rounded-[2rem] bg-[#23140c] p-6 text-white shadow-[0_24px_60px_-25px_rgba(35,20,12,0.5)] sm:p-8 lg:sticky lg:top-32">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-black tracking-tight">
              <Receipt size={28} weight="bold" className="text-orange-500" />
              Đơn hàng
            </h2>

            {items.length === 0 ? (
              <div className="rounded-[1.5rem] bg-white/5 p-5 text-sm font-bold text-white/55">
                Giỏ hàng đang trống.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-[1.25rem] bg-white/5 p-3 ring-1 ring-white/10"
                    >
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-500/20 text-xs font-black text-orange-300">
                        {item.quantity}x
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-white">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs font-bold text-white/40">
                          {item.restaurantName}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-orange-400">
                        {formatMoney(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-5 space-y-3">
                  <div className="flex justify-between text-sm font-bold text-white/55">
                    <span>Tổng món ({totalItems})</span>
                    <span>{formatMoney(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white/55">
                    <span>Phí giao hàng</span>
                    <span>{formatMoney(deliveryFee)}</span>
                  </div>
                  <div className="flex items-end justify-between pt-3">
                    <span className="text-lg font-bold">Tổng cộng</span>
                    <span className="text-3xl font-black tracking-tight text-orange-500">
                      {formatMoney(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
