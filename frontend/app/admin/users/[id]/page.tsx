"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Envelope,
  MapPin,
  Phone,
  ShieldCheck,
  Storefront,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  AdminUserDetail,
  getAdminUserDetail,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/lib/admin";
import { ApiError } from "@/lib/api";

const roleOptions = [
  { value: "customer", label: "Khách hàng" },
  { value: "restaurant", label: "Chủ nhà hàng" },
  { value: "admin", label: "Admin" },
];

const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function roleLabel(role: string) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}

function statusLabel(status: string) {
  return statusOptions.find((item) => item.value === status)?.label ?? status;
}

function statusClass(status: string) {
  if (status === "active") return "bg-emerald-50 text-emerald-600 ring-emerald-100";
  return "bg-slate-50 text-slate-500 ring-slate-100";
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const isInvalidUserId = Number.isNaN(userId);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [selectedRole, setSelectedRole] = useState("customer");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadUser() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await getAdminUserDetail(userId);
        if (isCurrentRequest) {
          setUser(data);
          setSelectedRole(data.role);
          setSelectedStatus(data.status);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải thông tin người dùng.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    if (isInvalidUserId) {
      return;
    }

    loadUser();

    return () => {
      isCurrentRequest = false;
    };
  }, [isInvalidUserId, userId]);

  const hasChanges = useMemo(() => {
    return Boolean(user && (selectedRole !== user.role || selectedStatus !== user.status));
  }, [selectedRole, selectedStatus, user]);

  async function handleSave() {
    if (!user || !hasChanges) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let updatedUser = user;

      if (selectedRole !== user.role) {
        const roleUser = await updateAdminUserRole(user.id, selectedRole);
        updatedUser = { ...updatedUser, ...roleUser };
      }

      if (selectedStatus !== updatedUser.status) {
        const statusUser = await updateAdminUserStatus(user.id, selectedStatus);
        updatedUser = { ...updatedUser, ...statusUser };
      }

      setUser(updatedUser);
      setSelectedRole(updatedUser.role);
      setSelectedStatus(updatedUser.status);
      setSuccessMessage("Đã cập nhật tài khoản người dùng.");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật người dùng.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isInvalidUserId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="grid size-20 place-items-center rounded-3xl bg-red-50 text-red-500">
          <WarningCircle size={40} weight="bold" />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-[#1c1917]">Không mở được người dùng</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">Mã người dùng không hợp lệ.</p>
        <Link href="/admin/users" className="mt-8 flex h-12 items-center gap-2 rounded-2xl bg-[#1c1917] px-6 text-sm font-black text-white transition-transform active:scale-95">
          <ArrowLeft size={18} weight="bold" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="h-12 w-44 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="h-[32rem] animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" />
          <div className="h-[32rem] animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" />
        </div>
      </div>
    );
  }

  if (errorMessage && !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="grid size-20 place-items-center rounded-3xl bg-red-50 text-red-500">
          <WarningCircle size={40} weight="bold" />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-[#1c1917]">Không mở được người dùng</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">{errorMessage}</p>
        <Link href="/admin/users" className="mt-8 flex h-12 items-center gap-2 rounded-2xl bg-[#1c1917] px-6 text-sm font-black text-white transition-transform active:scale-95">
          <ArrowLeft size={18} weight="bold" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/admin/users" className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:border-orange-200 hover:text-orange-600 active:scale-95">
          <ArrowLeft size={16} weight="bold" />
          Người dùng
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {successMessage && (
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-50 px-4 text-xs font-black text-emerald-600 ring-1 ring-emerald-100">
              <CheckCircle size={16} weight="bold" />
              {successMessage}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex h-12 items-center justify-center rounded-2xl bg-[#1c1917] px-6 text-sm font-black text-white shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-[2rem] bg-orange-50 text-orange-200 ring-8 ring-slate-50">
              {user.avatar ? (
                <div className="size-full bg-cover bg-center" style={{ backgroundImage: "url(" + user.avatar + ")" }} aria-label={user.username} />
              ) : (
                <UserCircle size={72} weight="fill" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-4xl font-black tracking-tight text-[#1c1917]">{user.username}</h1>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600 ring-1 ring-orange-100">
                  {roleLabel(user.role)}
                </span>
                <span className={"rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 " + statusClass(user.status)}>
                  {statusLabel(user.status)}
                </span>
              </div>
              <div className="mt-5 grid gap-3 text-sm font-bold text-slate-500 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Envelope size={18} weight="bold" className="text-slate-300" />
                  <span className="min-w-0 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} weight="bold" className="text-slate-300" />
                  <span>{user.phoneNumber ?? "Chưa có số điện thoại"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} weight="bold" className="text-slate-300" />
                  <span>Tạo lúc {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} weight="bold" className="text-slate-300" />
                  <span>Cập nhật {formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-slate-100 pt-8 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID</p>
              <p className="mt-2 font-mono text-2xl font-black text-[#1c1917]">#{user.id}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhà hàng</p>
              <p className="mt-2 font-mono text-2xl font-black text-[#1c1917]">{user.restaurants.length}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</p>
              <p className="mt-2 text-lg font-black text-[#1c1917]">{statusLabel(user.status)}</p>
            </div>
          </div>
        </section>

        <aside className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-orange-50 text-orange-600">
              <ShieldCheck size={22} weight="bold" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#1c1917]">Quyền truy cập</h2>
              <p className="text-xs font-bold text-slate-400">Chỉnh vai trò và trạng thái tài khoản</p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Vai trò</span>
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="h-14 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 text-sm font-black text-[#1c1917] outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Trạng thái hoạt động</span>
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="h-14 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 text-sm font-black text-[#1c1917] outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            {errorMessage && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {errorMessage}
              </div>
            )}
          </div>
        </aside>
      </div>

      <section className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1c1917]">Nhà hàng liên kết</h2>
            <p className="mt-1 text-xs font-bold text-slate-400">Các nhà hàng thuộc tài khoản này</p>
          </div>
          <Storefront size={24} weight="bold" className="text-slate-300" />
        </div>

        {user.restaurants.length === 0 ? (
          <div className="mt-8 flex h-40 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
            Chưa có nhà hàng liên kết
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {user.restaurants.map((restaurant) => (
              <div key={restaurant.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-[#1c1917]">{restaurant.name}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-400">{restaurant.cuisine}</p>
                  </div>
                  <span className={"rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest " + (restaurant.isOpen ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500")}>
                    {restaurant.isOpen ? "Đang mở" : "Tạm nghỉ"}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <MapPin size={15} weight="bold" />
                  <span>{restaurant.address}, {restaurant.city}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
