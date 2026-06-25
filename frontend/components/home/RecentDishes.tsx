"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Heart, Plus, Sparkle } from "@phosphor-icons/react";
import type { DishResponse } from "@/lib/dish";

const fallbackDishes = [
  {
    id: 0,
    name: "Bún bò Huế topping đầy đủ",
    restaurantId: 0,
    restaurant: "Bếp Mệ An",
    category: "Mới lên sóng",
    price: 72000,
    time: "28 phút",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=700",
  },
  {
    id: 0,
    name: "Cơm tấm sườn bì chả",
    restaurantId: 0,
    restaurant: "Cơm Tấm Ba Ghiền",
    category: "Gần đây",
    price: 64000,
    time: "22 phút",
    image:
      "https://images.unsplash.com/photo-1512058560366-cd2427ff064f?auto=format&fit=crop&q=80&w=700",
  },
  {
    id: 0,
    name: "Taco bò phô mai kéo sợi",
    restaurantId: 0,
    restaurant: "Taco Town",
    category: "Đang thử nhiều",
    price: 88000,
    time: "31 phút",
    image:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=700",
  },
  {
    id: 0,
    name: "Chè khúc bạch trái cây",
    restaurantId: 0,
    restaurant: "Ngọt Ơi",
    category: "Món mới",
    price: 39000,
    time: "18 phút",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=700",
  },
];

type RecentDishCard = {
  id: number;
  name: string;
  restaurantId: number;
  restaurant: string;
  category: string;
  price: number;
  time: string;
  image: string;
};

type RecentDishesProps = {
  dishes?: DishResponse[];
  isLoading?: boolean;
};

const DISH_FALLBACK_IMAGE =
  "https://picsum.photos/seed/hungerdash-home-dish/700/500";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

function buildDishImage(dish: DishResponse) {
  return (
    dish.image?.trim() ||
    DISH_FALLBACK_IMAGE.replace("hungerdash-home-dish", "home-dish-" + dish.id)
  );
}

function buildRecentDishes(dishes: DishResponse[]): RecentDishCard[] {
  return dishes.slice(0, 8).map((dish, index) => ({
    id: dish.id,
    name: dish.name,
    restaurantId: dish.restaurantId,
    restaurant: dish.restaurant?.name ?? "Nhà hàng",
    category: dish.category?.name ?? (index === 0 ? "Mới lên sóng" : "Gần đây"),
    price: dish.price,
    time: 18 + (dish.id % 18) + " phút",
    image: buildDishImage(dish),
  }));
}

export function RecentDishes({
  dishes = [],
  isLoading = false,
}: RecentDishesProps) {
  const displayDishes =
    dishes.length > 0 ? buildRecentDishes(dishes) : fallbackDishes;

  return (
    <section className="bg-[#fffaf4] py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700">
              <Sparkle size={16} weight="fill" />
              Vừa cập nhật
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#23140c] sm:text-5xl">
              Gần đây bạn có món ngon gì?
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-[#704322]/70">
            Những món mới được thêm vào menu hôm nay, hợp cho lúc muốn đổi vị
            nhanh mà vẫn chắc bụng.
          </p>
        </div>

        {isLoading && dishes.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[23rem] animate-pulse rounded-4xl bg-white ring-1 ring-[#23140c]/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {displayDishes.map((dish, idx) => (
              <motion.article
                key={dish.id ? dish.id : dish.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="group overflow-hidden rounded-4xl bg-white shadow-[0_20px_50px_-24px_rgba(35,20,12,0.24)] ring-1 ring-[#23140c]/5 transition-all hover:-translate-y-1 hover:shadow-[0_28px_60px_-22px_rgba(255,107,0,0.28)]"
              >
                <Link
                  href={
                    dish.restaurantId
                      ? "/restaurants/" + dish.restaurantId
                      : "/menu"
                  }
                  className="block"
                >
                  <div className="relative h-52 overflow-hidden bg-orange-50">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#23140c] backdrop-blur-md">
                      {dish.category}
                    </div>
                    <button
                      type="button"
                      aria-label={"Lưu " + dish.name}
                      className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-[#ff6b00] shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
                    >
                      <Heart size={20} weight="bold" />
                    </button>
                  </div>
                </Link>

                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
                    {dish.restaurant}
                  </p>
                  <h3 className="mt-2 min-h-14 text-xl font-black leading-7 tracking-tight text-[#23140c]">
                    {dish.name}
                  </h3>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl font-black text-[#23140c]">
                        {formatPrice(dish.price)}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#704322]/60">
                        <Clock size={15} weight="bold" />
                        {dish.time}
                      </div>
                    </div>
                    <Link
                      href="/menu"
                      aria-label={"Thêm " + dish.name + " vào giỏ"}
                      className="flex size-12 items-center justify-center rounded-2xl bg-[#23140c] text-white transition-all hover:bg-[#ff6b00] active:scale-95"
                    >
                      <Plus size={22} weight="bold" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
