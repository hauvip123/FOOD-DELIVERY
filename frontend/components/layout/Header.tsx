"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, ShoppingCart, List, SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessManage } from "@/lib/auth";
import { useCart } from "@/contexts/CartContext";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Nhà hàng", href: "/restaurants" },
    { name: "Ưu đãi", href: "/deals" },
    { name: "Đơn hàng", href: "/orders" },
  ];

  if (canAccessManage(user?.role)) {
    navLinks.push({ name: "Quản lý", href: "/manage" });
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 px-4 py-4 sm:px-6 lg:px-10"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-4xl border border-white/20 bg-white/70 px-6 py-4 shadow-[0_20px_40px_-15px_rgba(35,20,12,0.1)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#ff6b00] shadow-[0_10px_20px_-5px_rgba(255,107,0,0.5)] transition-transform group-hover:scale-110">
            <span className="text-xl font-black text-white italic">HD</span>
          </div>
          <span className="hidden text-xl font-black tracking-tighter text-[#23140c] sm:block">HungerDash</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:gap-4 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const linkClassName = "relative px-4 py-2 text-sm font-black transition-colors " + (isActive ? "text-[#ff6b00]" : "text-[#704322]/70 hover:text-[#ff6b00]");
            return (
              <Link key={link.name} href={link.href} className={linkClassName}>
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-orange-100"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative grid size-12 place-items-center rounded-2xl bg-orange-50 text-[#ff6b00] transition-all hover:bg-[#ff6b00] hover:text-white active:scale-95"
          >
            <ShoppingCart size={24} weight="bold" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 10 }}
                  key={totalItems}
                  className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#23140c] px-1 text-[10px] font-black text-white shadow-lg"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {isAuthenticated ? (
            <div className="relative group">
              <motion.div
                className="flex h-12 items-center gap-2 rounded-2xl bg-[#23140c] px-4 text-sm font-black text-white shadow-lg transition-all hover:bg-[#ff6b00] active:scale-95 cursor-pointer"
              >
                <User size={20} weight="bold" />
                <span className="hidden max-w-28 truncate sm:inline">{user?.username}</span>
              </motion.div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="w-48 overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#23140c] transition-colors hover:bg-orange-50 hover:text-[#ff6b00]"
                  >
                    <User size={18} weight="bold" />
                    Tài khoản
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <SignOut size={18} weight="bold" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className={"flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-black transition-all active:scale-95 " + (pathname === "/login" ? "bg-[#ff6b00] text-white shadow-[0_10px_20px_-5px_rgba(255,107,0,0.4)]" : "bg-[#23140c] text-white shadow-lg hover:bg-[#ff6b00]")}
            >
              <User size={20} weight="bold" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}

          <button className="grid size-12 place-items-center rounded-2xl border border-black/5 md:hidden">
            <List size={24} weight="bold" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
