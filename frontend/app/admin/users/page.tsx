"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Funnel,
  DotsThreeVertical,
  UserCircle,
  Envelope,
  Phone,
  Calendar,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminUsers } from "@/lib/admin";
import RoleBadge from "@/components/admin/RoleBadge";
import UserStatusBadge from "@/components/admin/UserStatusBadge";
import Skeleton from "@/components/admin/Skeleton";
import ErrorMesage from "@/components/admin/ErrorMesage";
import {
  formatDate,
  listContainerVariants,
  listItemVariants,
} from "@/components/admin/type";
import { useQuery } from "@tanstack/react-query";

// --- Sub-components ---

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
    staleTime: 60 * 1000,
  });
  const isLoading = usersQuery.isLoading;
  const errorMessage =
    usersQuery.error instanceof Error ? usersQuery.error.message : "";
  const filteredUsers = useMemo(() => {
    const users = usersQuery.data ?? [];
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersQuery.data, searchQuery, roleFilter, statusFilter]);

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
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">
              Hệ thống
            </p>
          </motion.div>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-stone-900">
            Người dùng
          </h1>
          <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-slate-400">
            Quản lý tất cả tài khoản người dùng, phân quyền và theo dõi trạng
            thái hoạt động của các thành viên.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-3xl border border-slate-200 bg-white pl-12 pr-6 text-sm font-bold text-stone-900 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 md:w-80"
              />
            </div>

            <div className="relative group/filter">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-14 cursor-pointer appearance-none rounded-3xl border border-slate-200 bg-white pl-12 pr-10 text-sm font-black text-stone-900 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="restaurant">Nhà hàng</option>
                <option value="admin">Admin</option>
              </select>
              <Funnel className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-[1.25rem] border border-slate-200 bg-white p-1 shadow-sm md:w-md">
            {statusFilterOptions.map((option) => {
              const isSelected = statusFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={
                    "h-11 rounded-2xl px-3 text-xs font-black transition-all active:scale-[0.98] " +
                    (isSelected
                      ? "bg-stone-900 text-white shadow-lg shadow-slate-200"
                      : "text-slate-400 hover:bg-slate-50 hover:text-stone-900")
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Users List / Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <Skeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50 text-center">
            <div className="grid size-20 place-items-center rounded-3xl bg-slate-100 text-slate-300">
              <UserCircle size={48} weight="bold" />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-stone-900">
              Không tìm thấy người dùng
            </h2>
            <p className="mt-2 text-slate-400 font-bold">
              Hãy thử tìm kiếm với từ khóa khác.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col items-start gap-4 rounded-[2.5rem] border border-slate-200/60 bg-white p-6 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_25px_50px_-20px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:gap-8"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="size-16 rounded-3xl bg-orange-50 grid place-items-center text-orange-200 overflow-hidden ring-4 ring-slate-50 transition-transform group-hover:scale-105">
                    {user.avatar ? (
                      <div
                        className="size-full bg-cover bg-center"
                        style={{ backgroundImage: "url(" + user.avatar + ")" }}
                        aria-label={user.username}
                      />
                    ) : (
                      <UserCircle size={40} weight="fill" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                </div>

                {/* Info Main */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-xl font-black tracking-tight text-stone-900 group-hover:text-orange-600 transition-colors">
                      {user.username}
                    </h3>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Envelope size={14} weight="bold" />
                      {user.email}
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Phone size={14} weight="bold" />
                        {user.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex w-full items-center justify-between border-t border-slate-50 pt-4 md:w-auto md:flex-col md:items-end md:border-t-0 md:pt-0">
                  <UserStatusBadge status={user.status} />
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    <Calendar size={12} weight="bold" />
                    Gia nhập {formatDate(user.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <Link
                  href={"/admin/users/" + user.id}
                  aria-label={"Xem chi tiết " + user.username}
                  className="absolute right-6 top-6 grid size-10 place-items-center rounded-2xl text-slate-300 transition-all hover:bg-slate-50 hover:text-stone-900 md:static"
                >
                  <DotsThreeVertical size={24} weight="bold" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
