"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Buildings, CheckCircle, Storefront, TrendUp, Users, WarningCircle } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { AdminOverviewResponse, getAdminOverview } from "@/lib/admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    customer: "Khách hàng",
    restaurant: "Chủ nhà hàng",
    admin: "Admin",
  };
  return labels[role] ?? role;
}

function StatBar({ label, value, max, tone = "bg-emerald-500" }: { label: string; value: number; max: number; tone?: string }) {
  const percent = max > 0 ? Math.max(5, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-black text-[#1f2925]">{label}</span>
        <span className="text-sm font-black text-[#1f2925]/55">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#1f2925]/6">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadOverview() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await getAdminOverview();
        if (isCurrentRequest) {
          setOverview(data);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải thống kê admin.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const maxRoleCount = useMemo(() => Math.max(...(overview?.usersByRole.map((item) => item.count) ?? [1]), 1), [overview]);
  const maxStatusCount = useMemo(() => Math.max(...(overview?.restaurantsByStatus.map((item) => item.count) ?? [1]), 1), [overview]);
  const maxCityCount = useMemo(() => Math.max(...(overview?.topCities.map((item) => item.count) ?? [1]), 1), [overview]);
  const maxCuisineCount = useMemo(() => Math.max(...(overview?.topCuisines.map((item) => item.count) ?? [1]), 1), [overview]);

  const summary = overview?.summary;
  const cards = [
    {
      label: "Tổng người dùng",
      value: summary?.totalUsers ?? 0,
      note: `${summary?.activeUserCount ?? 0} tài khoản active`,
      icon: Users,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Chủ nhà hàng",
      value: summary?.restaurantOwnerCount ?? 0,
      note: `${summary?.customerCount ?? 0} khách hàng`,
      icon: Buildings,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Tổng nhà hàng",
      value: summary?.totalRestaurants ?? 0,
      note: `${summary?.openRestaurantCount ?? 0} đang mở`,
      icon: Storefront,
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Rating trung bình",
      value: summary?.averageRestaurantRating ?? 0,
      note: `${summary?.closedRestaurantCount ?? 0} tạm nghỉ`,
      icon: TrendUp,
      tone: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#1f2925]">Thống kê hệ thống</h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-[#1f2925]/55">
            Tổng quan người dùng và nhà hàng trong hệ thống. Trang này chỉ tập trung vào hai phần bạn cần quản trị.
          </p>
        </div>
      </header>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
          <WarningCircle size={20} weight="bold" />
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-[2rem] bg-white ring-1 ring-black/5" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="h-80 animate-pulse rounded-[2rem] bg-white ring-1 ring-black/5" />
            <div className="h-80 animate-pulse rounded-[2rem] bg-white ring-1 ring-black/5" />
          </div>
        </div>
      ) : !overview ? (
        <div className="rounded-[2rem] border border-dashed border-[#1f2925]/10 bg-white px-6 py-20 text-center">
          <Users size={48} weight="bold" className="mx-auto text-emerald-200" />
          <h2 className="mt-5 text-2xl font-black text-[#1f2925]">Chưa có dữ liệu</h2>
          <p className="mt-3 text-sm font-bold text-[#1f2925]/45">Không thể hiển thị thống kê admin lúc này.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-[2rem] bg-white p-6 shadow-[0_18px_45px_-30px_rgba(31,41,37,0.28)] ring-1 ring-black/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`grid size-12 place-items-center rounded-[1rem] ${card.tone}`}>
                      <Icon size={25} weight="bold" />
                    </div>
                    <CheckCircle size={20} weight="fill" className="text-emerald-500" />
                  </div>
                  <p className="mt-6 text-xs font-black uppercase tracking-widest text-[#1f2925]/40">{card.label}</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-[#1f2925]">{card.value}</p>
                  <p className="mt-2 text-xs font-bold text-[#1f2925]/45">{card.note}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(31,41,37,0.3)] ring-1 ring-black/5">
              <h2 className="text-2xl font-black tracking-tight text-[#1f2925]">Người dùng</h2>
              <p className="mt-1 text-sm font-bold text-[#1f2925]/45">Phân bố theo vai trò và trạng thái tài khoản.</p>
              <div className="mt-6 space-y-5">
                {overview.usersByRole.map((item) => (
                  <StatBar key={item.role} label={roleLabel(item.role)} value={item.count} max={maxRoleCount} />
                ))}
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {overview.usersByStatus.map((item) => (
                  <div key={item.status} className="rounded-[1.25rem] bg-[#f8faf9] p-4 ring-1 ring-[#1f2925]/5">
                    <p className="text-2xl font-black text-[#1f2925]">{item.count}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#1f2925]/35">{item.status}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(31,41,37,0.3)] ring-1 ring-black/5">
              <h2 className="text-2xl font-black tracking-tight text-[#1f2925]">Nhà hàng</h2>
              <p className="mt-1 text-sm font-bold text-[#1f2925]/45">Trạng thái hoạt động, thành phố và loại món phổ biến.</p>
              <div className="mt-6 space-y-5">
                {overview.restaurantsByStatus.map((item) => (
                  <StatBar key={item.status} label={item.label} value={item.count} max={maxStatusCount} tone={item.status === "open" ? "bg-emerald-500" : "bg-stone-400"} />
                ))}
              </div>
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-[1.5rem] bg-[#f8faf9] p-4 ring-1 ring-[#1f2925]/5">
                  <p className="text-xs font-black uppercase tracking-widest text-[#1f2925]/40">Top thành phố</p>
                  {overview.topCities.length === 0 ? <p className="text-sm font-bold text-[#1f2925]/35">Chưa có dữ liệu</p> : overview.topCities.map((item) => (
                    <StatBar key={item.city} label={item.city} value={item.count} max={maxCityCount} tone="bg-sky-500" />
                  ))}
                </div>
                <div className="space-y-3 rounded-[1.5rem] bg-[#f8faf9] p-4 ring-1 ring-[#1f2925]/5">
                  <p className="text-xs font-black uppercase tracking-widest text-[#1f2925]/40">Top loại món</p>
                  {overview.topCuisines.length === 0 ? <p className="text-sm font-bold text-[#1f2925]/35">Chưa có dữ liệu</p> : overview.topCuisines.map((item) => (
                    <StatBar key={item.cuisine} label={item.cuisine} value={item.count} max={maxCuisineCount} tone="bg-orange-500" />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(31,41,37,0.3)] ring-1 ring-black/5">
              <h2 className="text-2xl font-black tracking-tight text-[#1f2925]">Người dùng mới</h2>
              <div className="mt-5 divide-y divide-[#1f2925]/5">
                {overview.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#1f2925]">{user.username}</p>
                      <p className="mt-1 truncate text-xs font-bold text-[#1f2925]/45">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-100">{roleLabel(user.role)}</span>
                      <p className="mt-2 text-[10px] font-bold text-[#1f2925]/35">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(31,41,37,0.3)] ring-1 ring-black/5">
              <h2 className="text-2xl font-black tracking-tight text-[#1f2925]">Nhà hàng mới</h2>
              <div className="mt-5 divide-y divide-[#1f2925]/5">
                {overview.recentRestaurants.map((restaurant) => (
                  <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 hover:text-emerald-600">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#1f2925]">{restaurant.name}</p>
                      <p className="mt-1 truncate text-xs font-bold text-[#1f2925]/45">{restaurant.city} • {restaurant.cuisine}</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${restaurant.isOpen ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-stone-50 text-stone-600 ring-stone-100"}`}>
                        {restaurant.isOpen ? "Đang mở" : "Tạm nghỉ"}
                      </span>
                      <p className="mt-2 text-[10px] font-bold text-[#1f2925]/35">{restaurant.ratingAverage.toFixed(1)} sao</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
