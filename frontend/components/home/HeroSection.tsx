"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { MapPin, MagnifyingGlass, Star, ArrowRight } from "@phosphor-icons/react";

const perks = [
  { value: "18 phút", label: "quán nhanh nhất", color: "bg-orange-50" },
  { value: "4.82", label: "điểm hài lòng", color: "bg-orange-50" },
  { value: "Giao HCM", label: "khu vực phục vụ", color: "bg-orange-50" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = query.trim();
    router.push(search ? "/menu?search=" + encodeURIComponent(search) : "/menu");
  }

  return (
    <section className="relative overflow-hidden bg-[#fff7ed] pb-12 pt-16 lg:pb-24 lg:pt-20">
      <div className="pointer-events-none absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-orange-200/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[600px] w-[600px] rounded-full bg-orange-100/40 blur-[140px]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10"
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative z-10 flex flex-col gap-10">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-orange-200/60 bg-white/60 px-5 py-2.5 text-sm font-bold text-[#a04100] shadow-[0_12px_30px_-10px_rgba(255,107,0,0.15)] backdrop-blur-md">
                <MapPin size={20} weight="fill" className="text-[#ff6b00]" />
                Giao nhanh tại TP. Hồ Chí Minh
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-6xl font-black leading-[0.9] tracking-tighter text-[#23140c] sm:text-7xl lg:text-8xl">
                Đói là đặt. <br />
                <span className="text-[#ff6b00]">Món ngon</span> tới ngay.
              </h1>
              <p className="max-w-[50ch] text-xl font-medium leading-relaxed text-[#704322]/80">
                Khám phá quán đang mở gần bạn, xem thời gian giao thực tế và trải nghiệm ẩm thực đỉnh cao chỉ trong vài giây.
              </p>
            </motion.div>

            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="relative flex max-w-2xl items-center gap-3 rounded-[2.5rem] bg-white p-2.5 shadow-[0_32px_64px_-24px_rgba(35,20,12,0.12)] ring-1 ring-[#23140c]/5"
            >
              <div className="flex h-16 flex-1 items-center gap-4 rounded-[1.8rem] bg-[#fff7ed]/50 px-6 text-[#a04100]">
                <MagnifyingGlass size={24} weight="bold" className="opacity-60" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Bạn muốn ăn gì hôm nay?"
                  className="w-full bg-transparent text-lg font-semibold text-[#23140c] outline-none placeholder:text-[#a36b3f]/60"
                />
              </div>
              <button
                type="submit"
                className="group flex h-16 items-center gap-3 rounded-[1.8rem] bg-[#ff6b00] px-8 text-lg font-black text-white shadow-[0_16px_32px_-12px_rgba(255,107,0,0.5)] transition-all hover:bg-[#e45f00] active:scale-[0.97]"
              >
                Tìm món
                <ArrowRight size={20} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.form>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 sm:max-w-xl">
              {perks.map((perk) => (
                <div
                  key={perk.label}
                  className={`rounded-4xl ${perk.color} p-5 ring-1 ring-black/5`}
                >
                  <p className="text-2xl font-black tracking-tight text-[#ff6b00]">{perk.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#704322]/60">{perk.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="relative grid aspect-4/5 w-full grid-cols-2 grid-rows-2 gap-4"
          >
            <div className="relative col-span-2 row-span-1 overflow-hidden rounded-[3rem] bg-[#ff6b00] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000"
                alt="Món ăn giao nhanh"
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80">Đặc sản tuần này</p>
                  <h3 className="mt-1 text-3xl font-black">Cơm gà sốt tiêu</h3>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-md">
                  <Star size={20} weight="fill" className="text-yellow-400" />
                  <span className="font-black">4.9</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[3rem] p-8 shadow-xl ring-1 ring-black/5">
              <Image
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600"
                alt="Pizza"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#23140c]/25" />
              <div className="relative flex h-full flex-col justify-end text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Gợi ý hôm nay</p>
                <h4 className="mt-1 text-2xl font-black">Pizza nóng giòn</h4>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[3rem] bg-[#23140c] shadow-xl">
              <Image
                src="https://www.lalamove.com/hubfs/Sub%20banner_driver_dhaka%201.jpg"
                alt="Giao hàng"
                fill
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Giao nhanh</p>
                <h4 className="text-2xl font-black">Ship tận nơi</h4>
                <p className="text-xs font-medium">Tài xế gần bạn nhận đơn</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
