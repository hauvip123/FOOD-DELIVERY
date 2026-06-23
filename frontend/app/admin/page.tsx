"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { 
  Buildings, 
  Storefront, 
  TrendUp, 
  Users, 
  WarningCircle, 
  DotsThree,
  MapPin,
  Calendar
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { AdminOverviewResponse, getAdminOverview } from "@/lib/admin";
import { motion } from "framer-motion";
import { containerVariants, formatDate } from "@/components/admin/type";
import StatCard from "@/components/admin/StartCartd";
import BentoCard from "@/components/admin/BentoCard";
import StatBar from "@/components/admin/StatBar";
import ErrorMesage from "@/components/admin/ErrorMesage";


function roleLabel(role: string) {
  const labels: Record<string, string> = {
    customer: "Khách hàng",
    restaurant: "Chủ nhà hàng",
    admin: "Admin",
  };
  return labels[role] ?? role;
}



// --- Main Page ---

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

  if (errorMessage) {
    return <ErrorMesage errorMessage={errorMessage} />;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      {/* Header Section */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="flex size-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,107,0,0.5)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Live Dashboard</p>
          </motion.div>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-stone-900 md:text-6xl">Thống kê hệ thống</h1>
          <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-slate-400">
            Quản trị viên có thể theo dõi sự phát triển của người dùng và hiệu quả kinh doanh của các nhà hàng trong thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:text-stone-900">
            <Calendar size={20} weight="bold" />
          </button>
          <button className="flex h-12 items-center gap-3 rounded-2xl bg-stone-900 px-6 text-sm font-black text-white shadow-xl shadow-slate-200 transition-transform active:scale-95">
            Xuất báo cáo
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" />
          ))}
          <div className="md:col-span-2 h-96 animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" />
          <div className="md:col-span-2 h-96 animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" />
        </div>
      ) : !overview ? (
        <BentoCard className="flex h-96 flex-col items-center justify-center text-center">
          <div className="grid size-20 place-items-center rounded-3xl bg-slate-50 text-slate-200">
            <DotsThree size={48} weight="bold" />
          </div>
          <h2 className="mt-6 text-2xl font-black tracking-tight text-stone-900">Chưa có dữ liệu</h2>
          <p className="mt-2 text-slate-400 font-bold">Hãy quay lại sau khi hệ thống có hoạt động mới.</p>
        </BentoCard>
      ) : (
        <>
          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard 
              label="Tổng người dùng" 
              value={overview.summary.totalUsers} 
              note={`${overview.summary.activeUserCount} active`} 
              icon={Users} 
              colorClass="bg-orange-500 text-white" 
            />
            <StatCard 
              label="Chủ nhà hàng" 
              value={overview.summary.restaurantOwnerCount} 
              note={`${overview.summary.customerCount} khách hàng`} 
              icon={Buildings} 
              colorClass="bg-sky-500 text-white" 
            />
            <StatCard 
              label="Tổng nhà hàng" 
              value={overview.summary.totalRestaurants} 
              note={`${overview.summary.openRestaurantCount} đang mở`} 
              icon={Storefront} 
              colorClass="bg-[#ff6b00] text-white" 
            />
            <StatCard 
              label="Rating trung bình" 
              value={overview.summary.averageRestaurantRating} 
              note="Dựa trên tất cả review" 
              icon={TrendUp} 
              colorClass="bg-amber-500 text-white" 
            />
          </div>

          {/* Bento Distribution Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <BentoCard 
              className="lg:col-span-7"
              title="Phân bố người dùng"
              subtitle="Chi tiết theo vai trò và trạng thái"
              icon={Users}
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-6">
                    {overview.usersByRole.map((item) => (
                      <StatBar key={item.role} label={roleLabel(item.role)} value={item.count} max={maxRoleCount} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {overview.usersByStatus.map((item) => (
                      <div key={item.status} className="flex flex-col justify-center rounded-[2rem] bg-slate-50 p-6 transition-colors hover:bg-orange-50/50">
                        <p className="font-mono text-3xl font-black text-stone-900">{item.count}</p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard 
              className="lg:col-span-5"
              title="Trạng thái nhà hàng"
              subtitle="Hoạt động trên hệ thống"
              icon={Storefront}
            >
              <div className="space-y-8">
                {overview.restaurantsByStatus.map((item) => (
                  <StatBar 
                    key={item.status} 
                    label={item.label} 
                    value={item.count} 
                    max={maxStatusCount} 
                    color={item.status === "open" ? "bg-orange-500" : "bg-slate-300"} 
                  />
                ))}
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Thành phố</p>
                    <div className="space-y-3">
                      {overview.topCities.slice(0, 3).map((item) => (
                        <div key={item.city} className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">{item.city}</span>
                          <span className="font-mono text-xs font-black text-stone-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Loại món</p>
                    <div className="space-y-3">
                      {overview.topCuisines.slice(0, 3).map((item) => (
                        <div key={item.cuisine} className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">{item.cuisine}</span>
                          <span className="font-mono text-xs font-black text-stone-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Activity Feeds */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BentoCard title="Người dùng mới" icon={Users}>
              <div className="divide-y divide-slate-100">
                {overview.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-5 first:pt-0 last:pb-0 group/item">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-slate-100 grid place-items-center font-black text-slate-400 text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-stone-900 group-hover/item:text-orange-600 transition-colors">{user.username}</p>
                        <p className="mt-1 truncate text-xs font-bold text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                        {roleLabel(user.role)}
                      </span>
                      <p className="text-[9px] font-bold text-slate-300">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard title="Nhà hàng mới" icon={Storefront}>
              <div className="divide-y divide-slate-100">
                {overview.recentRestaurants.map((res) => (
                  <Link 
                    key={res.id} 
                    href={`/restaurants/${res.id}`}
                    className="flex items-center justify-between py-5 first:pt-0 last:pb-0 group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-2xl bg-orange-50 grid place-items-center text-orange-500 transition-transform group-hover/item:scale-110">
                        <Storefront size={20} weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-stone-900 group-hover/item:text-orange-600 transition-colors">{res.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <MapPin size={10} className="text-slate-300" />
                          <p className="truncate text-[10px] font-bold text-slate-400">{res.city} • {res.cuisine}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ring-1 ${res.isOpen ? 'bg-orange-50 text-orange-700 ring-orange-100' : 'bg-slate-50 text-slate-500 ring-slate-100'}`}>
                        {res.isOpen ? 'Đang mở' : 'Tạm nghỉ'}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendUp size={10} className="text-amber-500" />
                        <p className="text-[10px] font-black text-stone-900">{res.ratingAverage.toFixed(1)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </BentoCard>
          </div>
        </>
      )}
    </motion.div>
  );
}
