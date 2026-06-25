"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, Truck, ArrowRight, MapPin } from "@phosphor-icons/react";
import type { RestaurantResponse } from "@/lib/restaurant";

const fallbackRestaurants = [
  {
    id: 1,
    name: "Bếp Nắng Sài Gòn",
    cuisine: "Cơm nhà, món kho, canh nóng",
    rating: "4.8",
    reviews: "1.2k",
    time: "25-35",
    delivery: "Miễn phí",
    distance: "1.8 km",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1000",
    tag: "Được yêu thích nhất",
    color: "bg-orange-500",
  },
  {
    id: 2,
    name: "Mì Lửa Chợ Lớn",
    cuisine: "Mì bò, hoành thánh, xá xíu",
    rating: "4.7",
    reviews: "850",
    time: "20-30",
    delivery: "12k",
    distance: "2.4 km",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=800",
    tag: "Đang giảm 20%",
    color: "bg-red-500",
  },
  {
    id: 3,
    name: "Green Bowl Lab",
    cuisine: "Salad, poke, nước ép",
    rating: "4.9",
    reviews: "420",
    time: "30-40",
    delivery: "18k",
    distance: "3.1 km",
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    tag: "Bữa trưa nhẹ",
    color: "bg-emerald-500",
  },
];

type RestaurantCard = (typeof fallbackRestaurants)[number];

type FeaturedRestaurantsProps = {
  restaurants?: RestaurantResponse[];
  isLoading?: boolean;
};

const FALLBACK_IMAGE =
  "https://picsum.photos/seed/hungerdash-restaurant/900/650";
const tagColors = [
  "bg-orange-500",
  "bg-red-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-amber-600",
  "bg-sky-600",
];

function formatRating(value: number) {
  return Number(value || 0).toFixed(1);
}

function formatDeliveryFee(value?: number) {
  const fee = Number(value || 0);
  if (fee <= 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(fee);
}

function buildRestaurantImage(restaurant: RestaurantResponse) {
  return (
    restaurant.imgage?.trim() ||
    FALLBACK_IMAGE.replace(
      "hungerdash-restaurant",
      "restaurant-" + restaurant.id,
    )
  );
}

function buildRestaurants(restaurants: RestaurantResponse[]): RestaurantCard[] {
  return restaurants.slice(0, 6).map((restaurant, index) => ({
    id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    rating: formatRating(restaurant.ratingAverage),
    reviews:
      320 + restaurant.id * 17 > 1000
        ? "1k+"
        : String(320 + restaurant.id * 17),
    time: 18 + (restaurant.id % 12) + "-" + (28 + (restaurant.id % 16)),
    delivery: formatDeliveryFee(restaurant.deliveryFee),
    distance: (0.8 + (restaurant.id % 7) * 0.4).toFixed(1) + " km",
    isOpen: restaurant.isOpen,
    image: buildRestaurantImage(restaurant),
    tag: index === 0 ? "Đánh giá cao" : restaurant.city,
    color: tagColors[index % tagColors.length],
  }));
}

export function FeaturedRestaurants({
  restaurants = [],
  isLoading = false,
}: FeaturedRestaurantsProps) {
  const displayRestaurants =
    restaurants.length > 0
      ? buildRestaurants(restaurants)
      : fallbackRestaurants;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#ff6b00]">
              Nhà hàng nổi bật
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#23140c] sm:text-5xl">
              Gần bạn có gì ngon?
            </h2>
          </div>
          <Link
            href="/restaurants"
            className="group inline-flex items-center gap-2 text-lg font-black text-[#ff6b00] hover:text-[#e45f00]"
          >
            Xem tất cả
            <ArrowRight
              size={24}
              weight="bold"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {isLoading && restaurants.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-[2.5rem] bg-orange-50"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayRestaurants.map((res, idx) => (
              <motion.article
                key={res.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className={
                  "group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-black/5 transition-all hover:shadow-[0_30px_60px_-15px_rgba(255,107,0,0.2)] " +
                  (idx === 0 ? "lg:col-span-2 lg:flex-row lg:gap-8 " : "") +
                  (!res.isOpen ? "grayscale-[0.4] opacity-80" : "")
                }
              >
                <div
                  className={
                    "relative overflow-hidden rounded-4xl " +
                    (idx === 0 ? "h-64 lg:h-auto lg:w-[45%]" : "h-64 w-full")
                  }
                >
                  <Image
                    src={res.image}
                    alt={res.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                    <span
                      className={
                        "rounded-full " +
                        res.color +
                        " px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                      }
                    >
                      {res.tag}
                    </span>
                  </div>
                  {!res.isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <span className="rounded-2xl bg-white px-6 py-2.5 text-sm font-black text-[#23140c]">
                        Đã đóng cửa
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={
                    "flex flex-1 flex-col justify-between py-4 " +
                    (idx === 0 ? "lg:py-6" : "")
                  }
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {res.isOpen && (
                            <span className="relative flex size-2 shrink-0">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                            </span>
                          )}
                          <h3
                            className={
                              "font-black tracking-tight text-[#23140c] " +
                              (idx === 0 ? "text-3xl" : "text-2xl")
                            }
                          >
                            {res.name}
                          </h3>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-[#704322]/70">
                          {res.cuisine}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-black text-[#ff6b00]">
                          <Star size={18} weight="fill" />
                          {res.rating}
                        </div>
                        <span className="text-[10px] font-bold text-[#704322]/50">
                          {res.reviews} đánh giá
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-2.5 text-xs font-bold text-[#704322]">
                        <Clock size={16} weight="bold" />
                        {res.time} phút
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-2.5 text-xs font-bold text-[#704322]">
                        <MapPin size={16} weight="bold" />
                        {res.distance}
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-2.5 text-xs font-bold text-[#704322]">
                        <Truck size={16} weight="bold" />
                        Phí giao {res.delivery}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={"/restaurants/" + res.id}
                    className={
                      "mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl text-sm font-black transition-all active:scale-98 lg:w-fit lg:px-10 " +
                      (res.isOpen
                        ? "bg-[#23140c] text-white hover:bg-[#ff6b00]"
                        : "pointer-events-none bg-[#704322]/10 text-[#704322]/40")
                    }
                  >
                    {res.isOpen ? "Ghé quán ngay" : "Tạm nghỉ"}
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
