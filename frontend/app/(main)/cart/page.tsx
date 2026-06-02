"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Receipt,
  Truck,
  Ticket,
  Storefront,
  ArrowRight,
  ShieldCheck,
  ShoppingCart
} from "@phosphor-icons/react";
import { useCart, CartItem } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, addToCart, removeFromCart, clearCart, totalPrice, totalItems, errorMessage } = useCart();

  // Group items by restaurant
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          name: item.restaurantName,
          items: []
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {} as Record<number, { name: string; items: CartItem[] }>);
  }, [items]);

  const deliveryFee = items.length > 0 ? 15000 : 0;
  const grandTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8 rounded-full bg-orange-50 p-12 text-orange-200"
        >
          <ShoppingCart size={80} weight="bold" />
        </motion.div>
        <h1 className="text-3xl font-black text-[#23140c]">Giỏ hàng của bạn đang trống</h1>
        <p className="mt-4 max-w-xs text-lg font-medium text-[#23140c]/40">
          Có vẻ như bạn chưa chọn được món ngon nào. Quay lại thực đơn để khám phá nhé!
        </p>
        <Link
          href="/restaurants"
          className="mt-10 inline-flex h-16 items-center gap-3 rounded-2xl bg-[#23140c] px-10 text-lg font-black text-white transition-all hover:bg-orange-500 active:scale-95"
        >
          <ArrowLeft size={24} weight="bold" />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf8] pt-32 pb-24 lg:pt-40">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <header className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/restaurants"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff6b00] hover:text-[#e45f00]"
            >
              <ArrowLeft size={18} weight="bold" />
              Quay lại cửa hàng
            </Link>
            <h1 className="text-5xl font-black tracking-tighter text-[#23140c] sm:text-6xl">
              Giỏ hàng của bạn
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-sm font-bold text-[#23140c]/40 hover:text-red-500 transition-colors"
          >
            <Trash size={20} />
            Xóa tất cả
          </button>
        </header>

        {errorMessage && (
          <div className="mb-8 rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* Left Column: Items List */}
          <div className="flex-1 space-y-8">
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedItems).map(([resId, group], resIdx) => (
                <motion.section
                  key={resId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: resIdx * 0.1 }}
                  className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] ring-1 ring-black/5"
                >
                  <div className="flex items-center gap-3 border-b border-[#23140c]/5 bg-orange-50/30 px-8 py-5">
                    <Storefront size={24} weight="bold" className="text-orange-500" />
                    <h2 className="text-lg font-black text-[#23140c]">{group.name}</h2>
                  </div>

                  <div className="divide-y divide-[#23140c]/5 px-4 sm:px-8">
                    {group.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="group flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:gap-6"
                      >
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#fff7ed]">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          )}
                        </div>

                        <div className="flex flex-1 flex-col">
                          <h3 className="text-xl font-black text-[#23140c]">{item.name}</h3>
                          <p className="text-sm font-bold text-[#23140c]/40">Đơn giá: {(item.price / 1000).toLocaleString()}k</p>
                        </div>

                        <div className="flex items-center justify-between gap-6 sm:justify-end">
                          <div className="flex items-center gap-4 rounded-xl bg-[#23140c] p-1 shadow-lg">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-90"
                            >
                              <Minus size={18} weight="bold" />
                            </button>
                            <span className="min-w-[2ch] text-center text-lg font-black text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="flex size-9 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600 active:scale-90"
                            >
                              <Plus size={18} weight="bold" />
                            </button>
                          </div>

                          <div className="min-w-[80px] text-right">
                            <p className="text-xl font-black text-[#23140c]">
                              {((item.price * item.quantity) / 1000).toLocaleString()}k
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>

          {/* Right Column: Summary */}
          <aside className="w-full lg:sticky lg:top-32 lg:w-[400px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[2.5rem] bg-[#23140c] p-8 text-white shadow-2xl shadow-orange-500/10"
            >
              <h2 className="mb-8 flex items-center gap-3 text-2xl font-black tracking-tight">
                <Receipt size={28} weight="bold" className="text-orange-500" />
                Tạm tính
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-white/50">
                  <span className="font-bold">Tổng món ({totalItems})</span>
                  <span className="font-black">{(totalPrice / 1000).toLocaleString()}k</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span className="flex items-center gap-2 font-bold">
                    <Truck size={20} />
                    Phí giao hàng
                  </span>
                  <span className="font-black">{(deliveryFee / 1000).toLocaleString()}k</span>
                </div>

                <div className="py-4">
                  <div className="flex h-14 items-center gap-3 rounded-2xl bg-white/5 px-4 ring-1 ring-white/10 focus-within:ring-orange-500/50 transition-all">
                    <Ticket size={24} weight="bold" className="text-orange-500" />
                    <input
                      type="text"
                      placeholder="Mã giảm giá"
                      className="flex-1 bg-transparent text-sm font-bold outline-none"
                    />
                    <button className="text-sm font-black text-orange-500 hover:text-orange-400">Áp dụng</button>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-bold">Tổng cộng</span>
                    <div className="text-right">
                      <p className="text-3xl font-black tracking-tighter text-orange-500">
                        {(grandTotal / 1000).toLocaleString()}k
                      </p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Đã bao gồm VAT</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="group mt-10 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
              >
                Tiến hành đặt hàng
                <ArrowRight size={24} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </Link>

              <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-bold text-white/30 uppercase tracking-widest">
                <ShieldCheck size={18} weight="bold" />
                Thanh toán an toàn & Bảo mật
              </div>
            </motion.div>

            <div className="mt-6 flex items-center gap-4 px-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Truck size={20} weight="bold" />
              </div>
              <p className="text-xs font-medium leading-relaxed text-[#23140c]/60">
                Miễn phí giao hàng cho đơn từ <span className="font-black text-[#23140c]">200k</span>. Nhập mã <span className="font-black text-[#ff6b00]">FREESHIP</span> ngay!
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
