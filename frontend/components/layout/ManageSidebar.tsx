"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Storefront, 
  ListChecks, 
  ChartPieSlice, 
  User, 
  SignOut,
  CaretLeft,
  House,
  Buildings,
  CookingPot
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export function ManageSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Tổng quan", href: "/manage", icon: ChartPieSlice },
    { name: "Nhà hàng của tôi", href: "/manage/restaurants", icon: Buildings },
    { name: "Đơn hàng", href: "/manage/orders", icon: ListChecks },
    { name: "Thực đơn", href: "/manage/menu", icon: CookingPot },
    { name: "Tài khoản", href: "/manage/account", icon: User },
  ];

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 flex h-full w-72 flex-col bg-[#23140c] text-white shadow-2xl">
      <div className="flex h-24 items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="grid size-10 place-items-center rounded-xl bg-orange-500 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-lg font-black text-white italic">HD</span>
          </div>
          <span className="text-lg font-black tracking-tighter">Owner Panel</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/manage" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all ${
                isActive 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={22} weight={isActive ? "fill" : "bold"} />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-3xl bg-white/5 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <User size={20} weight="bold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black">{user?.username}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-widest text-white/30">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-black text-white transition-all hover:bg-red-500/20 hover:text-red-400"
          >
            <SignOut size={16} weight="bold" />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
