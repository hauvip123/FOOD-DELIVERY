"use client";

import { useEffect, useMemo, useState } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedRestaurants } from "@/components/home/FeaturedRestaurants";
import { RecentDishes } from "@/components/home/RecentDishes";
import { PopularDishes } from "@/components/home/PopularDishes";
import { ApiError } from "@/lib/api";
import { getAllCategories, type CategoryResponse } from "@/lib/category";
import { getAllDishes, type DishResponse } from "@/lib/dish";
import { getRestaurants, type RestaurantResponse } from "@/lib/restaurant";

type HomeData = {
  categories: CategoryResponse[];
  dishes: DishResponse[];
  restaurants: RestaurantResponse[];
};

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData>({
    categories: [],
    dishes: [],
    restaurants: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadHomeData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [restaurantResult, dishes, categories] = await Promise.all([
          getRestaurants({ sortBy: "ratingAverage", sortOrder: "DESC", page: 1, limit: 8 }),
          getAllDishes(),
          getAllCategories(),
        ]);

        if (!isCurrentRequest) {
          return;
        }

        setHomeData({
          categories,
          dishes: dishes.filter((dish) => dish.isAvailable),
          restaurants: restaurantResult.data,
        });
      } catch (error) {
        if (!isCurrentRequest) {
          return;
        }

        setHomeData({ categories: [], dishes: [], restaurants: [] });
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải dữ liệu trang chủ.");
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const recentDishes = useMemo(() => {
    return [...homeData.dishes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [homeData.dishes]);

  const popularDishes = useMemo(() => {
    return [...homeData.dishes]
      .sort((a, b) => b.price - a.price)
      .slice(0, 8);
  }, [homeData.dishes]);

  return (
    <main>
      <HeroSection />
      {errorMessage && (
        <div className="bg-[#23140c] px-4 py-3 text-center text-sm font-bold text-white sm:px-6 lg:px-10">
          {errorMessage} Đang hiển thị dữ liệu mẫu.
        </div>
      )}
      <CategoriesSection categories={homeData.categories} isLoading={isLoading} />
      <RecentDishes dishes={recentDishes} isLoading={isLoading} />
      <FeaturedRestaurants restaurants={homeData.restaurants} isLoading={isLoading} />
      <PopularDishes dishes={popularDishes} isLoading={isLoading} />
    </main>
  );
}
