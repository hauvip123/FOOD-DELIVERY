"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Storefront,
  MapPin,
  Buildings,
  CookingPot,
  Phone,
  Clock,
  Note,
  Image as ImageIcon,
  CheckCircle,
  WarningCircle,
  FloppyDiskBack
} from "@phosphor-icons/react";
import Link from "next/link";
import { updateRestaurant, getRestaurantById, RestaurantPayload } from "@/lib/restaurant";
import { ApiError } from "@/lib/api";

interface EditRestaurantPageProps {
  params: Promise<{ id: string }>;
}

export default function EditRestaurantPage({ params }: EditRestaurantPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<RestaurantPayload>({
    name: "",
    address: "",
    city: "",
    cuisine: "",
    description: "",
    phoneNumber: "",
    openTime: "08:00",
    closeTime: "22:00",
    imgage: ""
  });

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const data = await getRestaurantById(Number(id));
        setFormData({
          name: data.name,
          address: data.address,
          city: data.city,
          cuisine: data.cuisine,
          description: data.description || "",
          phoneNumber: data.phoneNumber || "",
          openTime: data.openTime,
          closeTime: data.closeTime,
          imgage: data.imgage || ""
        });
      } catch (err) {
        setError("Không thể tải thông tin nhà hàng.");
      } finally {
        setIsFetching(false);
      }
    }
    fetchRestaurant();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateRestaurant(Number(id), formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/manage/restaurants");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-10">
        <Link
          href="/manage/restaurants"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft size={18} weight="bold" />
          Quay lại danh sách
        </Link>
        <h1 className="text-4xl font-black tracking-tighter text-[#23140c]">
          Chỉnh sửa nhà hàng
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-black/5 sm:p-12"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 rounded-full bg-emerald-50 p-6 text-emerald-500">
              <CheckCircle size={80} weight="fill" />
            </div>
            <h2 className="text-3xl font-black text-[#23140c]">Cập nhật thành công!</h2>
            <p className="mt-4 text-lg font-medium text-[#23140c]/40">
              Thông tin nhà hàng đã được cập nhật. Đang chuyển hướng...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-6 text-red-600 ring-1 ring-red-100">
                <WarningCircle size={24} weight="fill" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <Storefront size={20} weight="bold" className="text-orange-500" />
                  Tên nhà hàng
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <CookingPot size={20} weight="bold" className="text-orange-500" />
                  Loại hình ẩm thực
                </label>
                <input
                  required
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <MapPin size={20} weight="bold" className="text-orange-500" />
                  Địa chỉ cụ thể
                </label>
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <Buildings size={20} weight="bold" className="text-orange-500" />
                  Thành phố
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <Phone size={20} weight="bold" className="text-orange-500" />
                  Số điện thoại liên hệ
                </label>
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <Clock size={20} weight="bold" className="text-orange-500" />
                  Giờ mở cửa
                </label>
                <input
                  required
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <Clock size={20} weight="bold" className="text-orange-500" />
                  Giờ đóng cửa
                </label>
                <input
                  required
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <ImageIcon size={20} weight="bold" className="text-orange-500" />
                  Link ảnh nhà hàng
                </label>
                <input
                  type="url"
                  name="imgage"
                  value={formData.imgage}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl bg-[#fffcf8] px-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-black text-[#23140c]">
                  <Note size={20} weight="bold" className="text-orange-500" />
                  Mô tả ngắn
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-2xl bg-[#fffcf8] p-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-500/20 resize-none"
                ></textarea>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="group flex h-16 w-full items-center justify-center gap-4 rounded-2xl bg-[#23140c] text-lg font-black text-white shadow-xl transition-all hover:bg-orange-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Lưu thay đổi
                  <FloppyDiskBack size={20} weight="bold" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
