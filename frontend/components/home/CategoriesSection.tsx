"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CategoryResponse } from "@/lib/category";

const categoryImages: Record<string, string> = {
  "Cơm nhà": "https://images.unsplash.com/photo-1512058560366-cd2427ff064f?auto=format&fit=crop&q=80&w=200",
  "Mì & Bún": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=200",
  "Gà rán": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=200",
  Healthy: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200",
  "Cà phê & Trà": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200",
  "Tráng miệng": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=200",
  "Ăn vặt Hàn": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=200",
  Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200",
  Sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=200",
  "Bánh mì": "https://images.unsplash.com/photo-1509722747041-619f383b8326?auto=format&fit=crop&q=80&w=200",
  Lẩu: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200",
  Phở: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=200",
};

function buildCategories(categories: CategoryResponse[]) {
  const uniqueNames = Array.from(new Set(categories.map((category) => category.name))).slice(0, 12);

  return uniqueNames.map((name, index) => ({
    name,
    image: categoryImages[name] ?? "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=200",

  }));
}

type CategoriesSectionProps = {
  categories?: CategoryResponse[];
  isLoading?: boolean;
};

export function CategoriesSection({ categories = [], isLoading = false }: CategoriesSectionProps) {
  const displayCategories = buildCategories(categories);

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-tight text-[#23140c]">Khám phá danh mục</h2>
          <div className="h-px flex-1 bg-orange-100 ml-8 hidden md:block" />
        </div>

        <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
          {isLoading && categories.length === 0 && Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex shrink-0 flex-col items-center gap-4">
              <div className="size-24 animate-pulse rounded-4xl bg-orange-50" />
              <div className="h-4 w-16 animate-pulse rounded-full bg-orange-50" />
            </div>
          ))}
          {!isLoading && displayCategories.length === 0 && (
            <div className="rounded-2xl bg-orange-50 px-5 py-4 text-sm font-bold text-[#704322]/70">
              Chưa có danh mục nào từ API.
            </div>
          )}
          {(!isLoading || categories.length > 0) && displayCategories.map((category, idx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 + 0.5 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="shrink-0"
            >
              <Link
                href={"/menu?category=" + encodeURIComponent(category.name)}
                className="group flex flex-col items-center gap-4"
              >
              <div
                className={`relative size-24 overflow-hidden rounded-4xl p-1.5 transition-all duration-300 group-hover:shadow-[0_20px_40px_-10px_rgba(255,107,0,0.3)] bg-orange-50 group-hover:bg-orange-100`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-white">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </div>
              </div>
              <span className="text-sm font-black tracking-tight text-[#704322] transition-colors group-hover:text-[#ff6b00]">
                {category.name}
              </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
