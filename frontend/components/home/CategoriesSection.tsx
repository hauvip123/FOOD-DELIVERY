"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const categories = [
  { name: "Cơm nhà", image: "https://images.unsplash.com/photo-1512058560366-cd2427ff064f?auto=format&fit=crop&q=80&w=200", active: true },
  { name: "Mì & Bún", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=200" },
  { name: "Gà rán", image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=200" },
  { name: "Healthy", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200" },
  { name: "Cà phê", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200" },
  { name: "Tráng miệng", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=200" },
  { name: "Ăn vặt", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=200" },
];

export function CategoriesSection() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-tight text-[#23140c]">Khám phá theo danh mục</h2>
          <div className="h-px flex-1 bg-orange-100 ml-8 hidden md:block" />
        </div>

        <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
          {categories.map((category, idx) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 + 0.5 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="group flex shrink-0 flex-col items-center gap-4"
            >
              <div
                className={`relative size-24 overflow-hidden rounded-4xl p-1.5 transition-all duration-300 group-hover:shadow-[0_20px_40px_-10px_rgba(255,107,0,0.3)] ${category.active
                  ? "bg-[#ff6b00] shadow-[0_15px_30px_-10px_rgba(255,107,0,0.4)]"
                  : "bg-orange-50 group-hover:bg-orange-100"
                  }`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-white">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </div>
              </div>
              <span className={`text-sm font-black tracking-tight transition-colors ${category.active ? "text-[#ff6b00]" : "text-[#704322]"
                }`}>
                {category.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
