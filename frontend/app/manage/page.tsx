"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChartBar,
  ChartLineUp,
  Clock,
  CookingPot,
  CurrencyCircleDollar,
  Handbag,
  Receipt,
  Star,
  Storefront,
  TrendUp,
  WarningCircle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { getManagedOverview, ManagedOverviewResponse } from "@/lib/order";

const statusTone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-100",
  preparing: "bg-orange-50 text-orange-700 ring-orange-100",
  delivering: "bg-sky-50 text-sky-700 ring-sky-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompactMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0) + "đ";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function RevenueChart({ data }: { data: ManagedOverviewResponse["revenueSeries"] }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 320 : 24 + (index * 592) / (data.length - 1);
    const y = 190 - (item.revenue / maxRevenue) * 150;
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `24,206 ${line} 616,206`;

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(35,20,12,0.38)] ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Doanh thu</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">7 ngày gần nhất</h2>
        </div>
        <ChartLineUp size={30} weight="bold" className="text-orange-500" />
      </div>
      <div className="overflow-hidden rounded-[1.5rem] bg-[#fffcf8] p-3 ring-1 ring-[#23140c]/5">
        <svg viewBox="0 0 640 240" className="h-64 w-full" role="img" aria-label="Biểu đồ doanh thu 7 ngày">
          {[40, 90, 140, 190].map((y) => (
            <line key={y} x1="24" x2="616" y1={y} y2={y} stroke="#23140c" strokeOpacity="0.07" strokeWidth="1" />
          ))}
          <polygon points={area} fill="#ff6b00" opacity="0.09" />
          <polyline points={line} fill="none" stroke="#ff6b00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.date}>
              <circle cx={point.x} cy={point.y} r="7" fill="#fffcf8" stroke="#ff6b00" strokeWidth="4" />
              <text x={point.x} y="226" textAnchor="middle" className="fill-[#704322] text-[12px] font-bold">
                {shortDate(point.date)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-7">
        {data.map((item) => (
          <div key={item.date} className="rounded-[1rem] bg-[#fffcf8] px-3 py-2 ring-1 ring-[#23140c]/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#704322]/35">{shortDate(item.date)}</p>
            <p className="mt-1 truncate text-xs font-black text-[#23140c]">{formatCompactMoney(item.revenue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusChart({ data, total }: { data: ManagedOverviewResponse["statusBreakdown"]; total: number }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(35,20,12,0.38)] ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Trạng thái</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">Luồng đơn hàng</h2>
        </div>
        <ChartBar size={30} weight="bold" className="text-orange-500" />
      </div>
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#23140c]/10 px-4 py-14 text-center">
            <p className="text-sm font-bold text-[#704322]/45">Chưa có đơn hàng để vẽ biểu đồ.</p>
          </div>
        ) : data.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.status}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone[item.status] ?? "bg-stone-50 text-stone-700 ring-stone-100"}`}>
                  {item.label}
                </span>
                <span className="text-sm font-black text-[#23140c]">{item.count} đơn</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#23140c]/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(6, (item.count / maxCount) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 22 }}
                  className="h-full rounded-full bg-[#ff6b00]"
                />
              </div>
              <p className="mt-1 text-[11px] font-bold text-[#704322]/40">{percent}% tổng đơn</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ManageDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ManagedOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadOverview() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await getManagedOverview();
        if (isCurrentRequest) {
          setOverview(data);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải tổng quan quản lý.");
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

  const summary = overview?.summary;
  const stats = useMemo(() => [
    {
      label: "Doanh thu đã nhận",
      value: formatMoney(summary?.totalRevenue ?? 0),
      note: `Hôm nay ${formatMoney(summary?.todayRevenue ?? 0)}`,
      icon: CurrencyCircleDollar,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Đơn chờ xác nhận",
      value: String(summary?.pendingOrders ?? 0),
      note: `${summary?.activeOrders ?? 0} đơn đang xử lý`,
      icon: Clock,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "Nhà hàng đang mở",
      value: `${summary?.openRestaurantCount ?? 0}/${summary?.restaurantCount ?? 0}`,
      note: "Theo tài khoản quản lý",
      icon: Storefront,
      tone: "text-orange-600 bg-orange-50",
    },
    {
      label: "Giá trị đơn trung bình",
      value: formatMoney(summary?.averageOrderValue ?? 0),
      note: `${summary?.completedOrders ?? 0} đơn đã nhận`,
      icon: TrendUp,
      tone: "text-sky-600 bg-sky-50",
    },
  ], [summary]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Tổng quan quản lý</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#23140c]">Xin chào, {user?.username ?? "quản lý"}</h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
            Theo dõi doanh thu đã được khách xác nhận, đơn đang xử lý và hiệu suất từng nhà hàng.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/manage/orders" className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] bg-[#23140c] px-5 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-[0.98]">
            <Handbag size={18} weight="bold" />
            Xử lý đơn hàng
          </Link>
          <Link href="/manage/restaurants" className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] bg-white px-5 text-sm font-black text-[#23140c] ring-1 ring-black/5 transition-all hover:text-[#ff6b00] active:scale-[0.98]">
            <Storefront size={18} weight="bold" />
            Nhà hàng
          </Link>
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
          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
            <div className="h-[430px] animate-pulse rounded-[2rem] bg-white ring-1 ring-black/5" />
            <div className="h-[430px] animate-pulse rounded-[2rem] bg-white ring-1 ring-black/5" />
          </div>
        </div>
      ) : !overview ? (
        <div className="rounded-[2rem] border border-dashed border-[#23140c]/10 bg-white px-6 py-20 text-center">
          <Receipt size={48} weight="bold" className="mx-auto text-orange-200" />
          <h2 className="mt-5 text-2xl font-black text-[#23140c]">Chưa có dữ liệu tổng quan</h2>
          <p className="mt-3 text-sm font-bold text-[#704322]/55">Khi có nhà hàng và đơn hàng, số liệu sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, type: "spring", stiffness: 100, damping: 20 }}
                  className="rounded-[2rem] bg-white p-6 shadow-[0_18px_45px_-30px_rgba(35,20,12,0.32)] ring-1 ring-black/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className={`grid size-12 place-items-center rounded-[1rem] ${stat.tone}`}>
                      <Icon size={25} weight="bold" />
                    </div>
                    <span className="rounded-full bg-[#fffcf8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#704322]/35 ring-1 ring-[#23140c]/5">Live</span>
                  </div>
                  <p className="mt-6 text-xs font-black uppercase tracking-widest text-[#704322]/40">{stat.label}</p>
                  <p className="mt-2 truncate text-2xl font-black tracking-tight text-[#23140c]">{stat.value}</p>
                  <p className="mt-2 text-xs font-bold text-[#704322]/45">{stat.note}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
            <RevenueChart data={overview.revenueSeries} />
            <StatusChart data={overview.statusBreakdown} total={overview.summary.totalOrders} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(35,20,12,0.38)] ring-1 ring-black/5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Hiệu suất</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">Nhà hàng nổi bật</h2>
                </div>
                <Star size={30} weight="bold" className="text-orange-500" />
              </div>
              <div className="space-y-3">
                {overview.topRestaurants.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[#23140c]/10 px-4 py-14 text-center">
                    <Storefront size={42} weight="bold" className="mx-auto text-orange-200" />
                    <p className="mt-3 text-sm font-bold text-[#704322]/45">Bạn chưa có nhà hàng nào.</p>
                  </div>
                ) : overview.topRestaurants.map((restaurant, index) => (
                  <Link
                    key={restaurant.id}
                    href={`/manage/restaurants/${restaurant.id}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[1.25rem] bg-[#fffcf8] p-4 ring-1 ring-[#23140c]/5 transition-all hover:bg-orange-50 active:scale-[0.99]"
                  >
                    <div className="grid size-11 place-items-center rounded-[1rem] bg-white text-sm font-black text-[#ff6b00] ring-1 ring-black/5">{index + 1}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-black text-[#23140c]">{restaurant.name}</p>
                        <span className={`size-2 rounded-full ${restaurant.isOpen ? "bg-emerald-500" : "bg-stone-300"}`} />
                      </div>
                      <p className="mt-1 text-xs font-bold text-[#704322]/45">{restaurant.orderCount} đơn • {restaurant.ratingAverage.toFixed(1)} sao</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#23140c]">{formatCompactMoney(restaurant.revenue)}</p>
                      <ArrowRight size={16} weight="bold" className="ml-auto mt-1 text-[#704322]/25 transition-transform group-hover:translate-x-1 group-hover:text-[#ff6b00]" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(35,20,12,0.38)] ring-1 ring-black/5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Hoạt động</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">Đơn hàng gần đây</h2>
                </div>
                <Link href="/manage/orders" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#ff6b00] hover:text-[#e45f00]">
                  Xem tất cả
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
              <div className="divide-y divide-[#23140c]/5">
                {overview.recentOrders.length === 0 ? (
                  <div className="px-4 py-16 text-center">
                    <CookingPot size={44} weight="bold" className="mx-auto text-orange-200" />
                    <p className="mt-3 text-sm font-bold text-[#704322]/45">Đơn mới sẽ xuất hiện tại đây.</p>
                  </div>
                ) : overview.recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/orders/${order.id}`} className="text-sm font-black text-[#23140c] hover:text-[#ff6b00]">Đơn #{order.id}</Link>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${statusTone[order.orderStatus] ?? "bg-stone-50 text-stone-700 ring-stone-100"}`}>
                          {overview.statusBreakdown.find((item) => item.status === order.orderStatus)?.label ?? order.orderStatus}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs font-bold text-[#704322]/45">{order.restaurantName} • {order.phoneNumber} • {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm font-black text-[#ff6b00]">{formatMoney(order.totalAmount)}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#704322]/35">{order.paymentMethod === "cash" ? "Tiền mặt" : "Thẻ"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
