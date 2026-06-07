"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CategoryResponse } from "@/lib/category";

function buildCategories(categories: CategoryResponse[]) {
  return Array.from(new Set(categories.map((category) => category.name))).slice(0, 12);
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

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4">
          {isLoading && categories.length === 0 && Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 w-28 shrink-0 animate-pulse rounded-2xl bg-orange-50" />
          ))}
          {!isLoading && displayCategories.length === 0 && (
            <div className="rounded-2xl bg-orange-50 px-5 py-4 text-sm font-bold text-[#704322]/70">
              Chưa có danh mục nào từ API.
            </div>
          )}
          {(!isLoading || categories.length > 0) && displayCategories.map((categoryName, idx) => (
            <motion.div
              key={categoryName}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 + 0.2 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="shrink-0"
            >
              <Link
                href={"/menu?category=" + encodeURIComponent(categoryName)}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#fff7ed] px-5 text-sm font-black text-[#704322] ring-1 ring-orange-100 transition-all hover:bg-[#23140c] hover:text-white hover:ring-[#23140c]"
              >
                {categoryName}
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
