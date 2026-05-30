"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { User, ShoppingBag, List } from "@phosphor-icons/react";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Nhà hàng", href: "/restaurants" },
    { name: "Ưu đãi", href: "/deals" },
    { name: "Đơn hàng", href: "/orders" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 px-4 py-4 sm:px-6 lg:px-10"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-[2rem] border border-white/20 bg-white/70 px-6 py-4 shadow-[0_20px_40px_-15px_rgba(35,20,12,0.1)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#ff6b00] shadow-[0_10px_20px_-5px_rgba(255,107,0,0.5)] transition-transform group-hover:scale-110">
            <span className="text-xl font-black text-white italic">HD</span>
          </div>
          <span className="hidden text-xl font-black tracking-tighter text-[#23140c] sm:block">HungerDash</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:gap-4 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-black transition-colors ${isActive ? "text-[#ff6b00]" : "text-[#704322]/70 hover:text-[#ff6b00]"
                  }`}
              >
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
            className="relative grid size-12 place-items-center rounded-2xl bg-orange-50 text-[#ff6b00] transition-all hover:bg-orange-100 hover:scale-110 active:scale-95"
          >
            <ShoppingBag size={24} weight="bold" />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#23140c] text-[10px] font-black text-white">2</span>
          </Link>

          <Link
            href="/login"
            className={`flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-black transition-all active:scale-95 ${pathname === "/login"
              ? "bg-[#ff6b00] text-white shadow-[0_10px_20px_-5px_rgba(255,107,0,0.4)]"
              : "bg-[#23140c] text-white shadow-lg hover:bg-[#ff6b00]"
              }`}
          >
            <User size={20} weight="bold" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </Link>

          <button className="grid size-12 place-items-center rounded-2xl border border-black/5 md:hidden">
            <List size={24} weight="bold" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}


