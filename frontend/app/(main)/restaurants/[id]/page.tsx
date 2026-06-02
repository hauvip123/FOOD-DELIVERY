"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Heart,
  Info,
  MagnifyingGlass,
  MapPin,
  Minus,
  Plus,
  ShareNetwork,
  Star,
  Storefront,
  Truck,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { getAllCategories, CategoryResponse } from "@/lib/category";
import { getDishesByRestaurantId, DishResponse } from "@/lib/dish";
import { getRestaurantById, RestaurantResponse } from "@/lib/restaurant";
import { getRestaurantReviews, ReviewResponse } from "@/lib/review";
import { useCart } from "@/contexts/CartContext";

const RESTAURANT_FALLBACK_IMAGE = "https://picsum.photos/seed/hungerdash-detail/1400/700";
const DISH_FALLBACK_IMAGE = "https://picsum.photos/seed/hungerdash-dish/500/500";

function buildRestaurantImage(restaurant: RestaurantResponse) {
  if (restaurant.imgage?.trim()) {
    return restaurant.imgage;
  }
  return RESTAURANT_FALLBACK_IMAGE.replace("hungerdash-detail", `restaurant-detail-${restaurant.id}`);
}

function buildDishImage(dish: DishResponse) {
  if (dish.image?.trim()) {
    return dish.image;
  }
  return DISH_FALLBACK_IMAGE.replace("hungerdash-dish", `dish-${dish.id}`);
}

function formatRating(value: number) {
  return Number(value || 0).toFixed(1);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const restaurantId = Number(id);
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | "all">("all");
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { items, addToCart, removeFromCart, errorMessage: cartErrorMessage } = useCart();

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadRestaurantDetail() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [restaurantData, dishData, categoryData, reviewData] = await Promise.all([
          getRestaurantById(restaurantId),
          getDishesByRestaurantId(restaurantId),
          getAllCategories(),
          getRestaurantReviews(restaurantId),
        ]);

        if (!isCurrentRequest) {
          return;
        }

        const restaurantCategories = categoryData.filter((category) => category.restaurantId === restaurantId);
        setRestaurant(restaurantData);
        setDishes(dishData);
        setCategories(restaurantCategories);
        setReviews(reviewData);
        setActiveCategoryId("all");
      } catch (error) {
        if (!isCurrentRequest) {
          return;
        }
        setRestaurant(null);
        setDishes([]);
        setCategories([]);
        setReviews([]);
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải chi tiết nhà hàng.");
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    if (Number.isNaN(restaurantId)) {
      setErrorMessage("Mã nhà hàng không hợp lệ.");
      setIsLoading(false);
      return;
    }

    loadRestaurantDetail();

    return () => {
      isCurrentRequest = false;
    };
  }, [restaurantId]);

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const categoryTabs = useMemo(() => {
    const categoryIdsFromDishes = Array.from(new Set(dishes.map((dish) => dish.categoryId)));
    return categoryIdsFromDishes.map((categoryId) => ({
      id: categoryId,
      name: categoryNameById.get(categoryId) ?? `Danh mục ${categoryId}`,
      count: dishes.filter((dish) => dish.categoryId === categoryId).length,
    }));
  }, [categoryNameById, dishes]);

  const filteredDishes = useMemo(() => {
    if (activeCategoryId === "all") {
      return dishes;
    }
    return dishes.filter((dish) => dish.categoryId === activeCategoryId);
  }, [activeCategoryId, dishes]);

  const filteredReviews = useMemo(() => {
    if (reviewRatingFilter === "all") {
      return reviews;
    }
    return reviews.filter((review) => review.rating === reviewRatingFilter);
  }, [reviewRatingFilter, reviews]);

  const reviewRatingOptions = useMemo(() => {
    return ["all", 5, 4, 3, 2, 1] as Array<"all" | number>;
  }, []);

  const getDishQuantity = (dishId: number) => {
    return items.find((item) => item.id === dishId)?.quantity || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffcf8]">
        <div className="h-[450px] animate-pulse bg-[#e8ded3]" />
        <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[2rem] bg-white p-4 ring-1 ring-black/5">
                <div className="h-28 animate-pulse rounded-2xl bg-[#f1e7dc]" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffcf8] px-4">
        <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-red-50 text-red-500">
            <Info size={32} weight="bold" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#23140c]">Không tải được nhà hàng</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">{errorMessage || "Nhà hàng không tồn tại."}</p>
          <Link href="/restaurants" className="mt-7 inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fffcf8]">
      <section className="relative min-h-[460px] w-full overflow-hidden">
        <img
          src={buildRestaurantImage(restaurant)}
          alt={restaurant.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#23140c] via-[#23140c]/55 to-[#23140c]/10" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-4 pb-12 pt-28 sm:px-6 lg:px-10">
          <Link href="/restaurants" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/80 transition-colors hover:text-white">
            <ArrowLeft size={18} weight="bold" />
            Trở về nhà hàng
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ${restaurant.isOpen ? "bg-emerald-600" : "bg-[#704322]"}`}>
                  {restaurant.isOpen ? "Đang hoạt động" : "Tạm nghỉ"}
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-orange-400">
                  <Star size={18} weight="fill" />
                  <span className="text-white">{formatRating(restaurant.ratingAverage)}</span>
                  <span className="text-white/60">đánh giá</span>
                </div>
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl">
                {restaurant.name}
              </h1>

              <p className="max-w-3xl text-lg font-medium leading-relaxed text-white/75">
                {restaurant.cuisine} • {restaurant.description || restaurant.address}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex size-14 items-center justify-center rounded-2xl transition-all active:scale-90 ${isFavorite ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                <Heart size={28} weight={isFavorite ? "fill" : "bold"} />
              </button>
              <button className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90">
                <ShareNetwork size={28} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] -translate-y-1/2 px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-black/5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 px-2 lg:px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Clock size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Giờ mở cửa</p>
              <p className="text-sm font-black text-[#23140c]">{restaurant.openTime} - {restaurant.closeTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-2 lg:border-l lg:border-[#23140c]/5 lg:px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <Truck size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Trạng thái</p>
              <p className="text-sm font-black text-[#23140c]">{restaurant.isOpen ? "Nhận đơn" : "Tạm ngưng"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-2 lg:border-l lg:border-[#23140c]/5 lg:px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <MapPin size={24} weight="bold" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Địa chỉ</p>
              <p className="truncate text-sm font-black text-[#23140c]">{restaurant.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-2 lg:border-l lg:border-[#23140c]/5 lg:px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Storefront size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Thành phố</p>
              <p className="text-sm font-black text-[#23140c]">{restaurant.city}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full lg:sticky lg:top-28 lg:h-fit lg:w-72">
            <div className="flex flex-col gap-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#23140c]">Thực đơn</h3>
                <MagnifyingGlass size={20} className="text-[#23140c]/40" />
              </div>
              <div className="flex flex-row gap-2 overflow-x-auto pb-4 lg:flex-col lg:overflow-visible">
                <button
                  onClick={() => setActiveCategoryId("all")}
                  className={`whitespace-nowrap rounded-2xl px-5 py-3.5 text-left text-sm font-black transition-all ${activeCategoryId === "all" ? "bg-[#23140c] text-white shadow-lg shadow-[#23140c]/10" : "bg-white text-[#23140c]/60 hover:bg-[#23140c]/5"}`}
                >
                  Tất cả món ({dishes.length})
                </button>
                {categoryTabs.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`whitespace-nowrap rounded-2xl px-5 py-3.5 text-left text-sm font-black transition-all ${activeCategoryId === category.id ? "bg-[#23140c] text-white shadow-lg shadow-[#23140c]/10" : "bg-white text-[#23140c]/60 hover:bg-[#23140c]/5"}`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-12">
            <div>
              <div className="mb-8 flex items-end justify-between gap-4">
                <h2 className="text-3xl font-black tracking-tight text-[#23140c]">
                  {activeCategoryId === "all" ? "Tất cả món" : categoryNameById.get(activeCategoryId) ?? `Danh mục ${activeCategoryId}`}
                </h2>
                <span className="text-sm font-bold text-[#23140c]/40">{filteredDishes.length} món</span>
              </div>



              {cartErrorMessage && (
                <div className="mb-6 rounded-[1.25rem] bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
                  {cartErrorMessage}
                </div>
              )}

              {filteredDishes.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-[#23140c]/10 bg-white px-6 py-20 text-center">
                  <h3 className="text-2xl font-black text-[#23140c]">Chưa có món ăn</h3>
                  <p className="mt-3 text-sm font-bold text-[#704322]/55">Nhà hàng này chưa cập nhật món trong danh mục đang chọn.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredDishes.map((dish, idx) => {
                    const quantity = getDishQuantity(dish.id);
                    const dishImage = buildDishImage(dish);
                    return (
                      <motion.div
                        key={dish.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`group flex gap-4 rounded-[2rem] bg-white p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] ring-1 ring-black/5 transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] ${dish.isAvailable ? "" : "opacity-60 grayscale-[0.25]"}`}
                      >
                        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f1e7dc]">
                          <img
                            src={dishImage}
                            alt={dish.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          {!dish.isAvailable && (
                            <div className="absolute inset-0 grid place-items-center bg-[#23140c]/55 text-[10px] font-black uppercase tracking-widest text-white">
                              Hết món
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="line-clamp-2 font-black leading-tight text-[#23140c]">{dish.name}</h4>
                              <p className="shrink-0 text-sm font-black text-orange-500">{formatPrice(dish.price)}</p>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-[#23140c]/50">
                              {dish.description || categoryNameById.get(dish.categoryId) || "Món ăn của nhà hàng"}
                            </p>
                          </div>

                          <div className="flex items-center justify-end">
                            {quantity > 0 ? (
                              <div className="flex items-center gap-3 rounded-xl bg-[#23140c] p-1 shadow-lg">
                                <button
                                  onClick={() => removeFromCart(dish.id)}
                                  className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                                >
                                  <Minus size={14} weight="bold" />
                                </button>
                                <span className="min-w-[1ch] text-center text-sm font-black text-white">{quantity}</span>
                                <button
                                  disabled={!dish.isAvailable || !restaurant.isOpen}
                                  onClick={() => addToCart({
                                    id: dish.id,
                                    name: dish.name,
                                    price: dish.price,
                                    restaurantId: restaurant.id,
                                    restaurantName: restaurant.name,
                                    image: dishImage,
                                  })}
                                  className="flex size-7 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:pointer-events-none disabled:opacity-40"
                                >
                                  <Plus size={14} weight="bold" />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={!dish.isAvailable || !restaurant.isOpen}
                                onClick={() => addToCart({
                                  id: dish.id,
                                  name: dish.name,
                                  price: dish.price,
                                  restaurantId: restaurant.id,
                                  restaurantName: restaurant.name,
                                  image: dishImage,
                                })}
                                className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white disabled:pointer-events-none disabled:opacity-40 active:scale-90"
                              >
                                <Plus size={20} weight="bold" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-14 rounded-[2rem] bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Đánh giá khách hàng</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#23140c]">Khách nói gì về {restaurant.name}</h2>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-[1rem] bg-orange-50 px-4 py-3 text-orange-500 ring-1 ring-orange-100">
              <Star size={22} weight="fill" />
              <span className="text-lg font-black text-[#23140c]">{formatRating(restaurant.ratingAverage)}</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#704322]/40">{reviews.length} lượt</span>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
              {reviewRatingOptions.map((option) => {
                const count = option === "all" ? reviews.length : reviews.filter((review) => review.rating === option).length;
                return (
                  <button
                    key={option}
                    onClick={() => setReviewRatingFilter(option)}
                    className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[1rem] px-4 text-xs font-black transition-all active:scale-95 ${reviewRatingFilter === option ? "bg-[#23140c] text-white" : "bg-[#fffcf8] text-[#704322]/65 ring-1 ring-[#23140c]/5 hover:text-[#ff6b00]"}`}
                  >
                    {option !== "all" && <Star size={15} weight="fill" />}
                    {option === "all" ? "Tất cả" : `${option} sao`}
                    <span className={reviewRatingFilter === option ? "text-white/55" : "text-[#704322]/35"}>({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#23140c]/10 px-6 py-16 text-center">
              <Star size={42} weight="bold" className="mx-auto text-orange-200" />
              <h3 className="mt-4 text-xl font-black text-[#23140c]">Chưa có đánh giá</h3>
              <p className="mt-2 text-sm font-bold text-[#704322]/55">Các đánh giá sau khi khách nhận hàng sẽ xuất hiện tại đây.</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#23140c]/10 px-6 py-16 text-center">
              <Star size={42} weight="bold" className="mx-auto text-orange-200" />
              <h3 className="mt-4 text-xl font-black text-[#23140c]">Không có review khớp bộ lọc</h3>
              <p className="mt-2 text-sm font-bold text-[#704322]/55">Thử chọn mức sao khác để xem thêm đánh giá.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredReviews.slice(0, 6).map((review) => (
                <article key={review.id} className="rounded-[1.5rem] bg-[#fffcf8] p-5 ring-1 ring-[#23140c]/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={18} weight={index < review.rating ? "fill" : "bold"} className={index < review.rating ? "text-orange-500" : "text-[#704322]/20"} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#704322]/35">Đơn #{review.orderId}</span>
                  </div>
                  <p className="mt-4 line-clamp-4 text-sm font-bold leading-relaxed text-[#704322]/70">
                    {review.comment || "Khách đã đánh giá đơn hàng này."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
