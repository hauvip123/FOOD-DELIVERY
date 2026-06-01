"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Storefront,
  MapPin,
  PencilSimple,
  Star,
  ArrowRight
} from "@phosphor-icons/react";
import { getMyRestaurants, RestaurantResponse } from "@/lib/restaurant";

const FALLBACK_RESTAURANT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop";

function getRestaurantImageSrc(src?: string) {
  const trimmedSrc = src?.trim();

  if (!trimmedSrc || trimmedSrc.includes("example.com")) {
    return FALLBACK_RESTAURANT_IMAGE;
  }

  return trimmedSrc;
}

export default function MyRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const data = await getMyRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#23140c]">Nhà hàng của tôi</h1>
          <p className="mt-2 text-lg font-medium text-[#23140c]/50">Quản lý và cập nhật thông tin nhà hàng của bạn.</p>
        </div>
        <Link
          href="/manage/restaurants/new"
          className="flex h-14 items-center gap-2 rounded-2xl bg-[#ff6b00] px-8 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#e45f00] active:scale-95"
        >
          <Plus size={20} weight="bold" />
          Thêm nhà hàng mới
        </Link>
      </header>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-[2.5rem] bg-white ring-1 ring-black/5"></div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] bg-white py-24 shadow-sm ring-1 ring-black/5">
          <div className="mb-6 rounded-full bg-orange-50 p-8 text-orange-200">
            <Storefront size={64} weight="bold" />
          </div>
          <h2 className="text-2xl font-black text-[#23140c]">Bạn chưa có nhà hàng nào</h2>
          <p className="mt-3 text-lg font-medium text-[#23140c]/40">Bắt đầu kinh doanh bằng cách tạo nhà hàng đầu tiên.</p>
          <Link
            href="/manage/restaurants/new"
            className="mt-8 rounded-2xl bg-[#23140c] px-10 py-4 font-black text-white hover:bg-orange-500 transition-colors"
          >
            Tạo nhà hàng ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {restaurants.map((res, idx) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="flex gap-6">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[2rem]">
                  <Image
                    src={getRestaurantImageSrc(res.imgage)}
                    alt={res.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-[#23140c]">{res.name}</h3>
                      <p className="text-sm font-bold text-orange-500">{res.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-500">
                      <Star size={16} weight="fill" />
                      {res.ratingAverage.toFixed(1)}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#23140c]/40">
                    <MapPin size={18} weight="bold" />
                    <span className="truncate">{res.address}, {res.city}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Link
                  href={`/manage/restaurants/${res.id}/edit`}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-50 text-sm font-black text-orange-500 transition-all hover:bg-orange-100"
                >
                  <PencilSimple size={18} weight="bold" />
                  Chỉnh sửa
                </Link>
                <Link
                  href={`/manage/restaurants/${res.id}`}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#23140c] text-sm font-black text-white transition-all hover:bg-orange-500"
                >
                  Xem chi tiết
                  <ArrowRight size={18} weight="bold" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
