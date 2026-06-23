"use client";
import { useEffect, useState, useMemo } from "react";
import { 
  Storefront, 
  MagnifyingGlass, 
  Funnel, 
  DotsThreeVertical, 
  MapPin, 
  ForkKnife, 
  Star,
  Calendar,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminRestaurants, AdminRestaurant } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import RestaurantStatusBadge from "@/components/admin/RestaurantStatusBadge";
import Skeleton from "@/components/admin/Skeleton";
import ErrorMesage from "@/components/admin/ErrorMesage";
import { formatDate, listContainerVariants, listItemVariants } from "@/components/admin/type";

// --- Sub-components ---

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function loadRestaurants() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await getAdminRestaurants();
        setRestaurants(data);
      } catch (error) {
        setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải danh sách nhà hàng.");
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurants();
  }, []);

  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(restaurants.map((r) => r.city)));
    return uniqueCities.sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((res) => {
      const matchesSearch = 
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = cityFilter === "all" || res.city === cityFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "open" ? res.isOpen : !res.isOpen);
      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [restaurants, searchQuery, cityFilter, statusFilter]);

  if (errorMessage) {
    return <ErrorMesage errorMessage={errorMessage} />;
  }
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={listContainerVariants}
      className="space-y-8 pb-20"
    >
      {/* Header Section */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="flex size-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,107,0,0.5)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Hệ thống</p>
          </motion.div>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-stone-900">Nhà hàng</h1>
          <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-slate-400">
            Quản lý tất cả các đối tác nhà hàng, theo dõi trạng thái hoạt động và đánh giá từ khách hàng.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên, loại món..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-[1.5rem] border border-slate-200 bg-white pl-12 pr-6 text-sm font-bold text-stone-900 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 md:w-80"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="appearance-none h-14 rounded-[1.5rem] border border-slate-200 bg-white pl-12 pr-10 text-sm font-black text-stone-900 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 cursor-pointer"
              >
                <option value="all">Thành phố</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-14 rounded-[1.5rem] border border-slate-200 bg-white pl-12 pr-10 text-sm font-black text-stone-900 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 cursor-pointer"
              >
                <option value="all">Trạng thái</option>
                <option value="open">Đang mở</option>
                <option value="closed">Tạm nghỉ</option>
              </select>
              <Funnel className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      {/* Restaurants List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <Skeleton />
        ) : filteredRestaurants.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50 text-center">
            <div className="grid size-20 place-items-center rounded-3xl bg-slate-100 text-slate-300">
              <Storefront size={48} weight="bold" />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-stone-900">Không tìm thấy nhà hàng</h2>
            <p className="mt-2 text-slate-400 font-bold">Hãy thử tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRestaurants.map((res) => (
              <motion.div
                key={res.id}
                layout
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col items-start gap-4 rounded-[2.5rem] border border-slate-200/60 bg-white p-6 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_25px_50px_-20px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:gap-8"
              >
                {/* Image Placeholder / Actual Image */}
                <div className="relative shrink-0">
                  <div className="size-24 rounded-[2rem] bg-orange-50 grid place-items-center text-orange-200 overflow-hidden ring-4 ring-slate-50 transition-transform group-hover:scale-105">
                    {res.imageUrl ? (
                      <img src={res.imageUrl} alt={res.name} className="size-full object-cover" />
                    ) : (
                      <Storefront size={48} weight="fill" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 size-6 rounded-full border-4 border-white shadow-sm ${res.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>

                {/* Info Main */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="truncate text-xl font-black tracking-tight text-stone-900 group-hover:text-orange-600 transition-colors">
                      {res.name}
                    </h3>
                    <RestaurantStatusBadge isOpen={res.isOpen} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <MapPin size={16} weight="bold" className="text-orange-500" />
                      {res.city} • {res.address}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <ForkKnife size={16} weight="bold" className="text-orange-500" />
                      {res.cuisine}
                    </div>
                    {res.owner && (
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1 ring-1 ring-slate-100">
                        <div className="size-4 rounded-full bg-orange-100 grid place-items-center text-[8px] font-black text-orange-600">
                          {res.owner.username.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[10px] font-bold text-slate-500">
                          <span className="text-slate-900">{res.owner.username}</span> 
                          <span className="mx-1.5 text-slate-300">•</span>
                          Sở hữu <span className="font-black text-orange-600">{res.ownerRestaurantsCount}</span> quán
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          weight={i < Math.floor(res.ratingAverage) ? "fill" : "bold"} 
                          className={i < Math.floor(res.ratingAverage) ? "text-amber-400" : "text-slate-200"} 
                        />
                      ))}
                      <span className="ml-2 font-mono text-sm font-black text-stone-900">{res.ratingAverage.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                      <Calendar size={14} weight="bold" />
                      Tham gia {formatDate(res.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex w-full items-center justify-between border-t border-slate-50 pt-4 md:w-auto md:flex-row md:border-t-0 md:pt-0">
                  <button className="flex items-center gap-2 rounded-2xl bg-slate-50 px-5 py-3 text-xs font-black text-stone-900 transition-all hover:bg-orange-500 hover:text-white active:scale-95">
                    Chi tiết
                  </button>
                  <button className="grid size-10 place-items-center rounded-2xl text-slate-300 transition-all hover:bg-slate-50 hover:text-stone-900 md:ml-2">
                    <DotsThreeVertical size={24} weight="bold" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
