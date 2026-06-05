"use client";

import { FormEvent, useState } from "react";
import { CheckCircle, FloppyDisk, ImageSquare, Phone, UserCircle } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { updateMyProfile } from "@/lib/user";
import { useAuth } from "@/contexts/AuthContext";

export function ProfileUpdateForm() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const updatedUser = await updateMyProfile({
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || null,
        avatar: avatar.trim() || null,
      });
      updateUser(updatedUser);
      setMessage("Đã cập nhật thông tin tài khoản.");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể cập nhật tài khoản.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-5 shadow-[0_20px_50px_-28px_rgba(35,20,12,0.24)] ring-1 ring-black/5 sm:p-7">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Cập nhật</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">Chỉnh sửa thông tin</h2>
        </div>
        <UserCircle size={30} weight="bold" className="text-[#704322]/25" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#704322]/45">Tên hiển thị</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            maxLength={100}
            className="h-13 w-full rounded-[1rem] bg-[#fffcf8] px-4 text-sm font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#704322]/45">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            maxLength={255}
            className="h-13 w-full rounded-[1rem] bg-[#fffcf8] px-4 text-sm font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#704322]/45">Số điện thoại</span>
          <div className="relative">
            <Phone size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35" />
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              maxLength={30}
              className="h-13 w-full rounded-[1rem] bg-[#fffcf8] pl-11 pr-4 text-sm font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-orange-100"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#704322]/45">Avatar URL</span>
          <div className="relative">
            <ImageSquare size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#704322]/35" />
            <input
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
              maxLength={500}
              placeholder="https://..."
              className="h-13 w-full rounded-[1rem] bg-[#fffcf8] pl-11 pr-4 text-sm font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all placeholder:text-[#704322]/35 focus:bg-white focus:ring-orange-100"
            />
          </div>
        </label>
      </div>

      {errorMessage && (
        <p className="mt-5 rounded-[1rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
          {errorMessage}
        </p>
      )}
      {message && (
        <p className="mt-5 flex items-center gap-2 rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
          <CheckCircle size={18} weight="bold" />
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[#23140c] px-5 text-sm font-black text-white transition-all hover:bg-[#ff6b00] disabled:pointer-events-none disabled:opacity-60 active:scale-95 sm:w-auto"
      >
        <FloppyDisk size={18} weight="bold" />
        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
