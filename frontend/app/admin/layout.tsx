"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChartPieSlice, House, Storefront, Users, CaretRight, SignOut, ShieldCheck } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const sidebarLinks = [
  { href: "/admin", label: "Tổng quan", icon: ChartPieSlice },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/restaurants", label: "Nhà hàng", icon: Storefront },
];

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-[100dvh] bg-[#f9fafb] font-sans selection:bg-orange-100 selection:text-orange-900">
        {/* Modern Floating Sidebar */}
        <aside className="fixed inset-y-4 left-4 z-40 hidden w-72 flex-col md:flex">
          <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] backdrop-blur-xl">
            {/* Logo Section */}
            <div className="flex h-28 items-center px-8">
              <Link href="/admin" className="group flex items-center gap-4">
                <div className="relative grid size-12 place-items-center rounded-2xl bg-[#ff6b00] text-lg font-black text-white shadow-[0_8px_16px_-4px_rgba(255,107,0,0.4)] transition-transform group-hover:scale-110 group-active:scale-95">
                  HD
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div>
                  <p className="text-xl font-black tracking-tight text-[#1c1917]">HungerDash</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Console</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 pt-4">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300 ${
                      isActive 
                        ? "bg-orange-50 text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-orange-600" : ""}`}>
                        <Icon size={22} weight={isActive ? "fill" : "bold"} />
                      </div>
                      <span className={`text-sm tracking-tight ${isActive ? "font-black" : "font-bold"}`}>
                        {link.label}
                      </span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="active-pill" className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,107,0,0.5)]" />
                    )}
                    {!isActive && (
                      <CaretRight size={14} className="opacity-0 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-3 border-t border-slate-100 p-6">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                    <ShieldCheck size={20} weight="bold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[#1c1917]">{user?.username ?? "Admin"}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quản trị hệ thống</p>
                  </div>
                </div>
              </div>
              <Link 
                href="/" 
                className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-slate-950 py-4 text-xs font-black text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
              >
                <House size={18} weight="bold" />
                Về trang chủ
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-red-100 bg-red-50 py-4 text-xs font-black text-red-600 transition-all hover:-translate-y-1 hover:border-red-200 hover:bg-red-100 active:scale-[0.98]"
              >
                <SignOut size={18} weight="bold" />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 md:pl-[19.5rem] md:pr-8 md:py-8">
          <div className="mb-4 flex items-center justify-between rounded-[1.5rem] border border-slate-200/60 bg-white p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)] md:hidden">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-[#ff6b00] text-sm font-black text-white shadow-[0_8px_16px_-4px_rgba(255,107,0,0.4)]">
                HD
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-[#1c1917]">HungerDash</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Admin Console</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Đăng xuất"
              className="grid size-10 place-items-center rounded-2xl bg-red-50 text-red-600 transition-all active:scale-95"
            >
              <SignOut size={18} weight="bold" />
            </button>
          </div>
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
