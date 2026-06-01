"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Truck,
  MapPin,
  ArrowLeft,
  Info,
  Plus,
  Minus,
  Heart,
  MagnifyingGlass,
  ShareNetwork,
} from "@phosphor-icons/react";
import { useCart } from "@/contexts/CartContext";

const MOCK_RESTAURANT = {
  id: 1,
  name: "Bếp Nắng Sài Gòn",
  cuisine: "Cơm nhà, món kho, canh nóng",
  rating: "4.8",
  reviews: "1,240",
  time: "25-35",
  delivery: "Miễn phí",
  distance: "1.8 km",
  isOpen: true,
  image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1400",
  description: "Mang hương vị cơm nhà thuần túy vào từng bữa ăn hiện đại. Chúng tôi chọn lọc những nguyên liệu tươi ngon nhất từ các chợ truyền thống để mang đến những món kho đậm đà, những bát canh nóng hổi cho thực khách.",
  categories: ["Món Chính", "Món Kho", "Canh & Rau", "Nước Giải Khát", "Tráng Miệng"],
  menu: [
    {
      id: 101,
      category: "Món Chính",
      name: "Cơm Sườn Non Kho Tộ",
      description: "Sườn non heo rim kỹ với nước mắm ngon, tiêu sọ và hành lá. Ăn kèm cơm trắng dẻo và dưa chua.",
      price: 65000,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
      popular: true,
    },
    {
      id: 102,
      category: "Món Chính",
      name: "Cơm Gà Luộc Chặt Miếng",
      description: "Gà ta thả vườn thịt chắc, da giòn, bóp muối tiêu chanh. Cơm nấu nước dùng gà béo ngậy.",
      price: 58000,
      image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 103,
      category: "Món Kho",
      name: "Cá Kho Tộ Miền Tây",
      description: "Cá lóc kho tộ với ba rọi heo, nước hàng tự thắng màu cánh gián, thơm nồng vị tiêu.",
      price: 75000,
      image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600",
      popular: true,
    },
    {
      id: 104,
      category: "Canh & Rau",
      name: "Canh Chua Cá Hú",
      description: "Vị chua từ me, ngọt từ cá hú tươi, thơm mùi ngò gai, ngổ và bạc hà, đậu bắp.",
      price: 45000,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=600",
    },
  ]
};

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeCategory, setActiveCategory] = useState("Món Chính");
  const [isFavorite, setIsFavorite] = useState(false);

  const { items, addToCart, removeFromCart } = useCart();

  const getDishQuantity = (dishId: number) => {
    return items.find(item => item.id === dishId)?.quantity || 0;
  };

  return (
    <div className="relative min-h-screen bg-[#fffcf8]">
      {/* Hero Section */}
      <section className="relative h-[450px] w-full overflow-hidden">
        <Image
          src={MOCK_RESTAURANT.image}
          alt={MOCK_RESTAURANT.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#23140c] via-[#23140c]/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white"
          >
            <ArrowLeft size={18} weight="bold" />
            Trở về
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                  {MOCK_RESTAURANT.isOpen ? "Đang hoạt động" : "Tạm nghỉ"}
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-orange-400">
                  <Star size={18} weight="fill" />
                  <span className="text-white">{MOCK_RESTAURANT.rating}</span>
                  <span className="text-white/60">({MOCK_RESTAURANT.reviews} đánh giá)</span>
                </div>
              </div>

              <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl">
                {MOCK_RESTAURANT.name}
              </h1>

              <p className="max-w-2xl text-lg font-medium text-white/70">
                {MOCK_RESTAURANT.cuisine} • {MOCK_RESTAURANT.description}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex size-14 items-center justify-center rounded-2xl transition-all active:scale-90 ${isFavorite ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                <Heart size={28} weight={isFavorite ? "fill" : "bold"} />
              </button>
              <button className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90">
                <ShareNetwork size={28} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="mx-auto max-w-[1400px] -translate-y-1/2 px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-4 rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-black/5 md:grid-cols-4">
          <div className="flex items-center gap-4 px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Clock size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Thời gian</p>
              <p className="text-sm font-black text-[#23140c]">{MOCK_RESTAURANT.time} phút</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-[#23140c]/5 px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <Truck size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Giao hàng</p>
              <p className="text-sm font-black text-[#23140c]">{MOCK_RESTAURANT.delivery}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-[#23140c]/5 px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <MapPin size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Khoảng cách</p>
              <p className="text-sm font-black text-[#23140c]">{MOCK_RESTAURANT.distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-[#23140c]/5 px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Info size={24} weight="bold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#23140c]/40">Thông tin</p>
              <p className="text-sm font-black text-[#23140c]">Xem chi tiết</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Categories Sidebar */}
          <aside className="w-full lg:sticky lg:top-28 lg:h-fit lg:w-64">
            <div className="flex flex-col gap-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#23140c]">Thực đơn</h3>
                <MagnifyingGlass size={20} className="text-[#23140c]/40" />
              </div>
              <div className="flex flex-row gap-2 overflow-x-auto pb-4 scrollbar-hide lg:flex-col lg:overflow-visible">
                {MOCK_RESTAURANT.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap rounded-2xl px-5 py-3.5 text-sm font-black transition-all ${activeCategory === cat
                      ? "bg-[#23140c] text-white shadow-lg shadow-[#23140c]/10"
                      : "bg-white text-[#23140c]/60 hover:bg-[#23140c]/5"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Menu Items Grid */}
          <div className="flex-1 space-y-12">
            <div>
              <div className="mb-8 flex items-end justify-between">
                <h2 className="text-3xl font-black tracking-tight text-[#23140c]">{activeCategory}</h2>
                <span className="text-sm font-bold text-[#23140c]/40">
                  {MOCK_RESTAURANT.menu.filter(item => item.category === activeCategory).length} món
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {MOCK_RESTAURANT.menu
                  .filter(item => item.category === activeCategory)
                  .map((dish, idx) => {
                    const quantity = getDishQuantity(dish.id);
                    return (
                      <motion.div
                        key={dish.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group flex gap-4 rounded-[2rem] bg-white p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] ring-1 ring-black/5 transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]"
                      >
                        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
                          <Image
                            src={dish.image}
                            alt={dish.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {dish.popular && (
                            <div className="absolute right-1 top-1 rounded-full bg-orange-500 p-1 text-white shadow-lg">
                              <Star size={12} weight="fill" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <h4 className="font-black leading-tight text-[#23140c]">{dish.name}</h4>
                              <p className="text-sm font-black text-orange-500">{(dish.price / 1000).toFixed(0)}k</p>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-[#23140c]/50">
                              {dish.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-end">
                            {quantity > 0 ? (
                              <div className="flex items-center gap-3 rounded-xl bg-[#23140c] p-1 shadow-lg">
                                <button
                                  onClick={() => removeFromCart(dish.id)}
                                  className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                                >
                                  <Minus size={14} weight="bold" />
                                </button>
                                <span className="min-w-[1ch] text-center text-sm font-black text-white">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => addToCart({
                                    id: dish.id,
                                    name: dish.name,
                                    price: dish.price,
                                    restaurantId: MOCK_RESTAURANT.id,
                                    restaurantName: MOCK_RESTAURANT.name,
                                    image: dish.image
                                  })}
                                  className="flex size-7 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600"
                                >
                                  <Plus size={14} weight="bold" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart({
                                  id: dish.id,
                                  name: dish.name,
                                  price: dish.price,
                                  restaurantId: MOCK_RESTAURANT.id,
                                  restaurantName: MOCK_RESTAURANT.name,
                                  image: dish.image
                                })}
                                className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white active:scale-90"
                              >
                                <Plus size={20} weight="bold" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
