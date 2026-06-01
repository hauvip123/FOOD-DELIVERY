"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  Clock,
  Truck,
  MapPin,
  MagnifyingGlass,
  FadersHorizontal,
  ArrowRight,
  CaretDown,
  Plus
} from "@phosphor-icons/react";

const ALL_RESTAURANTS = [
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
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1000",
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
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=800",
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
    isOpen: false,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    tag: "Bữa trưa nhẹ",
    color: "bg-emerald-500",
  },
  {
    id: 4,
    name: "Tiệm Nước Mơ",
    cuisine: "Trà sữa, nước ép, sinh tố",
    rating: "4.6",
    reviews: "1.5k",
    time: "15-25",
    delivery: "10k",
    distance: "0.8 km",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=800",
    tag: "Quán mới",
    color: "bg-pink-500",
  },
  {
    id: 5,
    name: "Hủ Tiếu Nam Vang 1990",
    cuisine: "Hủ tiếu, bánh bao, điểm tâm",
    rating: "4.5",
    reviews: "2.1k",
    time: "25-35",
    delivery: "Miễn phí",
    distance: "4.2 km",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800",
    tag: "Giao nhanh",
    color: "bg-amber-600",
  },
  {
    id: 6,
    name: "Phở Ông Hùng",
    cuisine: "Phở bò, phở gà, quẩy giòn",
    rating: "4.4",
    reviews: "3.2k",
    time: "20-30",
    delivery: "15k",
    distance: "2.1 km",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=800",
    tag: "Truyền thống",
    color: "bg-blue-600",
  }
];

const CUISINES = ["Tất cả", "Cơm nhà", "Mì & Phở", "Salad", "Trà sữa", "Bún & Hủ tiếu"];

export default function RestaurantsPage() {
  const { user } = useAuth();
  const [activeCuisine, setActiveCuisine] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = ALL_RESTAURANTS.filter(res => {
    const matchesCuisine = activeCuisine === "Tất cả" || res.cuisine.toLowerCase().includes(activeCuisine.toLowerCase()) || (activeCuisine === "Cơm nhà" && res.cuisine.includes("Cơm"));
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || res.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCuisine && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fffcf8]">
      {/* Header Section */}
      <section className="bg-white pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mb-12 max-w-3xl">
            <h1 className="text-5xl font-black tracking-tighter text-[#23140c] sm:text-7xl">
              Khám phá tinh hoa ẩm thực quanh bạn
            </h1>
            <p className="mt-6 text-xl font-medium leading-relaxed text-[#23140c]/50">
              Hơn 1,000 quán ăn đã sẵn sàng phục vụ. Từ món cơm nhà ấm bụng đến những bát mì nóng hổi, tất cả chỉ cách bạn một chạm.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center text-[#23140c]/30">
                <MagnifyingGlass size={24} weight="bold" />
              </div>
              <input
                type="text"
                placeholder="Tìm tên quán hoặc món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-16 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
              />
            </div>

            <div className="flex gap-4">
              <button className="flex h-16 items-center gap-3 rounded-2xl bg-white px-8 text-lg font-black text-[#23140c] shadow-sm ring-1 ring-black/5 hover:bg-[#fff7ed]">
                <FadersHorizontal size={24} weight="bold" />
                Sắp xếp
                <CaretDown size={18} weight="bold" className="text-[#23140c]/30" />
              </button>
            </div>
          </div>

          {/* Cuisine Filters */}
          <div className="mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setActiveCuisine(cuisine)}
                className={`whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm font-black transition-all ${activeCuisine === cuisine
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white text-[#23140c]/60 shadow-sm ring-1 ring-black/5 hover:ring-orange-500/20"
                  }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="mx-auto max-w-[1400px] px-4 pb-32 sm:px-6 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-black tracking-tight text-[#23140c]">
            {filteredRestaurants.length} kết quả phù hợp
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((res, idx) => (
            <motion.article
              key={res.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`group flex flex-col overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-all hover:shadow-[0_30px_60px_-15px_rgba(255,107,0,0.15)] ${!res.isOpen ? "grayscale-[0.4] opacity-80" : ""
                }`}
            >
              <div className="relative h-64 w-full overflow-hidden rounded-[2rem]">
                <Image
                  src={res.image}
                  alt={res.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <span className={`rounded-full ${res.color} px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}>
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

              <div className="flex flex-1 flex-col justify-between py-6 px-2">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {res.isOpen && (
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                          </span>
                        )}
                        <h3 className="text-2xl font-black tracking-tight text-[#23140c]">
                          {res.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-[#704322]/70">
                        {res.cuisine}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-black text-[#ff6b00]">
                      <Star size={18} weight="fill" />
                      {res.rating}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-2.5 text-xs font-bold text-[#704322]">
                      <Clock size={16} weight="bold" />
                      {res.time} phút
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-2.5 text-xs font-bold text-[#704322]">
                      <Truck size={16} weight="bold" />
                      {res.delivery}
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-2.5 text-xs font-bold text-[#704322]">
                      <MapPin size={16} weight="bold" />
                      {res.distance}
                    </div>
                  </div>
                </div>

                <Link
                  href={"/restaurants/" + res.id}
                  className={`mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl text-sm font-black transition-all active:scale-95 ${res.isOpen
                      ? "bg-[#23140c] text-white hover:bg-orange-500"
                      : "bg-[#704322]/10 text-[#704322]/40 pointer-events-none"
                    }`}
                >
                  {res.isOpen ? (
                    <div className="flex items-center gap-2">
                      Xem thực đơn
                      <ArrowRight size={20} weight="bold" />
                    </div>
                  ) : "Tạm nghỉ"}
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="mb-8 rounded-full bg-orange-50 p-12 text-orange-200">
              <MagnifyingGlass size={80} weight="bold" />
            </div>
            <h3 className="text-3xl font-black text-[#23140c]">Không tìm thấy quán nào</h3>
            <p className="mt-4 max-w-md text-lg font-medium text-[#23140c]/40">
              Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem thêm nhiều lựa chọn nhé.
            </p>
            <button
              onClick={() => { setActiveCuisine("Tất cả"); setSearchQuery(""); }}
              className="mt-10 rounded-2xl bg-[#23140c] px-10 py-4 font-black text-white hover:bg-orange-500 active:scale-95"
            >
              Xem tất cả quán
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
