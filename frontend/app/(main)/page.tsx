"use client";

import { useMemo } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedRestaurants } from "@/components/home/FeaturedRestaurants";
import { RecentDishes } from "@/components/home/RecentDishes";
import { PopularDishes } from "@/components/home/PopularDishes";
import { getAllCategories } from "@/lib/category";
import { getAllDishes } from "@/lib/dish";
import { getRestaurants } from "@/lib/restaurant";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories(),
    staleTime: 5 * 60 * 1000,
  })
  const dishesQuery = useQuery({
    queryKey: ["dishes", "all"],
    queryFn: getAllDishes,
    staleTime: 5 * 60 * 1000,
  });

  const restaurantsQuery = useQuery({
    queryKey: ["restaurants", "featured"],
    queryFn: () => getRestaurants({ sortBy: "ratingAverage", sortOrder: "DESC", page: 1, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = categoriesQuery.isLoading || dishesQuery.isLoading || restaurantsQuery.isLoading;
  const errorMessage = categoriesQuery.error?.message
    || dishesQuery.error?.message
    || restaurantsQuery.error?.message
    || "";

  const categories = categoriesQuery.data ?? [];
  const restaurants = restaurantsQuery.data?.data ?? [];
  const dishes = dishesQuery.data?.filter((d) => d.isAvailable) ?? [];
  const recentDishes = useMemo(() => {
    return [...dishes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [dishes]);

  const popularDishes = useMemo(() => {
    return [...dishes]
      .sort((a, b) => b.price - a.price)
      .slice(0, 8);
  }, [dishes]);

  return (
    <main>
      <HeroSection />
      {errorMessage && (
        <div className="bg-[#23140c] px-4 py-3 text-center text-sm font-bold text-white sm:px-6 lg:px-10">
          {errorMessage} Đang hiển thị dữ liệu mẫu.
        </div>
      )}
      <CategoriesSection categories={categories} isLoading={isLoading} />
      <RecentDishes dishes={recentDishes} isLoading={isLoading} />
      <FeaturedRestaurants restaurants={restaurants} isLoading={isLoading} />
      <PopularDishes dishes={popularDishes} isLoading={isLoading} />
    </main>
  );
}
