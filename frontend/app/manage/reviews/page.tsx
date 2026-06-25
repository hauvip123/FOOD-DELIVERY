"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChatCenteredText,
  Funnel,
  Star,
  Storefront,
  WarningCircle,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { getMyRestaurants } from "@/lib/restaurant";
import { getManagedReviews } from "@/lib/review";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;
type RestaurantFilter = "all" | number;

const ratingOptions: Array<{ label: string; value: RatingFilter }> = [
  { label: "Tất cả", value: "all" },
  { label: "5 sao", value: 5 },
  { label: "4 sao", value: 4 },
  { label: "3 sao", value: 3 },
  { label: "2 sao", value: 2 },
  { label: "1 sao", value: 1 },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-orange-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={18}
          weight={index < rating ? "fill" : "bold"}
          className={index < rating ? "text-orange-500" : "text-[#704322]/20"}
        />
      ))}
    </div>
  );
}

export default function ManageReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [restaurantFilter, setRestaurantFilter] =
    useState<RestaurantFilter>("all");

  const restaurantsQuery = useQuery({
    queryKey: ["myRestaurants"],
    queryFn: getMyRestaurants,
    staleTime: 3 * 60 * 1000,
  });

  const reviewsQuery = useQuery({
    queryKey: [
      "manage",
      "reviews",
      { rating: ratingFilter, restaurantId: restaurantFilter },
    ],
    queryFn: () =>
      getManagedReviews({
        rating: ratingFilter,
        restaurantId: restaurantFilter,
      }),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const reviews = reviewsQuery.data ?? [];
  const restaurants = restaurantsQuery.data ?? [];

  const isLoading = reviewsQuery.isLoading || restaurantsQuery.isLoading;
  const errorMessage = reviewsQuery.error
    ? reviewsQuery.error instanceof ApiError
      ? reviewsQuery.error.message
      : "Không thể tải đánh giá."
    : restaurantsQuery.error
      ? restaurantsQuery.error instanceof ApiError
        ? restaurantsQuery.error.message
        : "Không thể tải danh sách nhà hàng."
      : "";

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    );
  }, [reviews]);

  const fiveStarCount = useMemo(
    () => reviews.filter((review) => review.rating === 5).length,
    [reviews],
  );
  const lowRatingCount = useMemo(
    () => reviews.filter((review) => review.rating <= 2).length,
    [reviews],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
            Phản hồi khách hàng
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#23140c]">
            Đánh giá nhà hàng
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
            Xem review từ các đơn đã hoàn thành, lọc theo nhà hàng và số sao để
            xử lý phản hồi nhanh hơn.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2.5rem] bg-white p-6 ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-[#23140c]">
                {reviews.length}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#704322]/45">
                Tổng review
              </p>
            </div>
            <ChatCenteredText
              size={32}
              weight="bold"
              className="text-orange-500"
            />
          </div>
        </div>
        <div className="rounded-[2.5rem] bg-white p-6 ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-[#23140c]">
                {averageRating.toFixed(1)}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-[#704322]/45">
                Điểm trung bình
              </p>
            </div>
            <Star size={32} weight="fill" className="text-orange-500" />
          </div>
        </div>
        <div className="rounded-[2.5rem] bg-[#23140c] p-6 text-white ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-orange-400">
                {fiveStarCount}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-white/35">
                5 sao • {lowRatingCount} cần xem
              </p>
            </div>
            <Funnel size={32} weight="bold" className="text-orange-400" />
          </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-white p-4 ring-1 ring-black/5">
        <div className="grid gap-4 xl:grid-cols-[260px_1fr] xl:items-center">
          <select
            value={restaurantFilter}
            onChange={(event) =>
              setRestaurantFilter(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value),
              )
            }
            className="h-12 rounded-2xl bg-[#fffcf8] px-4 text-sm font-black text-[#23140c] outline-none ring-1 ring-[#23140c]/10 focus:ring-2 focus:ring-[#ff6b00]"
          >
            <option value="all">Tất cả nhà hàng</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2 overflow-x-auto pb-1 xl:justify-end xl:pb-0">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRatingFilter(option.value)}
                className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-black transition-all active:scale-95 ${ratingFilter === option.value ? "bg-[#23140c] text-white" : "bg-[#fffcf8] text-[#704322]/65 ring-1 ring-[#23140c]/5 hover:text-[#ff6b00]"}`}
              >
                {option.value !== "all" && <Star size={15} weight="fill" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-3xl bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
          <WarningCircle size={20} weight="bold" />
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[2.5rem] bg-white ring-1 ring-black/5"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-[#23140c]/10 bg-white px-6 py-20 text-center">
          <Star size={48} weight="bold" className="mx-auto text-orange-200" />
          <h2 className="mt-5 text-2xl font-black text-[#23140c]">
            Chưa có đánh giá
          </h2>
          <p className="mt-3 text-sm font-bold text-[#704322]/55">
            Không có review nào khớp bộ lọc đang chọn.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[2.5rem] bg-white p-5 shadow-[0_18px_45px_-30px_rgba(35,20,12,0.35)] ring-1 ring-black/5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <RatingStars rating={review.rating} />
                  <Link
                    href={`/manage/restaurants/${review.restaurantId}`}
                    className="mt-3 inline-flex items-center gap-2 text-lg font-black text-[#23140c] hover:text-[#ff6b00]"
                  >
                    <Storefront size={19} weight="bold" />
                    <span className="truncate">{review.restaurantName}</span>
                  </Link>
                  <p className="mt-1 text-xs font-bold text-[#704322]/45">
                    Đơn #{review.orderId} • {formatDate(review.createdAt)}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600 ring-1 ring-orange-100">
                  {review.rating} sao
                </span>
              </div>
              <p className="mt-5 rounded-[1.25rem] bg-[#fffcf8] p-4 text-sm font-bold leading-relaxed text-[#704322]/70 ring-1 ring-[#23140c]/5">
                {review.comment || "Khách đã đánh giá đơn hàng này."}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
