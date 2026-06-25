"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  CaretLeft,
  CaretRight,
  Clock,
  ForkKnife,
  MagnifyingGlass,
  Minus,
  Plus,
  Storefront,
  WarningCircle,
} from "@phosphor-icons/react";
import { getDishes, DishResponse } from "@/lib/dish";
import { getAllCategories } from "@/lib/category";
import { useCart } from "@/contexts/CartContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const DISH_FALLBACK_IMAGE =
  "https://picsum.photos/seed/hungerdash-dish/500/500";

function buildDishImage(dish: DishResponse) {
  if (dish.image?.trim()) {
    return dish.image;
  }

  return DISH_FALLBACK_IMAGE.replace("hungerdash-dish", "dish-" + dish.id);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}
function useDebouncedValue(value: string, delay = 450) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export default function MenuPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryName, setActiveCategoryName] = useState<string | "all">(
    "all",
  );
  const debouncedSearch = useDebouncedValue(searchQuery);

  const { items, addToCart, removeFromCart } = useCart();

  // reuse cache from home page
  const { data: categoryNames = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.map((c) => c.name),
  });
  const {
    data: dishesResult,
    isLoading,
    isPlaceholderData,
    error,
  } = useQuery({
    queryKey: [
      "dishes",
      { search: debouncedSearch, category: activeCategoryName, page },
    ],
    queryFn: () =>
      getDishes({
        search: debouncedSearch.trim() || undefined,
        categoryName:
          activeCategoryName === "all" ? undefined : activeCategoryName,
        isAvailable: true,
        sortBy: "createdAt",
        sortOrder: "DESC",
        page,
        limit: 12,
      }),
    placeholderData: keepPreviousData,
  });
  const dishes = dishesResult?.data ?? [];
  const total = dishesResult?.meta.total ?? 0;
  const totalPages = Math.max(dishesResult?.meta.totalPages ?? 1, 1);
  const errorMessage = error instanceof Error ? error.message : "";
  function resetToFirstPage(action: () => void) {
    setPage(1);
    action();
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] pb-20">
      <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-10">
        <header className="mb-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2"
            >
              <div className="grid size-9 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                <ForkKnife size={18} weight="bold" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-600">
                Thực đơn
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="max-w-4xl text-5xl font-black tracking-tight text-[#23140c] md:text-7xl"
            >
              Chọn món ngon từ các nhà hàng yêu thích
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-6 max-w-2xl text-base font-bold leading-relaxed text-[#704322]/70 md:text-lg"
            >
              Duyệt món theo danh mục, tìm nhanh theo tên món hoặc nhà hàng, rồi
              thêm vào giỏ hàng chỉ trong một thao tác.
            </motion.p>
          </div>

          <div className="rounded-4xl border border-[#23140c]/5 bg-white p-5 shadow-[0_24px_50px_-24px_rgba(35,20,12,0.18)]">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#704322]/40">
              Đang hiển thị
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-4xl font-black tracking-tight text-[#23140c]">
                  {total}
                </p>
                <p className="mt-1 text-xs font-bold text-[#704322]/50">
                  món có thể đặt
                </p>
              </div>
              <div className="rounded-2xl bg-orange-50 px-4 py-3 text-right text-orange-600">
                <p className="text-xs font-black">{categoryNames.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  danh mục
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="sticky top-24 z-20 mb-10 space-y-4 rounded-4xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_45px_-28px_rgba(35,20,12,0.2)] backdrop-blur-xl">
          <div className="relative">
            <MagnifyingGlass className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#704322]/35" />
            <input
              type="text"
              placeholder="Tìm món ăn hoặc nhà hàng..."
              value={searchQuery}
              onChange={(event) =>
                resetToFirstPage(() => setSearchQuery(event.target.value))
              }
              className="h-14 w-full rounded-[1.25rem] border border-[#23140c]/5 bg-[#fffaf4] pl-13 pr-5 text-sm font-bold text-[#23140c] outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() =>
                resetToFirstPage(() => setActiveCategoryName("all"))
              }
              className={
                "whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-black transition-all active:scale-[0.98] " +
                (activeCategoryName === "all"
                  ? "bg-[#23140c] text-white shadow-lg shadow-[#23140c]/10"
                  : "bg-[#fffaf4] text-[#704322]/65 hover:bg-orange-50 hover:text-orange-600")
              }
            >
              Tất cả
            </button>
            {categoryNames.map((categoryName) => (
              <button
                key={categoryName}
                onClick={() =>
                  resetToFirstPage(() => setActiveCategoryName(categoryName))
                }
                className={
                  "whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-black transition-all active:scale-[0.98] " +
                  (activeCategoryName === categoryName
                    ? "bg-[#23140c] text-white shadow-lg shadow-[#23140c]/10"
                    : "bg-[#fffaf4] text-[#704322]/65 hover:bg-orange-50 hover:text-orange-600")
                }
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[25rem] animate-pulse rounded-4xl bg-white ring-1 ring-[#23140c]/5"
              />
            ))}
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[2.5rem] bg-white p-10 text-center ring-1 ring-red-100">
            <WarningCircle size={64} weight="bold" className="text-red-500" />
            <h2 className="mt-6 text-2xl font-black text-[#23140c]">
              Đã xảy ra lỗi
            </h2>
            <p className="mt-2 font-bold text-[#704322]/70">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 rounded-2xl bg-[#23140c] px-8 py-4 text-sm font-black text-white shadow-lg shadow-[#23140c]/10 active:scale-95"
            >
              Thử lại
            </button>
          </div>
        ) : dishes.length === 0 ? (
          <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[2.5rem] bg-white p-10 text-center ring-1 ring-[#23140c]/5">
            <div className="grid size-20 place-items-center rounded-3xl bg-orange-50 text-orange-200">
              <ForkKnife size={40} weight="bold" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-[#23140c]">
              Không tìm thấy món nào
            </h2>
            <p className="mt-2 font-bold text-[#704322]/70">
              Hãy thử đổi danh mục hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {dishes.map((dish) => {
              const cartItem = items.find((item) => item.id === dish.id);
              const quantity = cartItem?.quantity ?? 0;

              return (
                <motion.article
                  key={dish.id}
                  variants={itemVariants}
                  className="group flex min-h-[25rem] flex-col overflow-hidden rounded-4xl bg-white p-4 ring-1 ring-[#23140c]/5 transition-all hover:-translate-y-1 hover:shadow-[0_28px_55px_-24px_rgba(35,20,12,0.22)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-orange-50">
                    <Image
                      src={buildDishImage(dish)}
                      alt={dish.name}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#23140c]/45 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#704322] backdrop-blur-md">
                      {dish.category?.name ?? "Món ăn"}
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <AnimatePresence>
                        {quantity > 0 && (
                          <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="flex items-center gap-2 overflow-hidden rounded-full bg-white p-1 shadow-xl"
                          >
                            <button
                              onClick={() => removeFromCart(dish.id)}
                              className="grid size-8 place-items-center rounded-full bg-orange-50 text-orange-600 transition-colors hover:bg-orange-100"
                            >
                              <Minus size={14} weight="bold" />
                            </button>
                            <span className="w-4 text-center text-xs font-black text-[#23140c]">
                              {quantity}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() =>
                          addToCart({
                            id: dish.id,
                            name: dish.name,
                            price: Number(dish.price),
                            restaurantId: dish.restaurantId,
                            restaurantName: dish.restaurant?.name ?? "Nhà hàng",
                            image: buildDishImage(dish),
                          })
                        }
                        className="grid size-10 place-items-center rounded-full bg-[#ff6b00] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                      >
                        <Plus size={20} weight="bold" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col pt-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="grid size-6 place-items-center rounded-full bg-orange-50 text-orange-600">
                        <Storefront size={13} weight="fill" />
                      </div>
                      <Link
                        href={"/restaurants/" + dish.restaurantId}
                        className="truncate text-[10px] font-black uppercase tracking-widest text-[#704322]/50 transition-colors hover:text-orange-500"
                      >
                        {dish.restaurant?.name ?? "Nhà hàng"}
                      </Link>
                    </div>
                    <h3 className="line-clamp-1 text-xl font-black tracking-tight text-[#23140c] transition-colors group-hover:text-orange-600">
                      {dish.name}
                    </h3>
                    <p className="mt-2 min-h-[2.5rem] text-xs font-bold leading-relaxed text-[#704322]/55 line-clamp-2">
                      {dish.description ||
                        "Món ăn được chế biến mỗi ngày, sẵn sàng thêm vào giỏ hàng của bạn."}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#704322]/35">
                          Giá món
                        </p>
                        <p className="text-2xl font-black tracking-tight text-[#23140c]">
                          {formatPrice(dish.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-orange-600">
                        <Clock size={16} weight="bold" />
                        <span className="text-xs font-black">20 min</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        {!isLoading && !errorMessage && totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() =>
                setPage((currentPage) => Math.max(currentPage - 1, 1))
              }
              disabled={page === 1}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#23140c] ring-1 ring-[#23140c]/5 transition-all hover:text-orange-600 disabled:pointer-events-none disabled:opacity-40 active:scale-95"
            >
              <CaretLeft size={18} weight="bold" />
              Trang trước
            </button>
            <div className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#704322] ring-1 ring-[#23140c]/5">
              Trang {page} / {totalPages}
            </div>
            <button
              onClick={() =>
                setPage((currentPage) => Math.min(currentPage + 1, totalPages))
              }
              disabled={page === totalPages}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#23140c] ring-1 ring-[#23140c]/5 transition-all hover:text-orange-600 disabled:pointer-events-none disabled:opacity-40 active:scale-95"
            >
              Trang sau
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
