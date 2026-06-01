"use client";

import { useAuth } from "@/contexts/AuthContext";
import { 
  ChartLineUp, 
  Storefront, 
  Users, 
  Handbag,
  TrendUp,
  ClockCounterClockwise
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function ManageDashboard() {
  const { user } = useAuth();

  const stats = [
    { name: "Tổng doanh thu", value: "12,450k", trend: "+12%", icon: ChartLineUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Đơn hàng mới", value: "24", trend: "+5", icon: Handbag, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Khách hàng", value: "156", trend: "+18%", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Đánh giá", value: "4.8", trend: "0.2", icon: TrendUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-[#23140c]">Chào buổi sáng, {user?.username}! 👋</h1>
        <p className="mt-2 text-lg font-medium text-[#23140c]/50">Đây là những gì đang diễn ra với các nhà hàng của bạn hôm nay.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-black/5"
          >
            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[1.25rem] ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} weight="bold" />
            </div>
            <p className="text-sm font-bold text-[#23140c]/40 uppercase tracking-widest">{stat.name}</p>
            <div className="mt-2 flex items-baseline gap-3">
              <h3 className="text-3xl font-black text-[#23140c]">{stat.value}</h3>
              <span className={`text-xs font-black ${stat.color}`}>{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#23140c]">Đơn hàng gần đây</h2>
            <button className="text-sm font-black text-orange-500 hover:text-orange-600">Xem tất cả</button>
          </div>
          <div className="rounded-[2.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 rounded-full bg-orange-50 p-6 text-orange-200">
                <ClockCounterClockwise size={48} weight="bold" />
              </div>
              <h3 className="text-xl font-black text-[#23140c]">Chưa có đơn hàng nào</h3>
              <p className="mt-2 text-[#23140c]/40">Các đơn hàng mới sẽ xuất hiện tại đây.</p>
            </div>
          </div>
        </div>

        {/* Top Restaurants Placeholder */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#23140c]">Nhà hàng nổi bật</h2>
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-black/5">
             <div className="flex flex-col gap-6">
               <div className="flex items-center justify-between border-b border-[#23140c]/5 pb-6">
                 <p className="font-bold text-[#23140c]/40 uppercase tracking-widest text-[10px]">Tên quán</p>
                 <p className="font-bold text-[#23140c]/40 uppercase tracking-widest text-[10px]">Doanh thu</p>
               </div>
               <p className="text-center py-10 text-sm font-medium text-[#23140c]/40 italic">Chưa có dữ liệu thống kê.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
