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
  X,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { getRestaurants, RestaurantResponse } from "@/lib/restaurant";

type SortValue = "createdAt-DESC" | "ratingAverage-DESC" | "name-ASC";
type OpenFilter = "all" | "open" | "closed";

const FALLBACK_IMAGE = "https://picsum.photos/seed/hungerdash-restaurant/900/650";

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
  return FALLBACK_IMAGE.replace("hungerdash-restaurant", `restaurant-${restaurant.id}`);
}

function formatRating(value: number) {
  return Number(value || 0).toFixed(1);
}

function getSortParts(sort: SortValue) {
  const [sortBy, sortOrder] = sort.split("-") as ["createdAt" | "ratingAverage" | "name", "ASC" | "DESC"];
  return { sortBy, sortOrder };
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [openFilter, setOpenFilter] = useState<OpenFilter>("all");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState<SortValue>("createdAt-DESC");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const debouncedSearch = useDebouncedValue(searchQuery);

  const activeFilterCount = useMemo(() => {
    return [debouncedSearch, city, address, cuisine, openFilter !== "all", minRating].filter(Boolean).length;
  }, [debouncedSearch, city, address, cuisine, openFilter, minRating]);

  useEffect(() => {
    let isCurrentRequest = true;
    const { sortBy, sortOrder } = getSortParts(sort);

    async function loadRestaurants() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await getRestaurants({
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
        });

        if (!isCurrentRequest) {
          return;
        }

        setRestaurants(result.data);
        setTotal(result.meta.total);
        setTotalPages(Math.max(result.meta.totalPages, 1));
      } catch (error) {
        if (!isCurrentRequest) {
          return;
        }
        setRestaurants([]);
        setTotal(0);
        setTotalPages(1);
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách nhà hàng.");
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadRestaurants();

    return () => {
      isCurrentRequest = false;
    };
  }, [debouncedSearch, city, address, cuisine, openFilter, minRating, sort, page]);

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
                Tìm tên quán riêng, rồi lọc theo địa chỉ, thành phố, loại món và trạng thái mở cửa bằng API restaurants.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[2rem] border border-[#23140c]/5 bg-[#fff7ed] p-3">
              <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_12px_25px_-18px_rgba(35,20,12,0.35)]">
                <p className="text-2xl font-black tracking-tight text-[#23140c]">{total}</p>
                <p className="mt-1 text-xs font-bold text-[#704322]/60">Kết quả</p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_12px_25px_-18px_rgba(35,20,12,0.35)]">
                <p className="text-2xl font-black tracking-tight text-[#23140c]">{activeFilterCount}</p>
                <p className="mt-1 text-xs font-bold text-[#704322]/60">Bộ lọc</p>
              </div>
              <div className="rounded-[1.5rem] bg-[#23140c] p-4 text-white shadow-[0_12px_25px_-18px_rgba(35,20,12,0.7)]">
                <p className="text-2xl font-black tracking-tight">{page}</p>
                <p className="mt-1 text-xs font-bold text-white/60">Trang</p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-[#23140c]/5 bg-[#fffcf8] p-3 shadow-[0_20px_45px_-30px_rgba(35,20,12,0.35)]">
            <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px_190px_160px]">
              <label className="group relative block">
                <span className="sr-only">Tìm kiếm nhà hàng</span>
                <MagnifyingGlass className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/35" size={22} weight="bold" />
                <input
                  value={searchQuery}
                  onChange={(event) => resetToFirstPage(() => setSearchQuery(event.target.value))}
                  placeholder="Tìm tên nhà hàng..."
                  className="h-14 w-full rounded-[1.25rem] border border-transparent bg-white pl-14 pr-5 text-sm font-bold text-[#23140c] shadow-sm transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="relative block">
                <span className="sr-only">Địa chỉ</span>
                <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35" size={20} weight="bold" />
                <input
                  value={address}
                  onChange={(event) => resetToFirstPage(() => setAddress(event.target.value))}
                  placeholder="Địa chỉ"
                  className="h-14 w-full rounded-[1.25rem] border border-transparent bg-white pl-12 pr-4 text-sm font-bold text-[#23140c] shadow-sm transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="relative block">
                <span className="sr-only">Thành phố</span>
                <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35" size={20} weight="bold" />
                <input
                  value={city}
                  onChange={(event) => resetToFirstPage(() => setCity(event.target.value))}
                  placeholder="Thành phố"
                  className="h-14 w-full rounded-[1.25rem] border border-transparent bg-white pl-12 pr-4 text-sm font-bold text-[#23140c] shadow-sm transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="relative block">
                <span className="sr-only">Loại món</span>
                <FunnelSimple className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35" size={20} weight="bold" />
                <input
                  value={cuisine}
                  onChange={(event) => resetToFirstPage(() => setCuisine(event.target.value))}
                  placeholder="Loại món"
                  className="h-14 w-full rounded-[1.25rem] border border-transparent bg-white pl-12 pr-4 text-sm font-bold text-[#23140c] shadow-sm transition-all placeholder:text-[#704322]/35 focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="relative block">
                <span className="sr-only">Sắp xếp</span>
                <FadersHorizontal className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35" size={20} weight="bold" />
                <select
                  value={sort}
                  onChange={(event) => resetToFirstPage(() => setSort(event.target.value as SortValue))}
                  className="h-14 w-full appearance-none rounded-[1.25rem] border border-transparent bg-white pl-12 pr-9 text-sm font-black text-[#23140c] shadow-sm transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-100"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {CITY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => resetToFirstPage(() => setCity(city === preset ? "" : preset))}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-all active:scale-95 ${city === preset ? "bg-[#23140c] text-white" : "bg-white text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-[#ff6b00]"}`}
                  >
                    {preset}
                  </button>
                ))}
                {CUISINE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => resetToFirstPage(() => setCuisine(cuisine === preset ? "" : preset))}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-all active:scale-95 ${cuisine === preset ? "bg-[#ff6b00] text-white" : "bg-white text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-[#ff6b00]"}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "open", "closed"] as OpenFilter[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => resetToFirstPage(() => setOpenFilter(value))}
                    className={`rounded-full px-4 py-2 text-xs font-black transition-all active:scale-95 ${openFilter === value ? "bg-emerald-600 text-white" : "bg-white text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-emerald-700"}`}
                  >
                    {value === "all" ? "Tất cả" : value === "open" ? "Đang mở" : "Tạm nghỉ"}
                  </button>
                ))}
                <button
                  onClick={() => resetToFirstPage(() => setMinRating(minRating ? "" : "4"))}
                  className={`rounded-full px-4 py-2 text-xs font-black transition-all active:scale-95 ${minRating ? "bg-amber-500 text-white" : "bg-white text-[#704322]/70 ring-1 ring-[#23140c]/5 hover:text-amber-600"}`}
                >
                  <span className="inline-flex items-center gap-1"><Star size={13} weight="fill" /> Từ 4.0</span>
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full bg-[#23140c]/5 px-4 py-2 text-xs font-black text-[#704322] transition-all hover:bg-[#23140c] hover:text-white active:scale-95"
                  >
                    <X size={13} weight="bold" />
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Danh sách nhà hàng</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#23140c] sm:text-3xl">
              {isLoading ? "Đang tải kết quả" : `${total} nhà hàng phù hợp`}
            </h2>
          </div>
          <p className="text-sm font-bold text-[#704322]/55">Hiển thị tối đa 9 nhà hàng mỗi trang</p>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[2rem] bg-white p-4 ring-1 ring-[#23140c]/5">
                <div className="h-56 animate-pulse rounded-[1.5rem] bg-[#f1e7dc]" />
                <div className="space-y-3 p-3 pt-5">
                  <div className="h-6 w-2/3 animate-pulse rounded-full bg-[#f1e7dc]" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-[#f1e7dc]" />
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#f1e7dc]" />
                  <div className="h-12 w-full animate-pulse rounded-[1rem] bg-[#f1e7dc]" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {restaurants.map((restaurant, index) => (
                <motion.article
                  layout
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: index * 0.035, type: "spring", stiffness: 140, damping: 22 }}
                  className={`group overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_18px_45px_-28px_rgba(35,20,12,0.45)] ring-1 ring-[#23140c]/5 transition-all hover:-translate-y-1 hover:shadow-[0_24px_55px_-28px_rgba(255,107,0,0.35)] ${restaurant.isOpen ? "" : "opacity-75 grayscale-[0.25]"}`}
                >
                  <div className="relative h-56 overflow-hidden rounded-[1.5rem] bg-[#f1e7dc]">
                    <img
                      src={buildImageUrl(restaurant)}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${restaurant.isOpen ? "bg-emerald-600" : "bg-[#704322]"}`}>
                        {restaurant.isOpen ? "Đang mở" : "Tạm nghỉ"}
                      </span>
                      <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#23140c] backdrop-blur">
                        {restaurant.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-h-[270px] flex-col p-3 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-2xl font-black tracking-tight text-[#23140c]">
                          {restaurant.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm font-bold leading-relaxed text-[#704322]/65">
                          {restaurant.cuisine}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-black text-[#ff6b00]">
                        <Star size={17} weight="fill" />
                        {formatRating(restaurant.ratingAverage)}
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm font-medium leading-relaxed text-[#704322]/55">
                      {restaurant.description || restaurant.address}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-black text-[#704322]">
                      <div className="flex items-center gap-2 rounded-[1rem] bg-[#fff7ed] px-3 py-2.5">
                        <MapPin size={16} weight="bold" />
                        <span className="truncate">{restaurant.address}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-[1rem] bg-[#fff7ed] px-3 py-2.5">
                        <Clock size={16} weight="bold" />
                        <span>{restaurant.openTime} - {restaurant.closeTime}</span>
                      </div>
                    </div>

                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className={`mt-auto inline-flex h-13 items-center justify-center gap-2 rounded-[1.1rem] text-sm font-black transition-all active:scale-95 ${restaurant.isOpen ? "bg-[#23140c] text-white hover:bg-[#ff6b00]" : "pointer-events-none bg-[#23140c]/5 text-[#704322]/40"}`}
                    >
                      {restaurant.isOpen ? "Xem thực đơn" : "Đang tạm nghỉ"}
                      {restaurant.isOpen && <ArrowRight size={18} weight="bold" />}
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#23140c]/10 bg-white px-6 py-24 text-center">
            <div className="mb-6 grid size-24 place-items-center rounded-[2rem] bg-orange-50 text-[#ff6b00]">
              <Buildings size={48} weight="bold" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-[#23140c]">Không có nhà hàng phù hợp</h3>
            <p className="mt-3 max-w-md text-sm font-bold leading-relaxed text-[#704322]/55">
              Thử đổi từ khóa, bỏ bớt bộ lọc hoặc xem lại thành phố và loại món đang chọn.
            </p>
            <button
              onClick={clearFilters}
              className="mt-7 inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
            >
              Xem tất cả nhà hàng
            </button>
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              disabled={page === 1}
              className="grid size-12 place-items-center rounded-[1rem] bg-white text-[#23140c] ring-1 ring-[#23140c]/5 transition-all hover:text-[#ff6b00] disabled:pointer-events-none disabled:opacity-40 active:scale-95"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <div className="rounded-[1rem] bg-white px-5 py-3 text-sm font-black text-[#704322] ring-1 ring-[#23140c]/5">
              Trang {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
              disabled={page === totalPages}
              className="grid size-12 place-items-center rounded-[1rem] bg-white text-[#23140c] ring-1 ring-[#23140c]/5 transition-all hover:text-[#ff6b00] disabled:pointer-events-none disabled:opacity-40 active:scale-95"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
