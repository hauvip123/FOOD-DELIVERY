"use client";

import { useCallback, useEffect, useState, use } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Star,
  Plus,
  PencilSimple,
  Trash,
  CookingPot,
  Tag,
  CurrencyCircleDollar,
  Note,
  Image as ImageIcon
} from "@phosphor-icons/react";
import Link from "next/link";
import { getRestaurantById, RestaurantResponse } from "@/lib/restaurant";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  CategoryResponse
} from "@/lib/category";
import {
  getDishesByRestaurantId,
  createDish,
  deleteDish,
  updateDish,
  DishResponse
} from "@/lib/dish";

const FALLBACK_RESTAURANT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop";
const FALLBACK_DISH_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";

function getImageSrc(src: string | undefined, fallback: string) {
  const trimmedSrc = src?.trim();

  if (!trimmedSrc || trimmedSrc.includes("example.com")) {
    return fallback;
  }

  return trimmedSrc;
}

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = use(params);
  const restaurantId = Number(id);
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [editingDish, setEditingDish] = useState<DishResponse | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [dishForm, setDishForm] = useState({
    name: "",
    price: 0,
    categoryId: 0,
    description: "",
    image: ""
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resData, catsData, dishesData] = await Promise.all([
        getRestaurantById(restaurantId),
        getAllCategories(),
        getDishesByRestaurantId(restaurantId)
      ]);
      setRestaurant(resData);
      setCategories(catsData.filter((category) => category.restaurantId === restaurantId));
      setDishes(dishesData);
    } catch (err) {
      console.error("Failed to fetch restaurant detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName);
      } else {
        await createCategory({ restaurantId, name: categoryName });
      }
      setIsCategoryModalOpen(false);
      setCategoryName("");
      setEditingCategory(null);
      fetchData();
    } catch {
      alert("Lỗi khi xử lý danh mục.");
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này? Tất cả món ăn thuộc danh mục sẽ bị ảnh hưởng.")) return;
    try {
      await deleteCategory(catId);
      fetchData();
    } catch {
      alert("Lỗi khi xóa danh mục.");
    }
  };

  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDish) {
        await updateDish(editingDish.id, dishForm);
      } else {
        await createDish({ ...dishForm, restaurantId });
      }
      setIsDishModalOpen(false);
      setEditingDish(null);
      setDishForm({ name: "", price: 0, categoryId: 0, description: "", image: "" });
      fetchData();
    } catch {
      alert("Lỗi khi xử lý món ăn.");
    }
  };

  const handleDeleteDish = async (dishId: number) => {
    if (!confirm("Xóa món ăn này?")) return;
    try {
      await deleteDish(dishId);
      fetchData();
    } catch {
      alert("Lỗi khi xóa món ăn.");
    }
  };

  const toggleDishAvailability = async (dish: DishResponse) => {
    try {
      await updateDish(dish.id, { isAvailable: !dish.isAvailable });
      setDishes(dishes.map(d => d.id === dish.id ? { ...d, isAvailable: !d.isAvailable } : d));
    } catch {
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!restaurant) return <div>Không tìm thấy nhà hàng.</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Info */}
      <header className="relative h-80 w-full overflow-hidden rounded-[3rem] shadow-2xl">
        <Image
          src={getImageSrc(restaurant.imgage, FALLBACK_RESTAURANT_IMAGE)}
          alt={restaurant.name}
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
          <div className="text-white">
            <Link href="/manage/restaurants" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-white transition-colors">
              <ArrowLeft size={18} weight="bold" />
              Quay lại danh sách
            </Link>
            <h1 className="text-5xl font-black tracking-tighter">{restaurant.name}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-sm font-bold text-white/80">
              <div className="flex items-center gap-2">
                <MapPin size={20} weight="fill" className="text-orange-500" />
                {restaurant.address}, {restaurant.city}
              </div>
              <div className="flex items-center gap-2">
                <CookingPot size={20} weight="fill" className="text-orange-500" />
                {restaurant.cuisine}
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} weight="fill" className="text-orange-500" />
                {restaurant.ratingAverage.toFixed(1)} Rating
              </div>
            </div>
          </div>
          <Link
            href={`/manage/restaurants/${restaurant.id}/edit`}
            className="flex h-14 items-center gap-2 rounded-2xl bg-white px-8 text-sm font-black text-[#23140c] shadow-lg transition-all hover:bg-orange-500 hover:text-white active:scale-95"
          >
            <PencilSimple size={20} weight="bold" />
            Sửa thông tin
          </Link>
        </div>
      </header>

      {/* Menu Management Section */}
      <div className="grid gap-10 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <aside className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#23140c]">Danh mục</h2>
            <button
              onClick={() => { setEditingCategory(null); setCategoryName(""); setIsCategoryModalOpen(true); }}
              className="flex size-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors"
            >
              <Plus size={20} weight="bold" />
            </button>
          </div>

          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm font-medium text-[#23140c]/40 italic">Chưa có danh mục nào.</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5 hover:ring-orange-500/20 transition-all"
                >
                  <span className="font-bold text-[#23140c]">{cat.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setIsCategoryModalOpen(true); }}
                      className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Dishes Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-[#23140c]">Thực đơn món ăn</h2>
            <button
              onClick={() => {
                if (categories.length === 0) return alert("Vui lòng tạo ít nhất một danh mục trước.");
                setEditingDish(null);
                setDishForm({ name: "", price: 0, categoryId: categories[0].id, description: "", image: "" });
                setIsDishModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-[#23140c] px-6 py-4 text-sm font-black text-white shadow-lg hover:bg-orange-500 transition-all active:scale-95"
            >
              <Plus size={20} weight="bold" />
              Thêm món ăn
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {dishes.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] ring-1 ring-black/5">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-200">
                  <CookingPot size={40} weight="bold" />
                </div>
                <h3 className="text-xl font-black text-[#23140c]">Chưa có món ăn nào</h3>
                <p className="mt-2 text-[#23140c]/40">Bắt đầu xây dựng thực đơn của bạn ngay bây giờ.</p>
              </div>
            ) : (
              dishes.map((dish) => (
                <motion.div
                  key={dish.id}
                  layout
                  className={`flex gap-5 rounded-[2.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-xl ${!dish.isAvailable ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.75rem]">
                    <Image
                      src={getImageSrc(dish.image, FALLBACK_DISH_IMAGE)}
                      alt={dish.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-lg font-black text-[#23140c]">{dish.name}</h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingDish(dish);
                              setDishForm({
                                name: dish.name,
                                price: dish.price,
                                categoryId: dish.categoryId,
                                description: dish.description ?? "",
                                image: dish.image ?? ""
                              });
                              setIsDishModalOpen(true);
                            }}
                            className="p-1.5 text-[#23140c]/40 hover:text-orange-500 transition-colors"
                          >
                            <PencilSimple size={18} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish.id)}
                            className="p-1.5 text-[#23140c]/40 hover:text-red-500 transition-colors"
                          >
                            <Trash size={18} weight="bold" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                        {categories.find(c => c.id === dish.categoryId)?.name || 'N/A'}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs font-medium text-[#23140c]/50">
                        {dish.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-[#23140c]">
                        {(dish.price / 1000).toLocaleString()}k
                      </span>
                      <button
                        onClick={() => toggleDishAvailability(dish)}
                        className={`rounded-full px-4 py-1.5 text-[10px] font-black transition-all ${dish.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                      >
                        {dish.isAvailable ? 'Đang bán' : 'Hết hàng'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-2xl"
            >
              <h3 className="text-3xl font-black tracking-tighter text-[#23140c]">
                {editingCategory ? "Sửa danh mục" : "Danh mục mới"}
              </h3>
              <form onSubmit={handleCreateCategory} className="mt-8 space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                    <Tag size={20} weight="bold" className="text-orange-500" />
                    Tên danh mục
                  </label>
                  <input
                    required
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="VD: Món chính, Tráng miệng..."
                    className="h-16 w-full rounded-2xl bg-[#fff7ed] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent focus:bg-white focus:ring-orange-500/20 transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="h-16 flex-1 rounded-2xl bg-[#f8f6f1] text-sm font-black text-[#23140c] transition-all hover:bg-black/5"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="h-16 flex-2 rounded-2xl bg-[#23140c] text-sm font-black text-white transition-all hover:bg-orange-500 active:scale-95"
                  >
                    {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dish Modal */}
      <AnimatePresence>
        {isDishModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDishModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[3rem] bg-white p-12 shadow-2xl"
            >
              <h3 className="text-4xl font-black tracking-tighter text-[#23140c]">
                {editingDish ? "Chỉnh sửa món ăn" : "Món ăn mới"}
              </h3>

              <form onSubmit={handleDishSubmit} className="mt-10 grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                    <CookingPot size={20} weight="bold" className="text-orange-500" />
                    Tên món ăn
                  </label>
                  <input
                    required
                    type="text"
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    className="h-14 w-full rounded-2xl bg-[#fff7ed] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent focus:bg-white focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                    <Tag size={20} weight="bold" className="text-orange-500" />
                    Danh mục
                  </label>
                  <select
                    required
                    value={dishForm.categoryId}
                    onChange={(e) => setDishForm({ ...dishForm, categoryId: Number(e.target.value) })}
                    className="h-14 w-full rounded-2xl bg-[#fff7ed] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent focus:bg-white focus:ring-orange-500/20"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                    <CurrencyCircleDollar size={20} weight="bold" className="text-orange-500" />
                    Giá (VNĐ)
                  </label>
                  <input
                    required
                    type="number"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                    className="h-14 w-full rounded-2xl bg-[#fff7ed] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent focus:bg-white focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                    <ImageIcon size={20} weight="bold" className="text-orange-500" />
                    Link ảnh
                  </label>
                  <input
                    type="url"
                    value={dishForm.image}
                    onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                    className="h-14 w-full rounded-2xl bg-[#fff7ed] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent focus:bg-white focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                    <Note size={20} weight="bold" className="text-orange-500" />
                    Mô tả món ăn
                  </label>
                  <textarea
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl bg-[#fff7ed] p-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent focus:bg-white focus:ring-orange-500/20 resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-4 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setIsDishModalOpen(false)}
                    className="h-16 flex-1 rounded-2xl bg-[#f8f6f1] text-sm font-black text-[#23140c] transition-all hover:bg-black/5"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="h-16 flex-2 rounded-2xl bg-[#23140c] text-sm font-black text-white transition-all hover:bg-orange-500 active:scale-95"
                  >
                    {editingDish ? "Lưu thay đổi" : "Thêm món"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
