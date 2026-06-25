"use client";

import Link from "next/link";
import {
  CalendarBlank,
  EnvelopeSimple,
  IdentificationCard,
  Phone,
  ShieldCheck,
  Storefront,
  UserCircle,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { normalizeRole } from "@/lib/auth";
import { getMyRestaurants } from "@/lib/restaurant";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileUpdateForm } from "@/components/account/ProfileUpdateForm";
import { useQuery } from "@tanstack/react-query";

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  restaurant: "Chủ nhà hàng",
};

const statusLabels: Record<string, string> = {
  active: "Đang hoạt động",
  inactive: "Tạm khóa",
  banned: "Bị khóa",
  pending: "Chờ duyệt",
};

function formatDate(value?: string) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name?: string) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return "HD";
  }

  return trimmedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ManageAccountPage() {
  const { user } = useAuth();
  const normalizedRole = normalizeRole(user?.role);
  const roleLabel = roleLabels[normalizedRole] ?? user?.role ?? "Chủ nhà hàng";
  const statusLabel =
    statusLabels[user?.status?.toLowerCase() ?? ""] ??
    user?.status ??
    "Chưa cập nhật";

  const restaurantsQuery = useQuery({
    queryKey: ["myRestaurants"],
    queryFn: getMyRestaurants,
    staleTime: 3 * 60 * 1000,
  });

  const restaurants = restaurantsQuery.data ?? [];
  const isLoadingRestaurants = restaurantsQuery.isLoading;
  const errorMessage = restaurantsQuery.error
    ? restaurantsQuery.error instanceof ApiError
      ? restaurantsQuery.error.message
      : "Không thể tải danh sách nhà hàng."
    : "";

  const profileItems = [
    {
      label: "Tên tài khoản",
      value: user?.username ?? "Chưa cập nhật",
      icon: IdentificationCard,
    },
    {
      label: "Email",
      value: user?.email ?? "Chưa cập nhật",
      icon: EnvelopeSimple,
    },
    {
      label: "Số điện thoại",
      value: user?.phoneNumber || "Chưa cập nhật",
      icon: Phone,
    },
    { label: "Vai trò", value: roleLabel, icon: ShieldCheck },
    { label: "Trạng thái", value: statusLabel, icon: UserCircle },
    {
      label: "Ngày tham gia",
      value: formatDate(user?.createdAt),
      icon: CalendarBlank,
    },
  ];

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
          Tài khoản quản lý
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#23140c]">
          Hồ sơ nhà hàng
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
          Quản lý thông tin đăng nhập, vai trò và các nhà hàng thuộc tài khoản
          này.
        </p>
      </header>

      <section className="overflow-hidden rounded-4xl bg-[#23140c] shadow-[0_30px_80px_-45px_rgba(35,20,12,0.7)]">
        <div className="grid gap-8 p-7 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid size-24 shrink-0 place-items-center rounded-[1.75rem] bg-[#ff6b00] text-3xl font-black tracking-tight text-white shadow-[0_16px_35px_-18px_rgba(255,107,0,0.8)] ring-1 ring-white/15">
              {getInitials(user?.username)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                {roleLabel}
              </p>
              <h2 className="mt-3 truncate text-4xl font-black tracking-tight text-white">
                {user?.username ?? "Manager"}
              </h2>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-white/60">
                <EnvelopeSimple
                  size={18}
                  weight="bold"
                  className="shrink-0 text-[#ffb27b]"
                />
                <span className="truncate">
                  {user?.email ?? "Chưa cập nhật"}
                </span>
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 px-5 py-4 text-white ring-1 ring-white/10">
            <p className="text-3xl font-black">{restaurants.length}</p>
            <p className="text-xs font-black uppercase tracking-widest text-white/45">
              Nhà hàng quản lý
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <ProfileUpdateForm />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
                Hồ sơ
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">
                Thông tin manager
              </h2>
            </div>
            <UserCircle size={30} weight="bold" className="text-[#704322]/25" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {profileItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-[1.25rem] bg-[#fffcf8] p-4 ring-1 ring-[#23140c]/5"
                >
                  <div className="mb-4 grid size-10 place-items-center rounded-[0.9rem] bg-orange-50 text-[#ff6b00]">
                    <Icon size={20} weight="bold" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#704322]/40">
                    {item.label}
                  </p>
                  <p className="mt-1 wrap-break-word text-sm font-black text-[#23140c]">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.24)] ring-1 ring-black/5 sm:p-7">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
                Nhà hàng
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">
                Đang quản lý
              </h2>
            </div>
            <Storefront size={30} weight="bold" className="text-[#704322]/25" />
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          )}

          {isLoadingRestaurants ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-[1.25rem] bg-[#fffcf8]"
                />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#23140c]/10 px-5 py-12 text-center">
              <Storefront
                size={42}
                weight="bold"
                className="mx-auto text-orange-200"
              />
              <h3 className="mt-4 text-lg font-black text-[#23140c]">
                Chưa có nhà hàng
              </h3>
              <p className="mt-2 text-sm font-bold text-[#704322]/55">
                Tạo nhà hàng đầu tiên để bắt đầu nhận đơn.
              </p>
              <Link
                href="/manage/restaurants/new"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-[#23140c] px-5 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
              >
                Tạo nhà hàng
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/manage/restaurants/${restaurant.id}`}
                  className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-[#fffcf8] p-4 ring-1 ring-[#23140c]/5 transition-all hover:bg-orange-50 active:scale-[0.98]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#23140c]">
                      {restaurant.name}
                    </p>
                    <p className="mt-1 truncate text-xs font-bold text-[#704322]/50">
                      {restaurant.city} • {restaurant.cuisine}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${restaurant.isOpen ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-red-50 text-red-700 ring-1 ring-red-100"}`}
                  >
                    {restaurant.isOpen ? "Mở cửa" : "Tạm nghỉ"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
