"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Buildings, Clock, Heart, MapPin, Star, Truck } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { FavoriteRestaurantButton } from "@/components/restaurants/FavoriteRestaurantButton";
import { getFavoriteRestaurants, RestaurantResponse } from "@/lib/restaurant";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const FALLBACK_IMAGE = "https://picsum.photos/seed/hungerdash-favorite/900/650";

function buildImageUrl(restaurant: RestaurantResponse) {
  if (restaurant.imgage?.trim()) {
    return restaurant.imgage;
  }
  return FALLBACK_IMAGE.replace("hungerdash-favorite", `favorite-restaurant-${restaurant.id}`);
}

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

export default function FavoriteRestaurantsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ["favoriteRestaurants"],
    queryFn: getFavoriteRestaurants,
    enabled: isAuthenticated && !isAuthLoading,
  });

  const errorMessage = error instanceof Error ? error.message : "";

  const handleFavoriteChange = (restaurantId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      queryClient.setQueryData<RestaurantResponse[]>(["favoriteRestaurants"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((restaurant) => restaurant.id !== restaurantId);
      });

      queryClient.setQueryData<number[]>(["favoriteRestaurantIds"], (oldIds) => {
        if (!oldIds) return [];
        return oldIds.filter((id) => id !== restaurantId);
      });
    }
  };

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center bg-[#fffcf8] px-4 text-center">
        <div className="max-w-md rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[1.5rem] bg-orange-50 text-[#ff6b00]">
            <Heart size={42} weight="bold" />
          </div>
          <h1 className="text-2xl font-black text-[#23140c]">Bạn cần đăng nhập</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">Đăng nhập để xem các nhà hàng đã yêu thích.</p>
          <Link href="/login" className="mt-7 inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95">
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
            <Link href="/account" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff6b00] hover:text-[#e45f00]">
              <ArrowLeft size={18} weight="bold" />
              Tài khoản
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-[#23140c] sm:text-6xl">Nhà hàng yêu thích</h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
              Những quán bạn đã lưu để quay lại nhanh hơn trong lần đặt món tiếp theo.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-black/5">
            <p className="text-3xl font-black text-[#23140c]">{restaurants.length}</p>
            <p className="text-xs font-black uppercase tracking-widest text-[#704322]/50">Đã lưu</p>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-8 rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-[2rem] bg-white ring-1 ring-black/5" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#23140c]/10 bg-white px-6 py-24 text-center">
            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[1.5rem] bg-orange-50 text-[#ff6b00]">
              <Buildings size={42} weight="bold" />
            </div>
            <h2 className="text-2xl font-black text-[#23140c]">Chưa có nhà hàng yêu thích</h2>
            <p className="mt-3 text-sm font-bold text-[#704322]/55">Bấm trái tim trên nhà hàng để lưu vào danh sách này.</p>
            <Link href="/restaurants" className="mt-7 inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95">
              Khám phá nhà hàng
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {restaurants.map((restaurant) => (
              <article key={restaurant.id} className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_18px_45px_-28px_rgba(35,20,12,0.45)] ring-1 ring-[#23140c]/5">
                <div className="relative h-56 overflow-hidden rounded-[1.5rem] bg-[#f1e7dc]">
                  <img src={buildImageUrl(restaurant)} alt={restaurant.name} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ${restaurant.isOpen ? "bg-emerald-600" : "bg-[#704322]"}`}>
                      {restaurant.isOpen ? "Đang mở" : "Tạm nghỉ"}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#23140c] backdrop-blur">
                      {restaurant.city}
                    </span>
                  </div>
                  <div className="absolute right-4 top-4">
                    <FavoriteRestaurantButton restaurantId={restaurant.id} initialIsFavorite variant="light" onChange={handleFavoriteChange} />
                  </div>
                </div>
                <div className="p-3 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-2xl font-black tracking-tight text-[#23140c]">{restaurant.name}</h2>
                      <p className="mt-2 line-clamp-2 text-sm font-bold leading-relaxed text-[#704322]/65">{restaurant.cuisine}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-black text-[#ff6b00]">
                      <Star size={17} weight="fill" />
                      {formatRating(restaurant.ratingAverage)}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 text-xs font-black text-[#704322] sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-[1rem] bg-[#fff7ed] px-3 py-2.5">
                      <MapPin size={16} weight="bold" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[1rem] bg-[#fff7ed] px-3 py-2.5">
                      <Clock size={16} weight="bold" />
                      <span>{restaurant.openTime} - {restaurant.closeTime}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[1rem] bg-orange-50 px-3 py-2.5 text-[#ff6b00] sm:col-span-2">
                      <Truck size={16} weight="bold" />
                      <span>Phí giao {formatDeliveryFee(restaurant.deliveryFee)}</span>
                    </div>
                  </div>
                  <Link href={`/restaurants/${restaurant.id}`} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[#23140c] text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95">
                    Xem thực đơn
                    <ArrowRight size={18} weight="bold" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
