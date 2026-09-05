"use client";

import Link from "next/link";
import type { CategoryResponse } from "@/lib/category";
import type { DishResponse } from "@/lib/dish";

type CategoriesSectionProps = {
  categories?: CategoryResponse[];
  dishes?: DishResponse[];
  isLoading?: boolean;
};

function uniqueCategoryNames(categories: CategoryResponse[]) {
  return Array.from(new Set(categories.map((category) => category.name)));
}

export function CategoriesSection({
  categories = [],
  dishes = [],
  isLoading = false,
}: CategoriesSectionProps) {
  const displayCategories = uniqueCategoryNames(categories);
  const dishCountByCategory = dishes.reduce<Record<string, number>>(
    (counts, dish) => {
      const name = dish.category?.name;
      if (!name) {
        return counts;
      }
      counts[name] = (counts[name] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-[#23140c]">
            Khám phá danh mục
          </h2>
          <Link
            href="/menu"
            className="text-sm font-bold text-[#ff6b00] hover:text-[#e45f00]"
          >
            Xem thực đơn
          </Link>
        </div>

        {isLoading && categories.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl bg-[#fff7ed]"
              />
            ))}
          </div>
        ) : displayCategories.length === 0 ? (
          <p className="rounded-2xl bg-[#fff7ed] px-5 py-4 text-sm font-semibold text-[#704322]">
            Chưa có danh mục nào.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {displayCategories.map((categoryName) => {
              const count = dishCountByCategory[categoryName];
              return (
                <Link
                  key={categoryName}
                  href={"/menu?category=" + encodeURIComponent(categoryName)}
                  className="rounded-2xl bg-[#fff7ed] px-4 py-4 ring-1 ring-[#23140c]/5 transition-colors hover:bg-[#ff6b00] hover:text-white hover:ring-[#ff6b00]"
                >
                  <p className="text-sm font-black tracking-tight">
                    {categoryName}
                  </p>
                  <p className="mt-1 text-xs font-semibold opacity-70">
                    {count ? count + " món" : "Xem món"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
