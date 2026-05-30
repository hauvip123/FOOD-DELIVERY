"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Fire, ShoppingCartSimple } from "@phosphor-icons/react";

const popularDishes = [
  {
    name: "Cơm gà sốt tiêu đen",
    restaurant: "Bếp Nắng Sài Gòn",
    price: "68k",
    sold: "1.2k",
    description: "Đùi gà chiên giòn rưới sốt tiêu đen đậm đà, kèm cơm dẻo.",
    badge: "Bán chạy",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Mì bò sa tế trứng",
    restaurant: "Mì Lửa Chợ Lớn",
    price: "82k",
    sold: "850",
    description: "Mì tươi cán tay, bò bắp mềm mại, trứng lòng đào béo ngậy.",
    badge: "Cay",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Bowl cá hồi áp chảo",
    restaurant: "Green Bowl Lab",
    price: "118k",
    sold: "420",
    description: "Cá hồi Na Uy áp chảo, hạt quinoa, bơ sáp và rau mầm.",
    badge: "Healthy",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Trà đào cam sả lạnh",
    restaurant: "Tiệm Nước Mơ",
    price: "42k",
    sold: "2.5k",
    description: "Trà đen ủ lạnh, đào miếng giòn, hương sả tươi mát.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Pizza Hải Sản Phô Mai",
    restaurant: "The Pizza Hub",
    price: "159k",
    sold: "1.1k",
    description: "Tôm, mực tươi, phô mai Mozzarella kéo sợi thơm lừng.",
    badge: "Flash Sale",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Bánh Mì Chảo Đặc Biệt",
    restaurant: "Bếp Cô Ba",
    price: "55k",
    sold: "3.2k",
    description: "Pate gan, xúc xích, trứng ốp la và sốt xíu mại.",
    image: "https://images.unsplash.com/photo-1509722747041-619f383b8326?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Gà Rán Sốt Cay Hàn Quốc",
    restaurant: "K-Chicken",
    price: "89k",
    sold: "1.8k",
    description: "Gà không xương chiên xù, sốt Gochujang cay ngọt.",
    badge: "Cay",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Bún Đậu Mắm Tôm",
    restaurant: "Bún Đậu Phố Cổ",
    price: "65k",
    sold: "2.1k",
    description: "Mẹt đầy đủ: đậu chiên, chả cốm, thịt chân giò luộc.",
    image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=600",
  },
];

export function PopularDishes() {
  return (
    <section className="bg-[#23140c] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-[#ff6b00]">
            <Fire size={20} weight="fill" />
            Đang cực hot
          </div>
          <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Món ngon <span className="text-[#ff6b00]">được săn đón</span> nhất
          </h2>
          <p className="mt-6 max-w-[50ch] text-lg font-medium text-white/60">
            Dựa trên hàng ngàn đánh giá tích cực trong 24h qua. Đừng bỏ lỡ những hương vị đỉnh cao này.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {popularDishes.map((dish, idx) => (
            <motion.div
              key={dish.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              className="group relative"
            >
              {/* Image with pop-out effect */}
              <div className="relative z-10 -mb-16 aspect-square w-full overflow-hidden rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-105 group-hover:shadow-[0_40px_80px_-20px_rgba(255,107,0,0.4)]">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover"
                />
                {dish.badge && (
                  <div className="absolute left-6 top-6">
                    <span className="rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#23140c] backdrop-blur-md">
                      {dish.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Card */}
              <div className="relative rounded-[2.5rem] bg-white/5 pb-8 pt-20 px-6 ring-1 ring-white/10 backdrop-blur-xl transition-colors group-hover:bg-white/10">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-lg font-black text-white">{dish.name}</h3>
                    <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-white/40">
                      <ShoppingCartSimple size={14} weight="bold" />
                      {dish.sold}
                    </div>
                  </div>
                  <p className="truncate text-xs font-bold uppercase tracking-widest text-white/40">{dish.restaurant}</p>
                  <p className="line-clamp-1 text-xs font-medium text-white/50">{dish.description}</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-black text-[#ff6b00]">{dish.price}</span>
                  <button className="flex size-12 items-center justify-center rounded-2xl bg-[#ff6b00] text-white shadow-lg transition-all hover:bg-[#e45f00] hover:shadow-[0_10px_20px_-5px_rgba(255,107,0,0.5)] active:scale-90">
                    <Plus size={24} weight="bold" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
