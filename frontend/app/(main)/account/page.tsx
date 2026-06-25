"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarBlank,
  ChatCircleText,
  CheckCircle,
  EnvelopeSimple,
  ForkKnife,
  Heart,
  HouseLine,
  IdentificationCard,
  Phone,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/lib/auth";
import { ProfileUpdateForm } from "@/components/account/ProfileUpdateForm";

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  customer: "Khách hàng",
  restaurant: "Nhà hàng",
  user: "Khách hàng",
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

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const normalizedRole = normalizeRole(user?.role);
  const roleLabel = roleLabels[normalizedRole] ?? user?.role ?? "Khách hàng";
  const statusLabel =
    statusLabels[user?.status?.toLowerCase() ?? ""] ??
    user?.status ??
    "Chưa cập nhật";

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="min-h-[80dvh] bg-[#fffcf8] pt-32 pb-24 lg:pt-40">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-10">
          <div className="h-56 animate-pulse rounded-4xl bg-white ring-1 ring-black/5" />
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="h-80 animate-pulse rounded-4xl bg-white ring-1 ring-black/5" />
            <div className="h-80 animate-pulse rounded-4xl bg-white ring-1 ring-black/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center bg-[#fffcf8] px-4 text-center">
        <div className="max-w-md rounded-4xl bg-white p-8 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-orange-50 text-[#ff6b00]">
            <UserCircle size={44} weight="bold" />
          </div>
          <h1 className="text-2xl font-black text-[#23140c]">
            Bạn cần đăng nhập
          </h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">
            Đăng nhập để xem thông tin tài khoản và lịch sử mua hàng của bạn.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  const profileItems = [
    { label: "Tên đăng nhập", value: user.username, icon: IdentificationCard },
    { label: "Email", value: user.email, icon: EnvelopeSimple },
    {
      label: "Số điện thoại",
      value: user.phoneNumber || "Chưa cập nhật",
      icon: Phone,
    },
    { label: "Vai trò", value: roleLabel, icon: ShieldCheck },
    { label: "Trạng thái", value: statusLabel, icon: CheckCircle },
    {
      label: "Ngày tham gia",
      value: formatDate(user.createdAt),
      icon: CalendarBlank,
    },
  ];

  const quickLinks = [
    {
      label: "Đơn hàng của tôi",
      description: "Theo dõi trạng thái giao hàng",
      href: "/orders",
      icon: Receipt,
    },
    {
      label: "Tin nhắn với nhà hàng",
      description: "Trao đổi với các quán",
      href: "/chat",
      icon: ChatCircleText,
    },
    {
      label: "Nhà hàng yêu thích",
      description: "Mở lại các quán đã lưu",
      href: "/account/favorites",
      icon: Heart,
    },
    {
      label: "Giỏ hàng",
      description: "Kiểm tra món đang chọn",
      href: "/cart",
      icon: ShoppingCart,
    },
    {
      label: "Khám phá nhà hàng",
      description: "Tìm thêm món ngon hôm nay",
      href: "/restaurants",
      icon: ForkKnife,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fffcf8] pt-32 pb-24 lg:pt-40">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-10">
        <section className="overflow-hidden rounded-4xl bg-[#23140c] shadow-[0_30px_80px_-45px_rgba(35,20,12,0.7)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid size-24 shrink-0 place-items-center rounded-[1.75rem] bg-[#ff6b00] text-3xl font-black tracking-tight text-white shadow-[0_16px_35px_-18px_rgba(255,107,0,0.8)] ring-1 ring-white/15">
                {getInitials(user.username)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-white/40">
                  Tài khoản HungerDash
                </p>
                <h1 className="mt-3 truncate text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {user.username}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-sm font-bold text-white/60">
                  <EnvelopeSimple
                    size={18}
                    weight="bold"
                    className="shrink-0 text-[#ffb27b]"
                  />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-sm font-black text-white ring-1 ring-white/10 transition-all hover:bg-white hover:text-[#23140c] active:scale-95 sm:w-fit"
            >
              <SignOut size={18} weight="bold" />
              Đăng xuất
            </button>
          </div>
        </section>

        <div className="mt-6">
          <ProfileUpdateForm />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.28)] ring-1 ring-black/5 sm:p-7">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
                  Hồ sơ
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">
                  Thông tin cá nhân
                </h2>
              </div>
              <UserCircle
                size={30}
                weight="bold"
                className="text-[#704322]/25"
              />
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
                    <p className="mt-1 break-words text-sm font-black text-[#23140c]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-4xl bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.24)] ring-1 ring-black/5 sm:p-7">
              <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">
                Lối tắt
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">
                Hoạt động của bạn
              </h2>

              <div className="mt-6 space-y-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-4 rounded-[1.25rem] bg-[#fffcf8] p-4 ring-1 ring-[#23140c]/5 transition-all hover:bg-orange-50 active:scale-[0.98]"
                    >
                      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[#ff6b00] ring-1 ring-black/5">
                        <Icon size={22} weight="bold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#23140c]">
                          {item.label}
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-[#704322]/50">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight
                        size={18}
                        weight="bold"
                        className="shrink-0 text-[#704322]/30 transition-transform group-hover:translate-x-1 group-hover:text-[#ff6b00]"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-4xl bg-orange-50 p-5 ring-1 ring-orange-100 sm:p-7">
              <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-white text-[#ff6b00] ring-1 ring-orange-100">
                <HouseLine size={24} weight="bold" />
              </div>
              <h2 className="text-xl font-black text-[#23140c]">
                Thông tin được lấy từ phiên đăng nhập
              </h2>
              <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">
                Khi backend trả thêm avatar, số điện thoại hoặc ngày cập nhật,
                trang này sẽ tự hiển thị theo dữ liệu mới trong tài khoản.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
