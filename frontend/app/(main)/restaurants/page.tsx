"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Buildings,
  CaretLeft,
  CaretRight,
  Clock,
  FadersHorizontal,
  FunnelSimple,
  MagnifyingGlass,
  MapPin,
  Star,
  Storefront,
  Truck,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { FavoriteRestaurantButton } from "@/components/restaurants/FavoriteRestaurantButton";
import {
  getFavoriteRestaurantIds,
  getRestaurants,
  RestaurantResponse,
} from "@/lib/restaurant";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

type SortValue = "createdAt-DESC" | "ratingAverage-DESC" | "name-ASC";
type OpenFilter = "all" | "open" | "closed";

const FALLBACK_IMAGE =
  "https://picsum.photos/seed/hungerdash-restaurant/900/650";

const CUISINE_PRESETS = ["Cơm", "Phở", "Bún", "Mì", "Pizza", "Trà sữa"];
const CITY_PRESETS = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];

const sortOptions: { label: string; value: SortValue }[] = [
  { label: "Mới nhất", value: "createdAt-DESC" },
  { label: "Đánh giá cao", value: "ratingAverage-DESC" },
  { label: "Tên A-Z", value: "name-ASC" },
];

function useDebouncedValue(value: string, delay = 450) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

function buildImageUrl(restaurant: RestaurantResponse) {
  if (restaurant.imgage?.trim()) {
    return restaurant.imgage;
  }
  return FALLBACK_IMAGE.replace(
    "hungerdash-restaurant",
    `restaurant-${restaurant.id}`,
  );
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

function getSortParts(sort: SortValue) {
  const [sortBy, sortOrder] = sort.split("-") as [
    "createdAt" | "ratingAverage" | "name",
    "ASC" | "DESC",
  ];
  return { sortBy, sortOrder };
}

export default function RestaurantsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [openFilter, setOpenFilter] = useState<OpenFilter>("all");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState<SortValue>("createdAt-DESC");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchQuery);

  const activeFilterCount = useMemo(() => {
    return [
      debouncedSearch,
      city,
      address,
      cuisine,
      openFilter !== "all",
      minRating,
    ].filter(Boolean).length;
  }, [debouncedSearch, city, address, cuisine, openFilter, minRating]);
  const { sortBy, sortOrder } = getSortParts(sort);
  const {
    data: result,
    isLoading,
    isPlaceholderData,
    error,
  } = useQuery({
    queryKey: [
      "restaurants",
      {
        search: debouncedSearch,
        city,
        address,
        cuisine,
        openFilter,
        minRating,
        sort,
        page,
      },
    ],
    queryFn: () =>
      getRestaurants({
        search: debouncedSearch.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        cuisine: cuisine.trim() || undefined,
        isOpen: openFilter === "all" ? undefined : openFilter === "open",
        minRating: minRating ? Number(minRating) : undefined,
        sortBy,
        sortOrder,
        page,
        limit: 9,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: favoriteRestaurantIds = [] } = useQuery({
    queryKey: ["favoriteRestaurantIds"],
    queryFn: getFavoriteRestaurantIds,
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 2 * 60 * 1000,
  });
  const restaurants = result?.data ?? [];
  const total = result?.meta.total ?? 0;
  const totalPages = Math.max(result?.meta.totalPages ?? 1, 1);

  function resetToFirstPage(action: () => void) {
    setPage(1);
    action();
  }

  function clearFilters() {
    setSearchQuery("");
    setCity("");
    setAddress("");
    setCuisine("");
    setOpenFilter("all");
    setMinRating("");
    setSort("createdAt-DESC");
    setPage(1);
  }

  const queryClient = useQueryClient();

  const handleFavoriteChange = (restaurantId: number, isFavorite: boolean) => {
    queryClient.setQueryData<number[]>(["favoriteRestaurantIds"], (oldIds) => {
      if (!oldIds) return isFavorite ? [restaurantId] : [];
      if (isFavorite) {
        return oldIds.includes(restaurantId)
          ? oldIds
          : [...oldIds, restaurantId];
      } else {
        return oldIds.filter((id) => id !== restaurantId);
      }
    });

    queryClient.invalidateQueries({ queryKey: ["favoriteRestaurants"] });
  };

  const filterSidebar = (
    <div className="rounded-4xl border border-[#23140c]/5 bg-white p-4 shadow-[0_20px_45px_-32px_rgba(35,20,12,0.45)] lg:sticky lg:top-28">
      <div className="flex items-start justify-between gap-4 border-b border-[#23140c]/5 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#ff6b00]">
            <FunnelSimple size={14} weight="bold" />
            Bộ lọc
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#23140c]">
            Tìm quán phù hợp
          </h2>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#23140c] text-lg font-black text-white">
          {activeFilterCount}
        </div>
      </div>

      <div className="divide-y divide-[#23140c]/5">
        <div className="py-5">
          <label
            className="block text-sm font-black text-[#23140c]"
            htmlFor="restaurant-search"
          >
            Tìm kiếm
          </label>
          <div className="relative mt-3">
            <MagnifyingGlass
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35"
              size={20}
              weight="bold"
            />
            <input
              id="restaurant-search"
              value={searchQuery}
              onChange={(event) =>
                resetToFirstPage(() => setSearchQuery(event.target.value))
              }
              placeholder="Tên nhà hàng..."
              className="h-13 w-full rounded-[1.1rem] border border-[#23140c]/5 bg-[#fffcf8] pl-12 pr-4 text-sm font-bold text-[#23140c] transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="py-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#23140c]">
            <MapPin size={18} weight="bold" className="text-[#ff6b00]" />
            Vị trí
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#704322]/50">
                Địa chỉ
              </span>
              <input
                value={address}
                onChange={(event) =>
                  resetToFirstPage(() => setAddress(event.target.value))
                }
                placeholder="Đường, phường..."
                className="h-12 w-full rounded-2xl border border-[#23140c]/5 bg-[#fffcf8] px-4 text-sm font-bold text-[#23140c] transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#704322]/50">
                Thành phố
              </span>
              <input
                value={city}
                onChange={(event) =>
                  resetToFirstPage(() => setCity(event.target.value))
                }
                placeholder="Nhập thành phố"
                className="h-12 w-full rounded-2xl border border-[#23140c]/5 bg-[#fffcf8] px-4 text-sm font-bold text-[#23140c] transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {CITY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() =>
                    resetToFirstPage(() =>
                      setCity(city === preset ? "" : preset),
                    )
                  }
                  className={`rounded-full px-3.5 py-2 text-xs font-black transition-all active:scale-95 ${city === preset ? "bg-[#23140c] text-white" : "bg-[#fffcf8] text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-[#ff6b00]"}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="py-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#23140c]">
            <FunnelSimple size={18} weight="bold" className="text-[#ff6b00]" />
            Loại món
          </div>
          <input
            value={cuisine}
            onChange={(event) =>
              resetToFirstPage(() => setCuisine(event.target.value))
            }
            placeholder="Cơm, phở, pizza..."
            className="h-12 w-full rounded-2xl border border-[#23140c]/5 bg-[#fffcf8] px-4 text-sm font-bold text-[#23140c] transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-100"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {CUISINE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() =>
                  resetToFirstPage(() =>
                    setCuisine(cuisine === preset ? "" : preset),
                  )
                }
                className={`rounded-full px-3.5 py-2 text-xs font-black transition-all active:scale-95 ${cuisine === preset ? "bg-[#ff6b00] text-white" : "bg-[#fffcf8] text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-[#ff6b00]"}`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="py-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#23140c]">
            <Clock size={18} weight="bold" className="text-[#ff6b00]" />
            Trạng thái
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["all", "open", "closed"] as OpenFilter[]).map((value) => (
              <button
                key={value}
                onClick={() => resetToFirstPage(() => setOpenFilter(value))}
                className={`min-h-11 rounded-2xl px-2 text-xs font-black transition-all active:scale-95 ${openFilter === value ? "bg-emerald-600 text-white" : "bg-[#fffcf8] text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-emerald-700"}`}
              >
                {value === "all"
                  ? "Tất cả"
                  : value === "open"
                    ? "Đang mở"
                    : "Tạm nghỉ"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#23140c]">
              <Star size={18} weight="fill" className="text-amber-500" />
              Đánh giá
            </div>
            <button
              onClick={() =>
                resetToFirstPage(() => setMinRating(minRating ? "" : "4"))
              }
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition-all active:scale-95 ${minRating ? "bg-amber-500 text-white" : "bg-[#fffcf8] text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-amber-600"}`}
            >
              <Star size={16} weight="fill" />
              Từ 4.0
            </button>
          </div>

          <label className="block">
            <span className="mb-3 flex items-center gap-2 text-sm font-black text-[#23140c]">
              <FadersHorizontal
                size={18}
                weight="bold"
                className="text-[#ff6b00]"
              />
              Sắp xếp
            </span>
            <select
              value={sort}
              onChange={(event) =>
                resetToFirstPage(() => setSort(event.target.value as SortValue))
              }
              className="h-12 w-full appearance-none rounded-2xl border border-[#23140c]/5 bg-[#fffcf8] px-4 text-sm font-black text-[#23140c] transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-100"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#23140c] px-4 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
        >
          <X size={16} weight="bold" />
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
  return (
    <div className="min-h-screen bg-[#fffcf8]">
      <section className="border-b border-[#23140c]/5 bg-white pt-24">
        <div className="mx-auto max-w-[1400px] px-4 pb-10 sm:px-6 lg:px-10 lg:pb-14">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#ff6b00] ring-1 ring-orange-100">
                <Storefront size={16} weight="bold" />
                Nhà hàng quanh bạn
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#23140c] sm:text-6xl">
                Chọn đúng quán nhanh hơn
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-[#704322]/70 sm:text-lg">
                Tìm tên quán riêng, rồi lọc theo địa chỉ, thành phố, loại món và
                trạng thái mở cửa bằng API restaurants.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-4xl border border-[#23140c]/5 bg-[#fff7ed] p-3">
              <div className="rounded-3xl bg-white p-4 shadow-[0_12px_25px_-18px_rgba(35,20,12,0.35)]">
                <p className="text-2xl font-black tracking-tight text-[#23140c]">
                  {total}
                </p>
                <p className="mt-1 text-xs font-bold text-[#704322]/60">
                  Kết quả
                </p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-[0_12px_25px_-18px_rgba(35,20,12,0.35)]">
                <p className="text-2xl font-black tracking-tight text-[#23140c]">
                  {activeFilterCount}
                </p>
                <p className="mt-1 text-xs font-bold text-[#704322]/60">
                  Bộ lọc
                </p>
              </div>
              <div className="rounded-3xl bg-[#23140c] p-4 text-white shadow-[0_12px_25px_-18px_rgba(35,20,12,0.7)]">
                <p className="text-2xl font-black tracking-tight">{page}</p>
                <p className="mt-1 text-xs font-bold text-white/60">Trang</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-w-0">{filterSidebar}</aside>

          <div className="min-w-0">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
                  Danh sách nhà hàng
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#23140c] sm:text-3xl">
                  {isLoading ? "Đang tải kết quả" : `${total} nhà hàng phù hợp`}
                </h2>
              </div>
              <p className="text-sm font-bold text-[#704322]/55">
                Hiển thị tối đa 9 nhà hàng mỗi trang
              </p>
            </div>

            {error && (
              <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                {error.message}
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid overflow-hidden rounded-[1.75rem] bg-white p-3 ring-1 ring-[#23140c]/5 md:grid-cols-[260px_minmax(0,1fr)] md:p-4"
                  >
                    <div className="h-60 animate-pulse rounded-[1.35rem] bg-[#f1e7dc] md:h-full md:min-h-[230px]" />
                    <div className="space-y-4 p-2 pt-5 md:p-5">
                      <div className="h-7 w-2/3 animate-pulse rounded-full bg-[#f1e7dc]" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-[#f1e7dc]" />
                      <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#f1e7dc]" />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="h-11 animate-pulse rounded-2xl bg-[#f1e7dc]" />
                        <div className="h-11 animate-pulse rounded-2xl bg-[#f1e7dc]" />
                      </div>
                      <div className="h-13 w-full animate-pulse rounded-2xl bg-[#f1e7dc] md:w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : restaurants.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <motion.div layout className="grid gap-5">
                  {restaurants.map((restaurant, index) => (
                    <motion.article
                      layout
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{
                        delay: index * 0.035,
                        type: "spring",
                        stiffness: 140,
                        damping: 22,
                      }}
                      className={`group grid overflow-hidden rounded-[1.75rem] bg-white p-3 shadow-[0_18px_45px_-30px_rgba(35,20,12,0.42)] ring-1 ring-[#23140c]/5 transition-all hover:-translate-y-1 hover:shadow-[0_24px_55px_-30px_rgba(255,107,0,0.32)] md:grid-cols-[260px_minmax(0,1fr)] md:p-4 ${restaurant.isOpen ? "" : "opacity-75 grayscale-[0.25]"}`}
                    >
                      <div className="relative h-60 overflow-hidden rounded-[1.35rem] bg-[#f1e7dc] md:h-full md:min-h-[230px]">
                        <img
                          src={buildImageUrl(restaurant)}
                          alt={restaurant.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute left-4 top-4 flex max-w-[calc(100%-5rem)] flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${restaurant.isOpen ? "bg-emerald-600" : "bg-[#704322]"}`}
                          >
                            {restaurant.isOpen ? "Đang mở" : "Tạm nghỉ"}
                          </span>
                          <span className="max-w-36 truncate rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#23140c] backdrop-blur">
                            {restaurant.city}
                          </span>
                        </div>
                        <div className="absolute right-4 top-4">
                          <FavoriteRestaurantButton
                            restaurantId={restaurant.id}
                            initialIsFavorite={
                              isAuthenticated &&
                              favoriteRestaurantIds.includes(restaurant.id)
                            }
                            variant="light"
                            onChange={handleFavoriteChange}
                          />
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col p-2 pt-5 md:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-2xl font-black tracking-tight text-[#23140c] sm:text-3xl">
                              {restaurant.name}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm font-bold leading-relaxed text-[#704322]/65">
                              {restaurant.cuisine}
                            </p>
                          </div>
                          <div className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-black text-[#ff6b00]">
                            <Star size={17} weight="fill" />
                            {formatRating(restaurant.ratingAverage)}
                          </div>
                        </div>

                        <p className="mt-4 line-clamp-2 text-sm font-medium leading-relaxed text-[#704322]/55 md:max-w-2xl">
                          {restaurant.description || restaurant.address}
                        </p>

                        <div className="mt-5 grid gap-2 text-xs font-black text-[#704322] sm:grid-cols-2">
                          <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-[#fff7ed] px-3 py-2.5">
                            <MapPin
                              size={16}
                              weight="bold"
                              className="shrink-0"
                            />
                            <span className="truncate">
                              {restaurant.address}
                            </span>
                          </div>
                          <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-[#fff7ed] px-3 py-2.5">
                            <Clock
                              size={16}
                              weight="bold"
                              className="shrink-0"
                            />
                            <span className="truncate">
                              {restaurant.openTime} - {restaurant.closeTime}
                            </span>
                          </div>
                          <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-orange-50 px-3 py-2.5 text-[#ff6b00] sm:col-span-2">
                            <Truck
                              size={16}
                              weight="bold"
                              className="shrink-0"
                            />
                            <span className="truncate">
                              Phí giao{" "}
                              {formatDeliveryFee(restaurant.deliveryFee)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-[#23140c]/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-bold leading-relaxed text-[#704322]/50">
                            {restaurant.isOpen
                              ? "Sẵn sàng nhận đơn hôm nay"
                              : "Nhà hàng đang tạm nghỉ"}
                          </p>
                          <Link
                            href={`/restaurants/${restaurant.id}`}
                            className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black transition-all active:scale-95 ${restaurant.isOpen ? "bg-[#23140c] text-white hover:bg-[#ff6b00]" : "pointer-events-none bg-[#23140c]/5 text-[#704322]/40"}`}
                          >
                            {restaurant.isOpen
                              ? "Xem thực đơn"
                              : "Đang tạm nghỉ"}
                            {restaurant.isOpen && (
                              <ArrowRight size={18} weight="bold" />
                            )}
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-4xl border border-dashed border-[#23140c]/10 bg-white px-6 py-24 text-center">
                <div className="mb-6 grid size-24 place-items-center rounded-4xl bg-orange-50 text-[#ff6b00]">
                  <Buildings size={48} weight="bold" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-[#23140c]">
                  Không có nhà hàng phù hợp
                </h3>
                <p className="mt-3 max-w-md text-sm font-bold leading-relaxed text-[#704322]/55">
                  Thử đổi từ khóa, bỏ bớt bộ lọc hoặc xem lại thành phố và loại
                  món đang chọn.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
                >
                  Xem tất cả nhà hàng
                </button>
              </div>
            )}

            {!isLoading && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  onClick={() =>
                    setPage((currentPage) => Math.max(currentPage - 1, 1))
                  }
                  disabled={page === 1}
                  className="grid size-12 place-items-center rounded-2xl bg-white text-[#23140c] ring-1 ring-[#23140c]/5 transition-all hover:text-[#ff6b00] disabled:pointer-events-none disabled:opacity-40 active:scale-95"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>
                <div className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#704322] ring-1 ring-[#23140c]/5">
                  Trang {page} / {totalPages}
                </div>
                <button
                  onClick={() =>
                    setPage((currentPage) =>
                      Math.min(currentPage + 1, totalPages),
                    )
                  }
                  disabled={page === totalPages}
                  className="grid size-12 place-items-center rounded-2xl bg-white text-[#23140c] ring-1 ring-[#23140c]/5 transition-all hover:text-[#ff6b00] disabled:pointer-events-none disabled:opacity-40 active:scale-95"
                >
                  <CaretRight size={20} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
